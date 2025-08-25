# -*- coding: utf-8 -*-
"""
评分引擎模块

这个模块负责处理讯飞API返回的评测结果，计算综合得分，
并生成用户友好的反馈信息。

主要功能：
1. 解析讯飞API评测结果
2. 计算综合得分和各维度得分
3. 生成详细的发音反馈
4. 提供改进建议
5. 历史成绩跟踪

评分维度说明：
- 发音准确度（pronunciation）：音素发音的准确性
- 流利度（fluency）：语速和停顿的自然性
- 完整度（integrity）：是否完整读完
- 语调（tone）：声调的准确性（中文特有）
"""

import json
import math
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

@dataclass
class WordScore:
    """单词评分结果"""
    word: str                    # 词语
    pronunciation_score: float   # 发音得分
    tone_score: float           # 声调得分
    is_correct: bool            # 是否正确
    error_type: Optional[str]   # 错误类型
    phonemes: List[Dict]        # 音素详情

@dataclass
class SentenceScore:
    """句子评分结果"""
    text: str                   # 原文
    overall_score: float        # 总分
    pronunciation_score: float  # 发音得分
    fluency_score: float       # 流利度得分
    integrity_score: float     # 完整度得分
    tone_score: float          # 声调得分
    word_scores: List[WordScore] # 词语得分列表
    duration: float            # 朗读时长
    speed_score: float         # 语速得分

@dataclass
class EvaluationResult:
    """完整评测结果"""
    sentence_score: SentenceScore
    grade_level: str           # 等级（优秀/良好/及格/需改进）
    feedback_summary: str      # 总体反馈
    detailed_feedback: List[str] # 详细反馈
    improvement_tips: List[str]  # 改进建议
    timestamp: datetime        # 评测时间
    raw_result: Dict[str, Any] # 原始结果

