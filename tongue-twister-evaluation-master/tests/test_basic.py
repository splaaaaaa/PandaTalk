# -*- coding: utf-8 -*-
"""
绕口令语音评测系统 - 基础测试

这个测试文件验证系统各个模块的基本功能：
1. 配置模块测试
2. 绕口令库测试
3. 音频处理测试
4. 评分引擎测试

运行测试：
python -m pytest tests/test_basic.py -v
"""

import sys
import os
import pytest
import asyncio
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from config.xfyun_config import XFYunConfig
from src.utils.twister_library import TwisterLibrary
from src.scoring.score_engine import ScoreEngine, EvaluationResult
from src.audio.audio_processor import AudioProcessor

class TestXFYunConfig:
    """测试讯飞配置模块"""
    
    def test_config_initialization(self):
        """测试配置初始化"""
        config = XFYunConfig()
        
        # 检查基本属性
        assert hasattr(config, 'APPID')
        assert hasattr(config, 'API_SECRET')
        assert hasattr(config, 'API_KEY')
        assert hasattr(config, 'BASE_URL')
        
        # 检查音频参数
        assert config.AUDIO_FORMAT == 'raw'
        assert config.ENCODING == 'lame'
        assert config.SAMPLE_RATE == 16000
        
        # 检查评测参数
        assert config.CATEGORY == 'read_sentence'
        assert config.LANGUAGE == 'zh_cn'
        assert config.ACCENT == 'mandarin'
    
    def test_get_auth_url(self):
        """测试认证URL生成"""
        config = XFYunConfig()
        
        # 模拟有效配置
        config.APPID = 'test_appid'
        config.API_SECRET = 'test_secret'
        config.API_KEY = 'test_key'
        
        auth_url = config.get_auth_url()
        
        # 检查URL格式
        assert auth_url.startswith('wss://')
        assert 'authorization=' in auth_url
        assert 'date=' in auth_url
        assert 'host=' in auth_url
    
    def test_validate_config(self):
        """测试配置验证"""
        config = XFYunConfig()
        
        # 测试无效配置
        config.APPID = 'your_appid_here'
        assert not config.validate_config()
        
        # 测试有效配置
        config.APPID = 'valid_appid'
        config.API_SECRET = 'valid_secret'
        config.API_KEY = 'valid_key'
        assert config.validate_config()

