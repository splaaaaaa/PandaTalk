# -*- coding: utf-8 -*-
"""
讯飞语音测评API客户端

这个模块封装了与讯飞语音测评API的WebSocket通信逻辑。

讯飞API使用WebSocket协议进行实时通信：
1. 建立WebSocket连接
2. 发送认证和配置信息
3. 分块发送音频数据
4. 接收评测结果
5. 关闭连接

认证机制使用HMAC-SHA256签名算法确保安全性。
"""

import asyncio
import websockets
import json
import base64
import hmac
import hashlib
import time
from datetime import datetime
from urllib.parse import urlencode
from typing import Dict, Any, Optional, Callable
import logging

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from config.xfyun_config import config

class XFYunClient:
    """讯飞语音测评API客户端
    
    这个类负责：
    1. WebSocket连接管理
    2. 认证签名生成
    3. 音频数据传输
    4. 结果接收和解析
    """
    
    def __init__(self):
        self.websocket = None
        self.session_id = None
        self.logger = logging.getLogger(__name__)
        
    def _generate_signature(self, method: str = "GET") -> str:
        """生成API认证签名
        
        讯飞API使用HMAC-SHA256算法生成签名：
        1. 构造签名字符串
        2. 使用API Secret进行HMAC-SHA256加密
        3. Base64编码得到最终签名
        
        Args:
            method: HTTP方法，默认GET
            
        Returns:
            生成的签名字符串
        """
        # RFC1123格式的时间戳
        date = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
        
        # 构造签名字符串
        signature_string = f"host: ise-api.xfyun.cn\n"
        signature_string += f"date: {date}\n"
        signature_string += f"{method} /v2/open-ise HTTP/1.1"
        
        # HMAC-SHA256加密
        signature = hmac.new(
            config.API_SECRET.encode('utf-8'),
            signature_string.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Base64编码
        signature_b64 = base64.b64encode(signature).decode('utf-8')
        
        # 构造Authorization头
        authorization = f'api_key="{config.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="{signature_b64}"'
        
        # 构造完整的认证URL
        auth_params = {
            'authorization': base64.b64encode(authorization.encode('utf-8')).decode('utf-8'),
            'date': date,
            'host': 'ise-api.xfyun.cn'
        }
        
        return f"{config.BASE_URL}?{urlencode(auth_params)}"
    
    async def connect(self) -> bool:
        """建立WebSocket连接
        
        Returns:
            连接是否成功
        """
        try:
            # 生成认证URL
            auth_url = self._generate_signature()
            
            # 建立WebSocket连接，设置更长的超时时间
            self.websocket = await websockets.connect(
                auth_url,
                ping_interval=20,
                ping_timeout=10,
                close_timeout=10
            )
            self.logger.info("WebSocket连接已建立")
            return True
            
        except Exception as e:
            self.logger.error(f"WebSocket连接失败: {e}")
            return False
    
    async def send_config(self, text: str) -> bool:
        """发送评测配置信息
        
        Args:
            text: 要评测的绕口令文本
            
        Returns:
            配置发送是否成功
        """
        if not self.websocket:
            self.logger.error("WebSocket连接未建立")
            return False
        
        try:
            # 构造配置消息 - 根据讯飞API文档格式
            config_data = {
                "common": {
                    "app_id": config.APPID
                },
                "business": {
                    "sub": "ise",                    # 服务类型指定
                    "ent": "cn_vip",                # 中文引擎
                    "category": "read_sentence",     # 句子朗读
                    "cmd": "ssb",                   # 参数上传阶段
                    "text": f"\uFEFF{text}",        # 待评测文本，需要加utf8bom头
                    "tte": "utf-8",                # 文本编码
                    "ttp_skip": True,               # 跳过ttp直接使用ssb中的文本
                    "aue": "raw",                   # 音频格式
                    "auf": "audio/L16;rate=16000",  # 音频采样率
                    "aus": 1                        # 音频状态：1-第一帧音频
                },
                "data": {
                    "status": 0  # 第一次为0
                }
            }
            
            # 发送配置
            await self.websocket.send(json.dumps(config_data))
            self.logger.info(f"评测配置已发送: {text[:20]}...")
            return True
            
        except Exception as e:
            self.logger.error(f"发送配置失败: {e}")
            return False
    
    async def send_audio_chunk(self, audio_data: bytes, is_last: bool = False) -> bool:
        """发送音频数据块
        
        Args:
            audio_data: 音频数据（PCM格式）
            is_last: 是否为最后一块数据
            
        Returns:
            发送是否成功
        """
        if not self.websocket:
            self.logger.error("WebSocket连接未建立")
            return False
        
        try:
            # Base64编码音频数据
            audio_b64 = base64.b64encode(audio_data).decode('utf-8')
            
            # 构造音频消息 - 按照官方demo格式
            audio_message = {
                "business": {
                    "aue": "raw",
                    "cmd": "auw",
                    "aus": 4 if is_last else 2,  # 2: 中间音频块，4: 最后一个音频块
                },
                "data": {
                    "status": 2 if is_last else 1,  # 1: 中间帧，2: 尾帧
                    "data": audio_b64,  # 音频数据
                    "data_type": 1  # 数据类型
                }
            }
            
            # 发送音频数据
            await self.websocket.send(json.dumps(audio_message))
            self.logger.debug(f"音频数据已发送: {len(audio_data)} bytes")
            return True
            
        except Exception as e:
            self.logger.error(f"发送音频数据失败: {e}")
            return False
    
    async def receive_result(self, callback: Optional[Callable] = None) -> Dict[str, Any]:
        """接收评测结果
        
        Args:
            callback: 结果回调函数
            
        Returns:
            评测结果字典
        """
        if not self.websocket:
            self.logger.error("WebSocket连接未建立")
            return {}
        
        results = []
        
        try:
            # 设置接收超时时间为30秒
            timeout = 30
            start_time = time.time()
            
            # 持续接收消息直到连接关闭或超时
            async for message in self.websocket:
                try:
                    # 检查是否超时
                    if time.time() - start_time > timeout:
                        self.logger.warning("接收结果超时")
                        break
                    
                    # 检查消息是否为空或无效
                    if message is None or message == '':
                        self.logger.debug("收到空消息，跳过")
                        continue
                    
                    self.logger.debug(f"收到消息: {message[:200]}...")  # 只显示前200字符
                    data = json.loads(message)
                    
                    # 检查是否有错误
                    if data.get('code') != 0:
                        error_msg = data.get('message', '未知错误')
                        self.logger.error(f"API返回错误: {error_msg}")
                        break
                    
                    # 解析评测结果
                    if 'data' in data and 'data' in data['data'] and data['data']['data'] is not None:
                        # data['data']['data'] 是base64编码的XML数据，需要解码
                        import base64
                        try:
                            xml_data = base64.b64decode(data['data']['data']).decode('utf-8')
                            self.logger.debug(f"解码后的XML数据: {xml_data[:500]}...")  # 只显示前500字符
                        except UnicodeDecodeError:
                            # 尝试使用gbk编码
                            try:
                                xml_data = base64.b64decode(data['data']['data']).decode('gbk')
                                self.logger.debug(f"使用GBK解码后的XML数据: {xml_data[:500]}...")  # 只显示前500字符
                            except UnicodeDecodeError:
                                # 如果都失败，使用错误处理
                                xml_data = base64.b64decode(data['data']['data']).decode('utf-8', errors='ignore')
                                self.logger.debug(f"使用忽略错误解码后的XML数据: {xml_data[:500]}...")  # 只显示前500字符
                        
                        # 解析XML数据
                        parsed_result = self._parse_xml_result(xml_data)
                        
                        # 将解析后的结果和原始数据一起保存
                        result_data = {
                            'parsed_result': parsed_result,
                            'xml_data': xml_data,
                            'raw_response': data
                        }
                        results.append(result_data)
                        
                        # 调用回调函数
                        if callback:
                            callback(result_data)
                    else:
                        # 如果data为null，记录但继续等待
                        self.logger.debug(f"收到状态消息，data为null，继续等待结果")
                        results.append(data)  # 保存状态信息
                    
                    # 检查是否为最后一帧
                    if data.get('data', {}).get('status') == 2:
                        self.logger.info("收到最后一帧数据")
                        break
                        
                except json.JSONDecodeError as e:
                    self.logger.error(f"解析响应JSON失败: {e}")
                    self.logger.error(f"原始响应内容: {repr(message)}")
                    continue
        
        except websockets.exceptions.ConnectionClosed as e:
            self.logger.warning(f"WebSocket连接已关闭: {e}")
        except Exception as e:
            self.logger.error(f"接收结果失败: {e}")
        
        return self._merge_results(results)
    
    def _parse_xml_result(self, xml_data: str) -> Dict[str, Any]:
        """解析XML评测结果
        
        Args:
            xml_data: XML格式的评测结果
            
        Returns:
            Dict: 解析后的评测结果
        """
        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_data)
            
            # 查找rec_paper下的read_sentence节点（包含实际评分数据）
            read_sentence = root.find('.//rec_paper/read_sentence')
            if read_sentence is None:
                self.logger.warning("未找到rec_paper/read_sentence节点")
                # 尝试查找任何read_sentence节点作为备选
                read_sentence = root.find('.//read_sentence')
                if read_sentence is None:
                    self.logger.warning("未找到任何read_sentence节点")
                    return {}
            
            # 提取评分信息
            result = {
                'accuracy_score': float(read_sentence.get('accuracy_score', 0)),
                'fluency_score': float(read_sentence.get('fluency_score', 0)),
                'integrity_score': float(read_sentence.get('integrity_score', 0)),
                'phone_score': float(read_sentence.get('phone_score', 0)),
                'tone_score': float(read_sentence.get('tone_score', 0)),
                'emotion_score': float(read_sentence.get('emotion_score', 0)),
                'total_score': float(read_sentence.get('total_score', 0)),
                'is_rejected': read_sentence.get('is_rejected', 'false') == 'true',
                'except_info': read_sentence.get('except_info', '')
            }
            
            # 提取单词详细信息和错误分析
            words = []
            for sentence in read_sentence.findall('.//sentence'):
                for word in sentence.findall('word'):
                    word_info = {
                        'content': word.get('content', ''),
                        'symbol': word.get('symbol', ''),
                        'beg_pos': int(word.get('beg_pos', 0)),
                        'end_pos': int(word.get('end_pos', 0)),
                        'time_len': int(word.get('time_len', 0)),
                        'errors': []  # 存储发音错误信息
                    }
                    
                    # 分析音素级别的错误
                    for syll in word.findall('syll'):
                        for phone in syll.findall('phone'):
                            perr_msg = phone.get('perr_msg', '0')
                            if perr_msg != '0':
                                error_info = {
                                    'phone_content': phone.get('content', ''),
                                    'error_level': int(perr_msg),
                                    'is_yun': phone.get('is_yun', '0') == '1',
                                    'tone': phone.get('mono_tone', ''),
                                    'error_type': self._get_error_type(int(perr_msg))
                                }
                                word_info['errors'].append(error_info)
                    
                    words.append(word_info)
            
            result['words'] = words
            return result
            
        except Exception as e:
            self.logger.error(f"解析XML结果失败: {e}")
            return {}
    
    def _get_error_type(self, error_level: int) -> str:
        """根据错误级别返回错误类型描述
        
        Args:
            error_level: 错误级别 (1-3)
            
        Returns:
            错误类型描述
        """
        error_types = {
            1: "轻微错误",
            2: "明显错误", 
            3: "严重错误"
        }
        return error_types.get(error_level, "未知错误")
    
    def _merge_results(self, results: list) -> Dict[str, Any]:
        """合并多帧评测结果
        
        Args:
            results: 结果列表
            
        Returns:
            合并后的完整结果
        """
        if not results:
            return {
                'overall_score': 0,
                'pronunciation_score': 0,
                'fluency_score': 0,
                'integrity_score': 0,
                'tone_score': 0,
                'accuracy_score': 0,
                'emotion_score': 0,
                'word_details': [],
                'is_rejected': False,
                'except_info': '',
                'raw_result': {}
            }
        
        # 查找包含解析结果的帧
        final_parsed_result = None
        final_raw_result = None
        
        for result in results:
            if 'parsed_result' in result and result['parsed_result']:
                final_parsed_result = result['parsed_result']
                final_raw_result = result['raw_response']
                break
        
        # 如果没有找到解析结果，返回默认值
        if not final_parsed_result:
            return {
                'overall_score': 0,
                'pronunciation_score': 0,
                'fluency_score': 0,
                'integrity_score': 0,
                'tone_score': 0,
                'accuracy_score': 0,
                'emotion_score': 0,
                'word_details': [],
                'is_rejected': False,
                'except_info': '',
                'raw_result': final_raw_result or {}
            }
        
        # 构建最终结果
        merged_result = {
            'overall_score': final_parsed_result.get('total_score', 0),
            'pronunciation_score': final_parsed_result.get('phone_score', 0),
            'fluency_score': final_parsed_result.get('fluency_score', 0),
            'integrity_score': final_parsed_result.get('integrity_score', 0),
            'tone_score': final_parsed_result.get('tone_score', 0),
            'accuracy_score': final_parsed_result.get('accuracy_score', 0),
            'emotion_score': final_parsed_result.get('emotion_score', 0),
            'word_details': final_parsed_result.get('words', []),
            'is_rejected': final_parsed_result.get('is_rejected', False),
            'except_info': final_parsed_result.get('except_info', ''),
            'raw_result': final_raw_result or {}
        }
        
        return merged_result
    
    async def close(self):
        """关闭WebSocket连接"""
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
            self.logger.info("WebSocket连接已关闭")
    
    async def evaluate_speech(self, text: str, audio_data: bytes, 
                            chunk_size: int = 1280) -> Dict[str, Any]:
        """完整的语音评测流程
        
        这是一个便捷方法，封装了完整的评测流程：
        1. 建立连接
        2. 发送配置
        3. 分块发送音频
        4. 接收结果
        5. 关闭连接
        
        Args:
            text: 绕口令文本
            audio_data: 音频数据（PCM格式）
            chunk_size: 音频分块大小（字节）
            
        Returns:
            评测结果
        """
        try:
            # 1. 建立连接
            if not await self.connect():
                return {'error': '连接失败'}
            
            # 2. 发送配置
            if not await self.send_config(text):
                return {'error': '配置发送失败'}
            
            # 3. 分块发送音频数据
            for i in range(0, len(audio_data), chunk_size):
                chunk = audio_data[i:i + chunk_size]
                is_last = (i + chunk_size >= len(audio_data))
                
                if not await self.send_audio_chunk(chunk, is_last):
                    return {'error': '音频发送失败'}
                
                # 避免发送过快
                await asyncio.sleep(0.04)  # 40ms间隔
            
            # 4. 接收结果
            result = await self.receive_result()
            
            return result
            
        except Exception as e:
            self.logger.error(f"语音评测失败: {e}")
            return {'error': str(e)}
            
        finally:
            # 5. 关闭连接
            await self.close()

# 使用示例
if __name__ == "__main__":
    async def test_client():
        client = XFYunClient()
        
        # 测试文本
        test_text = "四是四，十是十，十四是十四，四十是四十"
        
        # 模拟音频数据（实际使用时需要真实的PCM音频数据）
        test_audio = b'\x00' * 32000  # 2秒的静音数据
        
        result = await client.evaluate_speech(test_text, test_audio)
        print(f"评测结果: {result}")
    
    # 运行测试
    # asyncio.run(test_client())
    print("讯飞API客户端已就绪，请配置API密钥后使用")