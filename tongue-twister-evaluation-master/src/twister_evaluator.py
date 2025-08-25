# -*- coding: utf-8 -*-
"""
绕口令评测器主模块

这是整个绕口令评测系统的核心模块，整合了：
- 讯飞语音API客户端
- 音频处理器
- 评分引擎

提供简单易用的接口，让用户可以轻松进行绕口令评测。

使用流程：
1. 创建评测器实例
2. 选择绕口令文本
3. 开始录音
4. 停止录音并获取评测结果
5. 查看详细反馈和建议
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Callable
from pathlib import Path
import json
from datetime import datetime

from .api.xfyun_client import XFYunClient
from .audio.audio_processor import AudioProcessor
from .scoring.score_engine import ScoreEngine, EvaluationResult
from .utils.twister_library import TwisterLibrary
from .utils.cache_manager import CacheManager
from .utils.text_visualizer import TextVisualizer

class TwisterEvaluator:
    """绕口令评测器
    
    这是用户主要使用的类，封装了完整的评测流程。
    
    主要功能：
    - 绕口令文本管理
    - 录音控制
    - 语音评测
    - 结果分析
    - 历史记录
    """
    
    def __init__(self, cache_dir: Optional[str] = None):
        """初始化评测器
        
        Args:
            cache_dir: 缓存目录路径
        """
        # 初始化各个组件
        self.api_client = XFYunClient()
        self.audio_processor = AudioProcessor()
        self.score_engine = ScoreEngine()
        self.twister_library = TwisterLibrary()
        self.cache_manager = CacheManager(cache_dir)
        self.text_visualizer = TextVisualizer()
        
        # 状态管理
        self.is_recording = False
        self.current_text = ""
        self.current_difficulty = "初级"
        self._last_recording_data = None
        
        # 配置日志
        self.logger = logging.getLogger(__name__)
        
        # 回调函数
        self.on_recording_start: Optional[Callable] = None
        self.on_recording_stop: Optional[Callable] = None
        self.on_evaluation_complete: Optional[Callable] = None
        self.on_error: Optional[Callable] = None
    
    def get_available_twisters(self, difficulty: str = "全部") -> List[Dict[str, Any]]:
        """获取可用的绕口令列表
        
        Args:
            difficulty: 难度级别（初级/中级/高级/全部）
            
        Returns:
            绕口令列表
        """
        return self.twister_library.get_twisters_by_difficulty(difficulty)
    
    def get_twister_by_id(self, twister_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取绕口令
        
        Args:
            twister_id: 绕口令ID
            
        Returns:
            绕口令信息
        """
        return self.twister_library.get_twister_by_id(twister_id)
    
    def select_twister(self, twister_id: str) -> bool:
        """选择要练习的绕口令
        
        Args:
            twister_id: 绕口令ID
            
        Returns:
            选择是否成功
        """
        twister = self.get_twister_by_id(twister_id)
        if twister:
            self.current_text = twister['text']
            self.current_difficulty = twister['difficulty']
            self.logger.info(f"已选择绕口令: {twister['title']}")
            return True
        else:
            self.logger.error(f"未找到绕口令: {twister_id}")
            return False
    
    def get_audio_devices(self) -> List[Dict[str, Any]]:
        """获取可用的音频设备列表
        
        Returns:
            音频设备列表
        """
        return self.audio_processor.list_audio_devices()
    
    def start_recording(self, device_index: Optional[int] = None) -> bool:
        """开始录音
        
        Args:
            device_index: 音频设备索引
            
        Returns:
            录音是否成功开始
        """
        if not self.current_text:
            self.logger.error("请先选择绕口令")
            if self.on_error:
                self.on_error("请先选择绕口令")
            return False
        
        if self.is_recording:
            self.logger.warning("录音已在进行中")
            return False
        
        # 开始录音
        success = self.audio_processor.start_recording(device_index)
        
        if success:
            self.is_recording = True
            self.logger.info("录音已开始")
            
            # 触发回调
            if self.on_recording_start:
                self.on_recording_start()
        else:
            self.logger.error("录音启动失败")
            if self.on_error:
                self.on_error("录音启动失败")
        
        return success
    
    def stop_recording(self) -> bool:
        """停止录音
        
        Returns:
            停止是否成功
        """
        if not self.is_recording:
            self.logger.warning("当前没有在录音")
            return False
        
        # 停止录音
        audio_data = self.audio_processor.stop_recording()
        self.is_recording = False
        
        # 保存录音数据供后续评测使用
        self._last_recording_data = audio_data
        
        self.logger.info("录音已停止")
        
        # 触发回调
        if self.on_recording_stop:
            self.on_recording_stop(len(audio_data))
        
        return len(audio_data) > 0
    
    async def evaluate_current_recording(self, 
                                       preprocess_audio: bool = True,
                                       save_audio: bool = False,
                                       audio_filename: Optional[str] = None,
                                       audio_data: Optional[bytes] = None) -> Optional[EvaluationResult]:
        """评测当前录音
        
        Args:
            preprocess_audio: 是否预处理音频
            save_audio: 是否保存音频文件
            audio_filename: 音频文件名
            audio_data: 音频数据（如果提供则使用，否则尝试获取最后录音）
            
        Returns:
            评测结果
        """
        if self.is_recording:
            self.logger.error("请先停止录音")
            if self.on_error:
                self.on_error("请先停止录音")
            return None
        
        if not self.current_text:
            self.logger.error("请先选择绕口令")
            if self.on_error:
                self.on_error("请先选择绕口令")
            return None
        
        # 如果没有提供音频数据，尝试获取最后一次录音的数据
        if audio_data is None:
            if not hasattr(self, '_last_recording_data') or not self._last_recording_data:
                self.logger.error("没有录音数据")
                if self.on_error:
                    self.on_error("没有录音数据")
                return None
            audio_data = self._last_recording_data
        
        if not audio_data:
            self.logger.error("没有录音数据")
            if self.on_error:
                self.on_error("没有录音数据")
            return None
        
        try:
            # 1. 音频质量检测
            quality_result = self.audio_processor.analyze_audio_quality(audio_data)
            
            if not quality_result['is_valid']:
                error_msg = f"音频质量不符合要求: {quality_result.get('error', '未知错误')}"
                self.logger.error(error_msg)
                if self.on_error:
                    self.on_error(error_msg)
                return None
            
            # 2. 音频预处理
            if preprocess_audio:
                audio_data = self.audio_processor.preprocess_audio(audio_data)
                self.logger.info("音频预处理完成")
            
            # 3. 保存音频文件（如果需要）
            audio_saved = False
            if save_audio:
                if not audio_filename:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    # 确保保存到recordings目录
                    recordings_dir = Path("recordings")
                    recordings_dir.mkdir(exist_ok=True)
                    audio_filename = recordings_dir / f"recording_{timestamp}.wav"
                else:
                    # 如果提供了文件名，也确保在recordings目录中
                    audio_filename = Path("recordings") / Path(audio_filename).name
                    Path("recordings").mkdir(exist_ok=True)
                
                # 确保目录存在
                audio_path = Path(audio_filename)
                audio_path.parent.mkdir(parents=True, exist_ok=True)
                
                audio_saved = self.audio_processor.save_audio_file(audio_data, str(audio_filename))
                if audio_saved:
                    self.logger.info(f"🎵 录音文件已保存至: {audio_filename}")
                    print(f"🎵 录音文件已保存至: {audio_filename}")
            
            # 4. 调用讯飞API进行评测
            self.logger.info("开始语音评测...")
            
            raw_result = await self.api_client.evaluate_speech(
                self.current_text, 
                audio_data
            )
            
            if 'error' in raw_result:
                error_msg = f"语音评测失败: {raw_result['error']}"
                self.logger.error(error_msg)
                if audio_saved:
                    print(f"⚠️  评测失败，但录音文件已保存至: {audio_filename}")
                if self.on_error:
                    self.on_error(error_msg)
                return None
            
            # 5. 处理评测结果
            duration = quality_result.get('duration', 0)
            evaluation_result = self.score_engine.process_evaluation_result(
                raw_result, 
                self.current_text, 
                duration
            )
            
            # 6. 生成错误可视化文本
            word_details = raw_result.get('word_details', [])
            if word_details:
                # 生成带有错误标记的文本
                visualized_text = self.text_visualizer.visualize_text_with_errors(
                    self.current_text, 
                    word_details
                )
                
                # 生成错误报告
                error_report = self.text_visualizer.generate_error_report(
                    self.current_text, 
                    word_details
                )
                
                # 生成HTML可视化文件
                html_content = self.text_visualizer.generate_html_visualization(
                    self.current_text, 
                    word_details
                )
                
                # 保存HTML文件
                import datetime
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                html_filename = f"evaluation_visualization_{timestamp}.html"
                html_filepath = Path(html_filename)
                
                try:
                    with open(html_filepath, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    self.logger.info(f"HTML可视化文件已生成: {html_filename}")
                except Exception as e:
                    self.logger.error(f"HTML文件生成失败: {e}")
                    html_filename = None
                
                # 将可视化结果添加到评测结果中
                evaluation_result.error_visualization = visualized_text
                evaluation_result.error_report = error_report
                evaluation_result.html_visualization_file = html_filename
            
            # 7. 缓存结果
            self.cache_manager.save_evaluation_result(evaluation_result)
            
            self.logger.info(f"评测完成，总分: {evaluation_result.sentence_score.overall_score:.1f}")
            
            # 触发回调
            if self.on_evaluation_complete:
                self.on_evaluation_complete(evaluation_result)
            
            return evaluation_result
            
        except Exception as e:
            error_msg = f"评测过程中出现错误: {str(e)}"
            self.logger.error(error_msg)
            if self.on_error:
                self.on_error(error_msg)
            return None
    
    async def evaluate_audio_file(self, audio_file_path: str, 
                                text: str) -> Optional[EvaluationResult]:
        """评测音频文件
        
        Args:
            audio_file_path: 音频文件路径
            text: 对应的文本
            
        Returns:
            评测结果
        """
        try:
            # 1. 加载音频文件
            audio_data, file_info = self.audio_processor.load_audio_file(audio_file_path)
            
            if not audio_data:
                self.logger.error("无法加载音频文件")
                return None
            
            # 2. 音频质量检测
            quality_result = self.audio_processor.analyze_audio_quality(audio_data)
            
            if not quality_result['is_valid']:
                self.logger.warning(f"音频质量警告: {quality_result.get('error', '')}")
            
            # 3. 预处理音频
            audio_data = self.audio_processor.preprocess_audio(audio_data)
            
            # 4. 调用API评测
            raw_result = await self.api_client.evaluate_speech(text, audio_data)
            
            if 'error' in raw_result:
                self.logger.error(f"评测失败: {raw_result['error']}")
                return None
            
            # 5. 处理结果
            duration = file_info.get('duration', 0)
            evaluation_result = self.score_engine.process_evaluation_result(
                raw_result, text, duration
            )
            
            return evaluation_result
            
        except Exception as e:
            self.logger.error(f"评测音频文件失败: {e}")
            return None
    
    def get_evaluation_history(self, limit: int = 20) -> List[EvaluationResult]:
        """获取评测历史
        
        Args:
            limit: 返回记录数量限制
            
        Returns:
            历史评测结果列表
        """
        return self.score_engine.history[-limit:] if self.score_engine.history else []
    
    def get_progress_analysis(self) -> Dict[str, Any]:
        """获取进步分析
        
        Returns:
            进步分析结果
        """
        return self.score_engine.get_progress_analysis()
    
    def export_history_to_json(self, filename: str) -> bool:
        """导出历史记录到JSON文件
        
        Args:
            filename: 文件名
            
        Returns:
            导出是否成功
        """
        try:
            history_data = self.score_engine.export_history()
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(history_data, f, ensure_ascii=False, indent=2)
            
            self.logger.info(f"历史记录已导出到: {filename}")
            return True
            
        except Exception as e:
            self.logger.error(f"导出历史记录失败: {e}")
            return False
    
    def clear_history(self) -> bool:
        """清空历史记录
        
        Returns:
            清空是否成功
        """
        try:
            self.score_engine.history.clear()
            self.cache_manager.clear_cache()
            self.logger.info("历史记录已清空")
            return True
        except Exception as e:
            self.logger.error(f"清空历史记录失败: {e}")
            return False
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息
        
        Returns:
            统计信息字典
        """
        history = self.score_engine.history
        
        if not history:
            return {
                'total_attempts': 0,
                'message': '暂无练习记录'
            }
        
        # 计算各种统计信息
        scores = [result.sentence_score.overall_score for result in history]
        difficulties = [result.sentence_score.text for result in history]  # 简化处理
        
        stats = {
            'total_attempts': len(history),
            'average_score': sum(scores) / len(scores),
            'best_score': max(scores),
            'worst_score': min(scores),
            'recent_score': scores[-1],
            'improvement_trend': self._calculate_trend(scores),
            'practice_days': len(set(result.timestamp.date() for result in history)),
            'favorite_difficulty': self._get_most_common_difficulty(difficulties)
        }
        
        return stats
    
    def _calculate_trend(self, scores: List[float]) -> str:
        """计算得分趋势
        
        Args:
            scores: 得分列表
            
        Returns:
            趋势描述
        """
        if len(scores) < 3:
            return "数据不足"
        
        # 简单的趋势计算：比较前三分之一和后三分之一的平均分
        third = len(scores) // 3
        early_avg = sum(scores[:third]) / third
        recent_avg = sum(scores[-third:]) / third
        
        diff = recent_avg - early_avg
        
        if diff > 5:
            return "明显进步"
        elif diff > 2:
            return "稳步提升"
        elif diff > -2:
            return "保持稳定"
        elif diff > -5:
            return "略有下降"
        else:
            return "需要加强"
    
    def _get_most_common_difficulty(self, texts: List[str]) -> str:
        """获取最常练习的难度
        
        Args:
            texts: 文本列表
            
        Returns:
            最常见的难度级别
        """
        # 简化实现，实际应该根据文本查找对应的难度
        return "中级"  # 默认返回
    
    def set_callbacks(self, 
                     on_recording_start: Optional[Callable] = None,
                     on_recording_stop: Optional[Callable] = None,
                     on_evaluation_complete: Optional[Callable] = None,
                     on_error: Optional[Callable] = None):
        """设置回调函数
        
        Args:
            on_recording_start: 录音开始回调
            on_recording_stop: 录音停止回调
            on_evaluation_complete: 评测完成回调
            on_error: 错误回调
        """
        self.on_recording_start = on_recording_start
        self.on_recording_stop = on_recording_stop
        self.on_evaluation_complete = on_evaluation_complete
        self.on_error = on_error
    
    async def evaluate_speech(self, text: str, duration: int = 5) -> Optional[EvaluationResult]:
        """评测语音（录音并评测）
        
        Args:
            text: 要朗读的文本
            duration: 录音时长（秒）
            
        Returns:
            评测结果
        """
        try:
            # 设置当前文本
            self.current_text = text
            
            # 开始录音
            if not self.start_recording():
                return None
            
            # 等待指定时长
            await asyncio.sleep(duration)
            
            # 停止录音
            if not self.stop_recording():
                return None
            
            # 评测录音
            result = await self.evaluate_current_recording(
                audio_data=self._last_recording_data,
                save_audio=save_audio,
                audio_filename=audio_filename
            )
            return result
            
        except Exception as e:
            error_msg = f"语音评测失败: {str(e)}"
            self.logger.error(error_msg)
            if self.on_error:
                self.on_error(error_msg)
            return None
    
    async def evaluate_speech_interactive(self, text: str, save_audio: bool = False, audio_filename: Optional[str] = None) -> Optional[EvaluationResult]:
        """交互式语音评测（按回车键结束录音）
        
        Args:
            text: 要评测的文本
            save_audio: 是否保存音频文件
            audio_filename: 音频文件名（可选）
            
        Returns:
            评测结果
        """
        import threading
        
        try:
            # 设置当前文本
            self.current_text = text
            
            # 开始录音
            if not self.start_recording():
                return None
            
            # 创建一个标志来控制录音结束
            recording_finished = threading.Event()
            
            def wait_for_enter():
                """等待用户按回车键"""
                try:
                    input()  # 等待用户按回车
                    recording_finished.set()
                except:
                    recording_finished.set()
            
            # 在单独的线程中等待用户输入
            input_thread = threading.Thread(target=wait_for_enter, daemon=True)
            input_thread.start()
            
            # 等待用户按回车或录音被中断
            while not recording_finished.is_set() and self.is_recording:
                await asyncio.sleep(0.1)
            
            # 停止录音
            if not self.stop_recording():
                return None
            
            # 评测录音
            result = await self.evaluate_current_recording(
                audio_data=self._last_recording_data,
                save_audio=save_audio,
                audio_filename=audio_filename
            )
            return result
            
        except Exception as e:
            error_msg = f"交互式语音评测失败: {str(e)}"
            self.logger.error(error_msg)
            if self.on_error:
                self.on_error(error_msg)
            return None
    
    def add_history_record(self, record: Dict[str, Any]) -> bool:
        """添加历史记录
        
        Args:
            record: 记录数据
            
        Returns:
            添加是否成功
        """
        try:
            # 这里可以扩展为更复杂的历史记录管理
            self.logger.info(f"添加历史记录: {record.get('twister_title', '未知')}")
            return True
        except Exception as e:
            self.logger.error(f"添加历史记录失败: {e}")
            return False
    
    def __del__(self):
        """析构函数，清理资源"""
        if hasattr(self, 'is_recording') and self.is_recording:
            self.stop_recording()

# 使用示例
if __name__ == "__main__":
    async def main():
        # 创建评测器
        evaluator = TwisterEvaluator()
        
        # 设置回调函数
        def on_start():
            print("🎤 录音开始...")
        
        def on_stop(data_size):
            print(f"⏹️ 录音停止，数据大小: {data_size} 字节")
        
        def on_complete(result):
            print(f"✅ 评测完成！总分: {result.sentence_score.overall_score:.1f}")
            print(f"等级: {result.grade_level}")
            print(f"反馈: {result.feedback_summary}")
        
        def on_error(error):
            print(f"❌ 错误: {error}")
        
        evaluator.set_callbacks(
            on_recording_start=on_start,
            on_recording_stop=on_stop,
            on_evaluation_complete=on_complete,
            on_error=on_error
        )
        
        # 获取可用绕口令
        twisters = evaluator.get_available_twisters("初级")
        print("可用的初级绕口令:")
        for twister in twisters[:3]:  # 显示前3个
            print(f"  - {twister['title']}: {twister['text'][:20]}...")
        
        # 选择第一个绕口令
        if twisters:
            evaluator.select_twister(twisters[0]['id'])
            print(f"\n已选择: {twisters[0]['title']}")
            print(f"内容: {twisters[0]['text']}")
        
        print("\n绕口令评测器已就绪！")
        print("使用方法:")
        print("1. evaluator.start_recording()  # 开始录音")
        print("2. evaluator.stop_recording()   # 停止录音")
        print("3. await evaluator.evaluate_current_recording()  # 评测")
    
    # 运行示例
    # asyncio.run(main())
    print("绕口令评测器模块已加载")