class TestTwisterLibrary:
    """测试绕口令库模块"""
    
    def setup_method(self):
        """测试前准备"""
        self.library = TwisterLibrary()
    
    def test_library_initialization(self):
        """测试库初始化"""
        assert len(self.library.twisters) > 0
        
        # 检查第一个绕口令的结构
        first_twister = self.library.twisters[0]
        required_fields = ['id', 'title', 'text', 'difficulty', 'focus', 'tips', 'category']
        
        for field in required_fields:
            assert field in first_twister
    
    def test_get_twisters_by_difficulty(self):
        """测试按难度获取绕口令"""
        # 测试各个难度级别
        beginner = self.library.get_twisters_by_difficulty('初级')
        intermediate = self.library.get_twisters_by_difficulty('中级')
        advanced = self.library.get_twisters_by_difficulty('高级')
        all_twisters = self.library.get_twisters_by_difficulty('全部')
        
        assert len(beginner) > 0
        assert len(intermediate) > 0
        assert len(advanced) > 0
        assert len(all_twisters) == len(self.library.twisters)
        
        # 验证难度标签正确
        for twister in beginner:
            assert twister['difficulty'] == '初级'
    
    def test_get_twisters_by_category(self):
        """测试按类别获取绕口令"""
        categories = ['声母练习', '韵母练习', '综合练习', '声调练习']
        
        for category in categories:
            twisters = self.library.get_twisters_by_category(category)
            if twisters:  # 如果该类别有绕口令
                for twister in twisters:
                    assert twister['category'] == category
    
    def test_get_twister_by_id(self):
        """测试按ID获取绕口令"""
        # 获取第一个绕口令的ID
        first_id = self.library.twisters[0]['id']
        
        # 测试有效ID
        twister = self.library.get_twister_by_id(first_id)
        assert twister is not None
        assert twister['id'] == first_id
        
        # 测试无效ID
        invalid_twister = self.library.get_twister_by_id('invalid_id')
        assert invalid_twister is None
    
    def test_search_twisters(self):
        """测试搜索功能"""
        # 搜索常见字符
        results = self.library.search_twisters('四')
        assert len(results) > 0
        
        # 验证搜索结果包含关键词
        for twister in results:
            assert ('四' in twister['title'] or 
                   '四' in twister['text'] or 
                   '四' in twister['focus'])
        
        # 搜索不存在的内容
        no_results = self.library.search_twisters('不存在的内容xyz')
        assert len(no_results) == 0
    
    def test_get_random_twister(self):
        """测试随机获取绕口令"""
        # 测试无限制随机
        random_twister = self.library.get_random_twister()
        assert random_twister is not None
        
        # 测试指定难度随机
        random_beginner = self.library.get_random_twister('初级')
        assert random_beginner is not None
        assert random_beginner['difficulty'] == '初级'
    
    def test_statistics(self):
        """测试统计功能"""
        difficulty_stats = self.library.get_difficulty_stats()
        category_stats = self.library.get_category_stats()
        
        # 检查统计结果
        assert '初级' in difficulty_stats
        assert '中级' in difficulty_stats
        assert '高级' in difficulty_stats
        
        assert len(category_stats) > 0
        
        # 验证统计数量
        total_by_difficulty = sum(difficulty_stats.values())
        total_by_category = sum(category_stats.values())
        assert total_by_difficulty == len(self.library.twisters)
        assert total_by_category == len(self.library.twisters)
    
    def test_add_custom_twister(self):
        """测试添加自定义绕口令"""
        original_count = len(self.library.twisters)
        
        # 测试添加有效绕口令
        custom_twister = {
            'id': 'test_001',
            'title': '测试绕口令',
            'text': '测试文本',
            'difficulty': '初级',
            'focus': '测试重点',
            'tips': '测试提示',
            'category': '测试类别'
        }
        
        success = self.library.add_custom_twister(custom_twister)
        assert success
        assert len(self.library.twisters) == original_count + 1
        
        # 验证添加的绕口令
        added_twister = self.library.get_twister_by_id('test_001')
        assert added_twister is not None
        assert added_twister['title'] == '测试绕口令'
        
        # 测试添加重复ID
        duplicate_success = self.library.add_custom_twister(custom_twister)
        assert not duplicate_success
        assert len(self.library.twisters) == original_count + 1
    
    def test_get_recommended_sequence(self):
        """测试推荐序列"""
        levels = ['初级', '中级', '高级']
        
        for level in levels:
            sequence = self.library.get_recommended_sequence(level)
            assert len(sequence) > 0
            
            # 验证序列中的绕口令难度合适
            for twister in sequence:
                if level == '初级':
                    assert twister['difficulty'] in ['初级']
                elif level == '中级':
                    assert twister['difficulty'] in ['初级', '中级']
                else:  # 高级
                    assert twister['difficulty'] in ['中级', '高级']