class ScoreEngine:
    """评分引擎
    
    负责处理和分析语音评测结果
    """
    
    # 等级划分标准（更严格的评判标准）
    GRADE_THRESHOLDS = {
        '优秀': 95,
        '良好': 85,
        '及格': 75,
        '需改进': 0
    }
    
    # 各维度权重（提高发音准确度权重）
    DIMENSION_WEIGHTS = {
        'pronunciation': 0.5,  # 发音准确度权重50%（提高）
        'fluency': 0.2,       # 流利度权重20%（降低）
        'integrity': 0.15,    # 完整度权重15%（降低）
        'tone': 0.15          # 声调权重15%（保持）
    }
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.history = []  # 历史评测记录
    
    def process_evaluation_result(self, raw_result: Dict[str, Any], 
                                text: str, duration: float = 0) -> EvaluationResult:
        """处理评测结果
        
        Args:
            raw_result: 讯飞API返回的原始结果
            text: 原始文本
            duration: 朗读时长（秒）
            
        Returns:
            处理后的评测结果
        """
        try:
            # 1. 解析基础得分
            sentence_score = self._parse_sentence_score(raw_result, text, duration)
            
            # 2. 计算等级
            grade_level = self._calculate_grade(sentence_score.overall_score)
            
            # 3. 生成反馈
            feedback_summary = self._generate_feedback_summary(sentence_score)
            detailed_feedback = self._generate_detailed_feedback(sentence_score)
            improvement_tips = self._generate_improvement_tips(sentence_score)
            
            # 4. 创建完整结果
            result = EvaluationResult(
                sentence_score=sentence_score,
                grade_level=grade_level,
                feedback_summary=feedback_summary,
                detailed_feedback=detailed_feedback,
                improvement_tips=improvement_tips,
                timestamp=datetime.now(),
                raw_result=raw_result
            )
            
            # 5. 记录到历史
            self.history.append(result)
            
            self.logger.info(f"评测结果处理完成，总分: {sentence_score.overall_score:.1f}")
            return result
            
        except Exception as e:
            self.logger.error(f"处理评测结果失败: {e}")
            # 返回默认结果
            return self._create_default_result(text, raw_result)
    
    def _parse_sentence_score(self, raw_result: Dict[str, Any], 
                            text: str, duration: float) -> SentenceScore:
        """解析句子得分
        
        Args:
            raw_result: 原始结果
            text: 原文
            duration: 时长
            
        Returns:
            句子得分对象
        """
        # 提取基础得分（讯飞API已经处理过的得分）
        overall_score = raw_result.get('overall_score', 0)
        pronunciation_score = raw_result.get('pronunciation_score', 0)
        fluency_score = raw_result.get('fluency_score', 0)
        integrity_score = raw_result.get('integrity_score', 0)
        tone_score = raw_result.get('tone_score', 0)
        
        # 解析词语详情
        word_scores = self._parse_word_scores(raw_result.get('word_details', []))
        
        # 计算语速得分
        speed_score = self._calculate_speed_score(text, duration)
        
        # 总是使用加权计算来确保总分的准确性
        # 如果各维度得分都存在，重新计算总分
        if any([pronunciation_score, fluency_score, integrity_score, tone_score]):
            calculated_score = self._calculate_weighted_score(
                pronunciation_score, fluency_score, integrity_score, tone_score
            )
            # 使用计算出的分数，除非API返回的总分明显更合理
            if overall_score == 0 or abs(calculated_score - overall_score) > 20:
                overall_score = calculated_score
                self.logger.info(f"使用加权计算总分: {overall_score:.1f} (API返回: {raw_result.get('overall_score', 0)})")
            else:
                # 如果差异不大，使用API返回的分数
                overall_score = overall_score
        
        return SentenceScore(
            text=text,
            overall_score=overall_score,
            pronunciation_score=pronunciation_score,
            fluency_score=fluency_score,
            integrity_score=integrity_score,
            tone_score=tone_score,
            word_scores=word_scores,
            duration=duration,
            speed_score=speed_score
        )
    
    def _parse_word_scores(self, word_details: List[Dict]) -> List[WordScore]:
        """解析词语得分详情
        
        Args:
            word_details: 词语详情列表
            
        Returns:
            词语得分列表
        """
        word_scores = []
        
        for word_data in word_details:
            try:
                word_score = WordScore(
                    word=word_data.get('word', ''),
                    pronunciation_score=word_data.get('phone_score', 0),
                    tone_score=word_data.get('tone_score', 0),
                    is_correct=word_data.get('is_correct', True),
                    error_type=word_data.get('error_type'),
                    phonemes=word_data.get('phonemes', [])
                )
                word_scores.append(word_score)
                
            except Exception as e:
                self.logger.warning(f"解析词语得分失败: {e}")
                continue
        
        return word_scores
    
    def _calculate_speed_score(self, text: str, duration: float) -> float:
        """计算语速得分
        
        Args:
            text: 文本
            duration: 时长
            
        Returns:
            语速得分（0-100）
        """
        if duration <= 0:
            return 0
        
        # 计算字符数（中文按字计算）
        char_count = len([c for c in text if '\u4e00' <= c <= '\u9fff'])
        
        if char_count == 0:
            return 0
        
        # 计算语速（字/秒）
        speed = char_count / duration
        
        # 理想语速范围：2-4字/秒
        ideal_min = 2.0
        ideal_max = 4.0
        
        if ideal_min <= speed <= ideal_max:
            # 在理想范围内，得分100
            return 100
        elif speed < ideal_min:
            # 过慢，按比例扣分
            return max(0, (speed / ideal_min) * 100)
        else:
            # 过快，按比例扣分
            excess_ratio = (speed - ideal_max) / ideal_max
            return max(0, 100 - excess_ratio * 50)
    
    def _calculate_weighted_score(self, pronunciation: float, fluency: float, 
                                integrity: float, tone: float) -> float:
        """计算加权总分
        
        Args:
            pronunciation: 发音得分
            fluency: 流利度得分
            integrity: 完整度得分
            tone: 声调得分
            
        Returns:
            加权总分
        """
        weighted_score = (
            pronunciation * self.DIMENSION_WEIGHTS['pronunciation'] +
            fluency * self.DIMENSION_WEIGHTS['fluency'] +
            integrity * self.DIMENSION_WEIGHTS['integrity'] +
            tone * self.DIMENSION_WEIGHTS['tone']
        )
        
        return round(weighted_score, 1)
    
    def _calculate_grade(self, score: float) -> str:
        """计算等级
        
        Args:
            score: 总分
            
        Returns:
            等级字符串
        """
        for grade, threshold in self.GRADE_THRESHOLDS.items():
            if score >= threshold:
                return grade
        return '需改进'
    
    def _generate_feedback_summary(self, sentence_score: SentenceScore) -> str:
        """生成总体反馈
        
        Args:
            sentence_score: 句子得分
            
        Returns:
            反馈摘要
        """
        score = sentence_score.overall_score
        
        if score >= 95:
            return f"太棒了！你的发音非常标准，总分{score:.1f}分，继续保持！"
        elif score >= 85:
            return f"很不错！你的发音基本准确，总分{score:.1f}分，还有提升空间。"
        elif score >= 75:
            return f"还可以！你的发音刚刚及格，总分{score:.1f}分，需要多练习。"
        else:
            return f"需要加油！总分{score:.1f}分，发音还有很大改进空间，建议多听多练！"
    
    def _generate_detailed_feedback(self, sentence_score: SentenceScore) -> List[str]:
        """生成详细反馈
        
        Args:
            sentence_score: 句子得分
            
        Returns:
            详细反馈列表
        """
        feedback = []
        
        # 发音准确度反馈
        if sentence_score.pronunciation_score >= 85:
            feedback.append(f"🎯 发音准确度很高（{sentence_score.pronunciation_score:.1f}分）")
        elif sentence_score.pronunciation_score >= 70:
            feedback.append(f"📢 发音基本准确（{sentence_score.pronunciation_score:.1f}分），个别字音需要注意")
        else:
            feedback.append(f"🔤 发音需要改进（{sentence_score.pronunciation_score:.1f}分），建议多听标准发音")
        
        # 流利度反馈
        if sentence_score.fluency_score >= 85:
            feedback.append(f"🌊 朗读很流利（{sentence_score.fluency_score:.1f}分）")
        elif sentence_score.fluency_score >= 70:
            feedback.append(f"⏱️ 朗读基本流利（{sentence_score.fluency_score:.1f}分），注意语速和停顿")
        else:
            feedback.append(f"🐌 朗读不够流利（{sentence_score.fluency_score:.1f}分），建议多练习")
        
        # 完整度反馈
        if sentence_score.integrity_score >= 90:
            feedback.append(f"✅ 朗读很完整（{sentence_score.integrity_score:.1f}分）")
        elif sentence_score.integrity_score >= 70:
            feedback.append(f"📝 朗读基本完整（{sentence_score.integrity_score:.1f}分）")
        else:
            feedback.append(f"❌ 朗读不够完整（{sentence_score.integrity_score:.1f}分），有遗漏或添加")
        
        # 声调反馈
        if sentence_score.tone_score >= 85:
            feedback.append(f"🎵 声调很准确（{sentence_score.tone_score:.1f}分）")
        elif sentence_score.tone_score >= 70:
            feedback.append(f"🎼 声调基本准确（{sentence_score.tone_score:.1f}分）")
        else:
            feedback.append(f"🎶 声调需要改进（{sentence_score.tone_score:.1f}分），注意四声变化")
        
        # 语速反馈
        if sentence_score.duration > 0:
            char_count = len([c for c in sentence_score.text if '\u4e00' <= c <= '\u9fff'])
            speed = char_count / sentence_score.duration
            
            if speed < 2:
                feedback.append(f"🐢 语速偏慢（{speed:.1f}字/秒），可以适当加快")
            elif speed > 4:
                feedback.append(f"🐰 语速偏快（{speed:.1f}字/秒），可以适当放慢")
            else:
                feedback.append(f"⏰ 语速合适（{speed:.1f}字/秒）")
        
        return feedback
    
    def _generate_improvement_tips(self, sentence_score: SentenceScore) -> List[str]:
        """生成改进建议
        
        Args:
            sentence_score: 句子得分
            
        Returns:
            改进建议列表
        """
        tips = []
        
        # 根据最薄弱的维度给出建议
        scores = {
            'pronunciation': sentence_score.pronunciation_score,
            'fluency': sentence_score.fluency_score,
            'integrity': sentence_score.integrity_score,
            'tone': sentence_score.tone_score
        }
        
        # 找出得分最低的维度
        weakest_dimension = min(scores.keys(), key=lambda k: scores[k])
        
        if scores[weakest_dimension] < 80:
            if weakest_dimension == 'pronunciation':
                tips.extend([
                    "多听标准普通话发音，注意模仿",
                    "可以使用拼音辅助，确认每个字的读音",
                    "放慢语速，确保每个音都发准确"
                ])
            elif weakest_dimension == 'fluency':
                tips.extend([
                    "先熟读文本，理解内容后再朗读",
                    "注意语句间的自然停顿",
                    "保持均匀的语速，避免忽快忽慢"
                ])
            elif weakest_dimension == 'integrity':
                tips.extend([
                    "朗读前仔细看清每个字",
                    "不要跳读或添加额外的字",
                    "如果读错了，可以重新开始"
                ])
            elif weakest_dimension == 'tone':
                tips.extend([
                    "注意中文的四个声调变化",
                    "可以先练习单个字的声调",
                    "听标准发音，注意声调的起伏"
                ])
        
        # 针对绕口令的特殊建议
        if any(char in sentence_score.text for char in ['四', '十', '石', '狮']):
            tips.append("这是经典的绕口令，重点练习相似音的区分")
        
        # 通用建议
        if sentence_score.overall_score < 70:
            tips.extend([
                "建议每天练习10-15分钟",
                "可以录音对比，听听自己的发音",
                "从简单的绕口令开始练习"
            ])
        
        return tips[:5]  # 最多返回5条建议
    
    def _create_default_result(self, text: str, raw_result: Dict) -> EvaluationResult:
        """创建默认结果（当解析失败时）
        
        Args:
            text: 原文
            raw_result: 原始结果
            
        Returns:
            默认评测结果
        """
        default_sentence_score = SentenceScore(
            text=text,
            overall_score=0,
            pronunciation_score=0,
            fluency_score=0,
            integrity_score=0,
            tone_score=0,
            word_scores=[],
            duration=0,
            speed_score=0
        )
        
        return EvaluationResult(
            sentence_score=default_sentence_score,
            grade_level='需改进',
            feedback_summary='评测过程中出现问题，请重新尝试',
            detailed_feedback=['无法获取详细评分信息'],
            improvement_tips=['请检查录音质量，确保声音清晰'],
            timestamp=datetime.now(),
            raw_result=raw_result
        )
    
    def get_progress_analysis(self, limit: int = 10) -> Dict[str, Any]:
        """获取进步分析
        
        Args:
            limit: 分析最近的记录数量
            
        Returns:
            进步分析结果
        """
        if not self.history:
            return {'message': '暂无历史记录'}
        
        recent_results = self.history[-limit:]
        
        # 计算平均分变化
        scores = [result.sentence_score.overall_score for result in recent_results]
        
        if len(scores) < 2:
            return {
                'current_score': scores[0] if scores else 0,
                'message': '需要更多练习记录才能分析进步情况'
            }
        
        # 计算趋势
        first_half = scores[:len(scores)//2]
        second_half = scores[len(scores)//2:]
        
        avg_first = sum(first_half) / len(first_half)
        avg_second = sum(second_half) / len(second_half)
        
        improvement = avg_second - avg_first
        
        analysis = {
            'total_attempts': len(recent_results),
            'current_score': scores[-1],
            'average_score': sum(scores) / len(scores),
            'best_score': max(scores),
            'improvement': improvement,
            'trend': '上升' if improvement > 2 else '下降' if improvement < -2 else '稳定'
        }
        
        return analysis
    
    def export_history(self) -> List[Dict[str, Any]]:
        """导出历史记录
        
        Returns:
            历史记录列表
        """
        exported_data = []
        
        for result in self.history:
            exported_data.append({
                'timestamp': result.timestamp.isoformat(),
                'text': result.sentence_score.text,
                'overall_score': result.sentence_score.overall_score,
                'grade_level': result.grade_level,
                'pronunciation_score': result.sentence_score.pronunciation_score,
                'fluency_score': result.sentence_score.fluency_score,
                'integrity_score': result.sentence_score.integrity_score,
                'tone_score': result.sentence_score.tone_score,
                'duration': result.sentence_score.duration
            })
        
        return exported_data

# 使用示例
if __name__ == "__main__":
    # 创建评分引擎
    engine = ScoreEngine()
    
    # 模拟讯飞API返回的结果
    mock_result = {
        'overall_score': 85.5,
        'pronunciation_score': 88.0,
        'fluency_score': 82.0,
        'integrity_score': 90.0,
        'tone_score': 83.0,
        'word_details': [
            {
                'word': '四是四',
                'phone_score': 85,
                'tone_score': 80,
                'is_correct': True
            }
        ]
    }
    
    # 处理结果
    result = engine.process_evaluation_result(
        mock_result, 
        "四是四，十是十，十四是十四，四十是四十", 
        3.5
    )
    
    print(f"等级: {result.grade_level}")
    print(f"总体反馈: {result.feedback_summary}")
    print("详细反馈:")
    for feedback in result.detailed_feedback:
        print(f"  - {feedback}")
    print("改进建议:")
    for tip in result.improvement_tips:
        print(f"  - {tip}")