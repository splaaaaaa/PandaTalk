#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PandaTalk绕口令语音评测系统 - 核心模块

这个包包含了绕口令语音评测系统的所有核心功能模块：
- api: 讯飞语音评测API客户端
- audio: 音频处理模块
- scoring: 评分引擎
- utils: 工具模块

主要类：
- TwisterEvaluator: 绕口令评测器（主要接口）
- XFYunClient: 讯飞API客户端
- AudioProcessor: 音频处理器
- ScoreEngine: 评分引擎
- TwisterLibrary: 绕口令库
"""

__version__ = "1.0.0"
__author__ = "PandaTalk Team"
__email__ = "support@pandatalk.com"

# 导入主要类，方便外部使用
from .twister_evaluator import TwisterEvaluator
from .api.xfyun_client import XFYunClient
from .audio.audio_processor import AudioProcessor
from .scoring.score_engine import ScoreEngine, EvaluationResult
from .utils.twister_library import TwisterLibrary
from .utils.cache_manager import CacheManager

__all__ = [
    'TwisterEvaluator',
    'XFYunClient', 
    'AudioProcessor',
    'ScoreEngine',
    'EvaluationResult',
    'TwisterLibrary',
    'CacheManager'
]