class TestScoreEngine:
    """测试评分引擎模块"""
    
    def setup_method(self):
        """测试前准备"""
        self.engine = ScoreEngine()
    
    def test_parse_xfyun_result(self):
        """测试解析讯飞结果"""
        # 模拟讯飞API返回结果
        mock_result = {
            'data': {
                'read_sentence': {
                    'rec_paper': {
                        'read_sentence': {
                            'total_score': 85.5,
                            'phone_score': 88.0,
                            'tone_score': 82.0,
                            'fluency_score': 87.0,
                            'integrity_score': 90.0,
                            'words': [
                                {
                                    'beg_pos': 0,
                                    'end_pos': 480,
                                    'content': '四是四',
                                    'total_score': 85.0,
                                    'syls': [
                                        {'content': 'si', 'total_score': 88.0},
                                        {'content': 'shi', 'total_score': 82.0},
                                        {'content': 'si', 'total_score': 85.0}
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        }
        
        result = self.engine.parse_xfyun_result(mock_result)
        
        assert result is not None
        assert result.overall_score == 85.5
        assert '发音准确度' in result.dimension_scores
        assert len(result.word_scores) > 0
    
    def test_calculate_grade(self):
        """测试等级计算"""
        test_cases = [
            (95, '优秀'),
            (85, '良好'),
            (75, '中等'),
            (65, '及格'),
            (55, '不及格')
        ]
        
        for score, expected_grade in test_cases:
            grade = self.engine.calculate_grade(score)
            assert grade == expected_grade
    
    def test_generate_feedback_summary(self):
        """测试反馈摘要生成"""
        # 创建模拟评测结果
        result = EvaluationResult(
            overall_score=85.0,
            dimension_scores={
                '发音准确度': 88.0,
                '语调自然度': 82.0,
                '流畅程度': 87.0,
                '完整性': 90.0
            },
            grade='良好',
            word_scores=[],
            sentence_scores=[],
            feedback_summary='',
            detailed_feedback=[],
            improvement_tips=[]
        )
        
        summary = self.engine.generate_feedback_summary(result)
        
        assert isinstance(summary, str)
        assert len(summary) > 0
        assert '良好' in summary or '85' in summary
    
    def test_generate_improvement_tips(self):
        """测试改进建议生成"""
        dimension_scores = {
            '发音准确度': 70.0,  # 较低分数
            '语调自然度': 85.0,
            '流畅程度': 75.0,
            '完整性': 90.0
        }
        
        tips = self.engine.generate_improvement_tips(dimension_scores)
        
        assert isinstance(tips, list)
        assert len(tips) > 0
        
        # 应该包含针对低分维度的建议
        tips_text = ' '.join(tips)
        assert '发音' in tips_text or '准确' in tips_text

class TestAudioProcessor:
    """测试音频处理模块"""
    
    def setup_method(self):
        """测试前准备"""
        self.processor = AudioProcessor()
    
    @patch('pyaudio.PyAudio')
    def test_list_audio_devices(self, mock_pyaudio):
        """测试音频设备列表"""
        # 模拟PyAudio
        mock_audio = Mock()
        mock_pyaudio.return_value = mock_audio
        mock_audio.get_device_count.return_value = 2
        mock_audio.get_device_info_by_index.side_effect = [
            {'name': 'Device 1', 'maxInputChannels': 2},
            {'name': 'Device 2', 'maxInputChannels': 1}
        ]
        
        devices = self.processor.list_audio_devices()
        
        assert len(devices) == 2
        assert devices[0]['name'] == 'Device 1'
    
    def test_validate_audio_format(self):
        """测试音频格式验证"""
        # 这个测试需要实际的音频数据，这里只测试方法存在
        assert hasattr(self.processor, 'validate_audio_format')
        assert callable(self.processor.validate_audio_format)
    
    def test_preprocess_audio(self):
        """测试音频预处理"""
        # 创建模拟音频数据
        import numpy as np
        
        # 生成测试音频数据（1秒，16kHz采样率）
        sample_rate = 16000
        duration = 1.0
        t = np.linspace(0, duration, int(sample_rate * duration))
        audio_data = np.sin(2 * np.pi * 440 * t)  # 440Hz正弦波
        
        # 测试预处理
        processed = self.processor.preprocess_audio(audio_data, sample_rate)
        
        assert processed is not None
        assert len(processed) > 0
        assert isinstance(processed, np.ndarray)

def test_integration():
    """集成测试"""
    """测试各模块之间的集成"""
    
    # 测试配置和绕口令库的集成
    config = XFYunConfig()
    library = TwisterLibrary()
    engine = ScoreEngine()
    
    # 获取一个绕口令
    twister = library.get_random_twister('初级')
    assert twister is not None
    
    # 测试评分引擎能处理绕口令文本
    text = twister['text']
    assert len(text) > 0
    
    # 测试配置参数适用于绕口令评测
    assert config.CATEGORY == 'read_sentence'  # 适合绕口令评测
    assert config.LANGUAGE == 'zh_cn'  # 中文

if __name__ == '__main__':
    # 运行测试
    pytest.main([__file__, '-v'])