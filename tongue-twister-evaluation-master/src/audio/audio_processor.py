# -*- coding: utf-8 -*-
"""
音频处理模块

这个模块负责音频的录制、格式转换、预处理等功能。

主要功能：
1. 音频录制（支持多种设备）
2. 格式转换（转换为讯飞API要求的PCM格式）
3. 音频预处理（降噪、音量调节等）
4. 音频质量检测

讯飞API要求的音频格式：
- 采样率：16kHz
- 位深：16bit
- 声道：单声道
- 编码：PCM（无压缩）
"""

import pyaudio
import wave
import numpy as np
from typing import Optional, Tuple, List
import logging
import threading
import time
from scipy import signal
from scipy.io import wavfile
import io

class AudioProcessor:
    """音频处理器
    
    这个类封装了所有音频相关的操作：
    - 录音控制
    - 格式转换
    - 音频预处理
    - 质量检测
    """
    
    # 讯飞API要求的音频参数
    SAMPLE_RATE = 16000  # 采样率 16kHz
    CHANNELS = 1         # 单声道
    SAMPLE_WIDTH = 2     # 16bit = 2字节
    CHUNK_SIZE = 1024    # 每次读取的帧数
    
    def __init__(self):
        self.audio = pyaudio.PyAudio()
        self.is_recording = False
        self.recorded_frames = []
        self.stream = None
        self.logger = logging.getLogger(__name__)
        
    def list_audio_devices(self) -> List[dict]:
        """列出所有可用的音频设备
        
        Returns:
            设备信息列表
        """
        devices = []
        
        for i in range(self.audio.get_device_count()):
            device_info = self.audio.get_device_info_by_index(i)
            
            # 只返回输入设备
            if device_info['maxInputChannels'] > 0:
                devices.append({
                    'index': i,
                    'name': device_info['name'],
                    'channels': device_info['maxInputChannels'],
                    'sample_rate': device_info['defaultSampleRate']
                })
        
        return devices
    
    def start_recording(self, device_index: Optional[int] = None) -> bool:
        """开始录音
        
        Args:
            device_index: 音频设备索引，None表示使用默认设备
            
        Returns:
            录音是否成功开始
        """
        if self.is_recording:
            self.logger.warning("录音已在进行中")
            return False
        
        try:
            # 配置音频流
            self.stream = self.audio.open(
                format=pyaudio.paInt16,  # 16bit
                channels=self.CHANNELS,   # 单声道
                rate=self.SAMPLE_RATE,    # 16kHz
                input=True,
                input_device_index=device_index,
                frames_per_buffer=self.CHUNK_SIZE
            )
            
            self.is_recording = True
            self.recorded_frames = []
            
            # 启动录音线程
            self.recording_thread = threading.Thread(target=self._record_audio)
            self.recording_thread.start()
            
            self.logger.info("录音已开始")
            return True
            
        except Exception as e:
            self.logger.error(f"开始录音失败: {e}")
            return False
    
    def _record_audio(self):
        """录音线程函数"""
        while self.is_recording and self.stream:
            try:
                # 读取音频数据
                data = self.stream.read(self.CHUNK_SIZE, exception_on_overflow=False)
                self.recorded_frames.append(data)
                
            except Exception as e:
                self.logger.error(f"录音过程中出错: {e}")
                break
    
    def stop_recording(self) -> bytes:
        """停止录音并返回音频数据
        
        Returns:
            录制的音频数据（PCM格式）
        """
        if not self.is_recording:
            self.logger.warning("当前没有在录音")
            return b''
        
        # 停止录音
        self.is_recording = False
        
        # 等待录音线程结束
        if hasattr(self, 'recording_thread'):
            self.recording_thread.join(timeout=1.0)
        
        # 关闭音频流
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        # 合并音频数据
        audio_data = b''.join(self.recorded_frames)
        self.recorded_frames = []
        
        self.logger.info(f"录音已停止，共录制 {len(audio_data)} 字节")
        return audio_data
    
    def convert_to_pcm(self, audio_data: bytes, 
                      source_rate: int = None, 
                      source_channels: int = None) -> bytes:
        """转换音频格式为PCM
        
        将任意格式的音频转换为讯飞API要求的PCM格式：
        - 16kHz采样率
        - 16bit位深
        - 单声道
        
        Args:
            audio_data: 原始音频数据
            source_rate: 源采样率
            source_channels: 源声道数
            
        Returns:
            转换后的PCM数据
        """
        try:
            # 如果已经是目标格式，直接返回
            if (source_rate == self.SAMPLE_RATE and 
                source_channels == self.CHANNELS):
                return audio_data
            
            # 转换为numpy数组
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            
            # 处理多声道转单声道
            if source_channels and source_channels > 1:
                audio_array = audio_array.reshape(-1, source_channels)
                audio_array = np.mean(audio_array, axis=1).astype(np.int16)
            
            # 重采样到16kHz
            if source_rate and source_rate != self.SAMPLE_RATE:
                # 计算重采样比例
                resample_ratio = self.SAMPLE_RATE / source_rate
                new_length = int(len(audio_array) * resample_ratio)
                
                # 使用scipy进行重采样
                audio_array = signal.resample(audio_array, new_length).astype(np.int16)
            
            return audio_array.tobytes()
            
        except Exception as e:
            self.logger.error(f"音频格式转换失败: {e}")
            return audio_data
    
    def preprocess_audio(self, audio_data: bytes) -> bytes:
        """音频预处理
        
        对音频进行预处理以提高识别准确率：
        1. 音量归一化
        2. 简单降噪
        3. 静音检测和移除
        
        Args:
            audio_data: 原始音频数据
            
        Returns:
            预处理后的音频数据
        """
        try:
            # 转换为numpy数组
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            
            # 1. 音量归一化
            audio_array = self._normalize_volume(audio_array)
            
            # 2. 简单降噪（高通滤波）
            audio_array = self._simple_denoise(audio_array)
            
            # 3. 移除开头和结尾的静音
            audio_array = self._trim_silence(audio_array)
            
            return audio_array.astype(np.int16).tobytes()
            
        except Exception as e:
            self.logger.error(f"音频预处理失败: {e}")
            return audio_data
    
    def _normalize_volume(self, audio_array: np.ndarray) -> np.ndarray:
        """音量归一化
        
        将音频音量调整到合适的范围，避免过大或过小
        """
        if len(audio_array) == 0:
            return audio_array
        
        # 计算RMS音量
        rms = np.sqrt(np.mean(audio_array.astype(np.float32) ** 2))
        
        if rms > 0:
            # 目标RMS值（约为最大值的30%）
            target_rms = 32767 * 0.3
            scaling_factor = target_rms / rms
            
            # 限制缩放因子，避免过度放大
            scaling_factor = min(scaling_factor, 3.0)
            
            audio_array = audio_array * scaling_factor
            
            # 防止溢出
            audio_array = np.clip(audio_array, -32767, 32767)
        
        return audio_array
    
    def _simple_denoise(self, audio_array: np.ndarray) -> np.ndarray:
        """简单降噪
        
        使用高通滤波器去除低频噪声
        """
        if len(audio_array) < 100:  # 数据太短，跳过处理
            return audio_array
        
        try:
            # 设计高通滤波器（截止频率80Hz）
            nyquist = self.SAMPLE_RATE / 2
            cutoff = 80 / nyquist
            
            # 使用巴特沃斯滤波器
            b, a = signal.butter(4, cutoff, btype='high')
            
            # 应用滤波器
            filtered = signal.filtfilt(b, a, audio_array.astype(np.float32))
            
            return filtered.astype(np.int16)
            
        except Exception as e:
            self.logger.warning(f"降噪处理失败: {e}")
            return audio_array
    
    def _trim_silence(self, audio_array: np.ndarray, 
                     threshold: float = 0.01) -> np.ndarray:
        """移除静音部分
        
        Args:
            audio_array: 音频数组
            threshold: 静音阈值（相对于最大值的比例）
            
        Returns:
            移除静音后的音频数组
        """
        if len(audio_array) == 0:
            return audio_array
        
        # 计算绝对值
        abs_audio = np.abs(audio_array)
        
        # 计算阈值
        max_val = np.max(abs_audio)
        silence_threshold = max_val * threshold
        
        # 找到非静音部分
        non_silent = abs_audio > silence_threshold
        
        if not np.any(non_silent):
            # 如果全是静音，返回原数据
            return audio_array
        
        # 找到第一个和最后一个非静音位置
        first_sound = np.argmax(non_silent)
        last_sound = len(non_silent) - np.argmax(non_silent[::-1]) - 1
        
        # 保留一些边界（避免切得太紧）
        margin = int(self.SAMPLE_RATE * 0.1)  # 100ms边界
        first_sound = max(0, first_sound - margin)
        last_sound = min(len(audio_array) - 1, last_sound + margin)
        
        return audio_array[first_sound:last_sound + 1]
    
    def analyze_audio_quality(self, audio_data: bytes) -> dict:
        """分析音频质量
        
        检测音频是否适合进行语音评测
        
        Args:
            audio_data: 音频数据
            
        Returns:
            质量分析结果
        """
        try:
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            
            if len(audio_array) == 0:
                return {
                    'is_valid': False,
                    'error': '音频数据为空'
                }
            
            # 计算基本统计信息
            duration = len(audio_array) / self.SAMPLE_RATE
            rms = np.sqrt(np.mean(audio_array.astype(np.float32) ** 2))
            max_amplitude = np.max(np.abs(audio_array))
            
            # 检测静音比例
            silence_threshold = max_amplitude * 0.05
            silence_ratio = np.sum(np.abs(audio_array) < silence_threshold) / len(audio_array)
            
            # 质量评估
            quality_issues = []
            
            # 检查时长
            if duration < 0.5:
                quality_issues.append('录音时间过短（少于0.5秒）')
            elif duration > 30:
                quality_issues.append('录音时间过长（超过30秒）')
            
            # 检查音量
            if rms < 1000:
                quality_issues.append('音量过低')
            elif rms > 20000:
                quality_issues.append('音量过高，可能有削波失真')
            
            # 检查静音比例
            if silence_ratio > 0.8:
                quality_issues.append('静音部分过多')
            
            return {
                'is_valid': len(quality_issues) == 0,
                'duration': duration,
                'rms_volume': rms,
                'max_amplitude': max_amplitude,
                'silence_ratio': silence_ratio,
                'quality_issues': quality_issues
            }
            
        except Exception as e:
            return {
                'is_valid': False,
                'error': f'音频分析失败: {e}'
            }
    
    def save_audio_file(self, audio_data: bytes, filename: str) -> bool:
        """保存音频文件
        
        Args:
            audio_data: 音频数据
            filename: 文件名
            
        Returns:
            保存是否成功
        """
        try:
            with wave.open(filename, 'wb') as wav_file:
                wav_file.setnchannels(self.CHANNELS)
                wav_file.setsampwidth(self.SAMPLE_WIDTH)
                wav_file.setframerate(self.SAMPLE_RATE)
                wav_file.writeframes(audio_data)
            
            self.logger.info(f"音频已保存到: {filename}")
            return True
            
        except Exception as e:
            self.logger.error(f"保存音频文件失败: {e}")
            return False
    
    def load_audio_file(self, filename: str) -> Tuple[bytes, dict]:
        """加载音频文件
        
        Args:
            filename: 文件名
            
        Returns:
            (音频数据, 文件信息)
        """
        try:
            with wave.open(filename, 'rb') as wav_file:
                # 获取文件信息
                file_info = {
                    'channels': wav_file.getnchannels(),
                    'sample_width': wav_file.getsampwidth(),
                    'sample_rate': wav_file.getframerate(),
                    'frames': wav_file.getnframes(),
                    'duration': wav_file.getnframes() / wav_file.getframerate()
                }
                
                # 读取音频数据
                audio_data = wav_file.readframes(wav_file.getnframes())
                
                # 如果格式不匹配，进行转换
                if (file_info['sample_rate'] != self.SAMPLE_RATE or 
                    file_info['channels'] != self.CHANNELS):
                    audio_data = self.convert_to_pcm(
                        audio_data, 
                        file_info['sample_rate'], 
                        file_info['channels']
                    )
            
            self.logger.info(f"音频文件已加载: {filename}")
            return audio_data, file_info
            
        except Exception as e:
            self.logger.error(f"加载音频文件失败: {e}")
            return b'', {}
    
    def __del__(self):
        """析构函数，确保资源清理"""
        if self.is_recording:
            self.stop_recording()
        
        if hasattr(self, 'audio'):
            self.audio.terminate()

# 使用示例
if __name__ == "__main__":
    processor = AudioProcessor()
    
    # 列出音频设备
    devices = processor.list_audio_devices()
    print("可用音频设备:")
    for device in devices:
        print(f"  {device['index']}: {device['name']}")
    
    print("\n音频处理器已就绪")
    print("主要功能:")
    print("- 录音控制")
    print("- 格式转换（转为16kHz PCM）")
    print("- 音频预处理（降噪、音量调节）")
    print("- 质量检测")