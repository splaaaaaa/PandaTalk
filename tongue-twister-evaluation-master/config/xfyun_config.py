# -*- coding: utf-8 -*-
"""
讯飞语音测评API配置文件

讯飞语音测评API是科大讯飞提供的语音评测服务，主要用于：
1. 发音准确度评测
2. 流利度评测  
3. 完整度评测
4. 语调评测

使用前需要在讯飞开放平台申请应用并获取以下信息：
- APPID: 应用ID
- APISecret: API密钥
- APIKey: API Key
"""

import os
from typing import Dict, Any

try:
    from .api_keys import XFYUN_APPID, XFYUN_API_SECRET, XFYUN_API_KEY
except ImportError:
    # 如果api_keys.py不存在，使用环境变量或默认值
    XFYUN_APPID = os.getenv('XFYUN_APPID', 'your_app_id_here')
    XFYUN_API_SECRET = os.getenv('XFYUN_API_SECRET', 'your_api_secret_here')
    XFYUN_API_KEY = os.getenv('XFYUN_API_KEY', 'your_api_key_here')

class XFYunConfig:
    """讯飞语音评测API配置类"""
    
    def __init__(self):
        # 讯飞开放平台应用信息 - 从api_keys.py文件或环境变量读取
        self.APPID = XFYUN_APPID
        self.API_SECRET = XFYUN_API_SECRET
        self.API_KEY = XFYUN_API_KEY
        
        # API接口地址
        self.BASE_URL = "wss://ise-api.xfyun.cn/v2/open-ise"
        
        # 音频参数配置
        self.AUDIO_CONFIG = {
            'format': 'audio/L16;rate=16000',  # 音频格式：16kHz采样率的PCM
            'encoding': 'raw',                 # 音频编码
            'channels': 1,                     # 单声道
            'sample_rate': 16000,              # 采样率
            'sample_width': 2,                 # 采样位宽（字节）
        }
        
        # 评测参数配置
        self.EVALUATION_CONFIG = {
            'category': 'read_sentence',       # 评测类型：句子朗读
            'language': 'zh_cn',              # 语言：中文
            'ent': 'cn_vip',                  # 引擎类型
            'cmd': 'ssb',                     # 命令类型
            'tte': 'utf-8',                   # 文本编码
        }
        
        # 评分等级配置
        self.SCORE_LEVELS = {
            'excellent': {'min': 90, 'max': 100, 'label': '优秀'},
            'good': {'min': 80, 'max': 89, 'label': '良好'},
            'fair': {'min': 70, 'max': 79, 'label': '一般'},
            'poor': {'min': 0, 'max': 69, 'label': '需要改进'}
        }
    
    def get_auth_params(self) -> Dict[str, str]:
        """获取认证参数"""
        return {
            'appid': self.APPID,
            'api_secret': self.API_SECRET,
            'api_key': self.API_KEY
        }
    
    def get_audio_params(self) -> Dict[str, Any]:
        """获取音频参数"""
        return self.AUDIO_CONFIG.copy()
    
    def get_evaluation_params(self, text: str) -> Dict[str, Any]:
        """获取评测参数
        
        Args:
            text: 要评测的文本内容（绕口令）
            
        Returns:
            评测参数字典
        """
        params = self.EVALUATION_CONFIG.copy()
        params['text'] = text
        return params
    
    def validate_config(self) -> bool:
        """验证配置是否完整
        
        Returns:
            配置是否有效
        """
        required_fields = [self.APPID, self.API_SECRET, self.API_KEY]
        default_values = ['your_app_id_here', 'your_api_secret_here', 'your_api_key_here']
        return all(field and field not in default_values for field in required_fields)

# 全局配置实例
config = XFYunConfig()

# 使用说明
if __name__ == "__main__":
    print("讯飞语音测评API配置说明：")
    print("1. 访问 https://www.xfyun.cn/ 注册账号")
    print("2. 创建语音评测应用获取APPID、APISecret、APIKey")
    print("3. 设置环境变量或直接修改配置文件")
    print(f"4. 当前配置状态: {'✓ 已配置' if config.validate_config() else '✗ 未配置'}")