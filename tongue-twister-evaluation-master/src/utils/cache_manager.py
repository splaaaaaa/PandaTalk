#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
缓存管理模块

这个模块提供了评测结果的缓存功能，用于：
1. 缓存评测结果以避免重复计算
2. 管理历史记录
3. 提供数据持久化
4. 优化系统性能

主要功能：
- 结果缓存和检索
- 历史记录管理
- 数据序列化和反序列化
- 缓存清理和维护
"""

import os
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import pickle
import logging

class CacheManager:
    """缓存管理器
    
    负责管理评测结果的缓存，提供高效的数据存储和检索功能。
    """
    
    def __init__(self, cache_dir: Optional[str] = None):
        """初始化缓存管理器
        
        Args:
            cache_dir: 缓存目录路径，如果为None则使用默认路径
        """
        if cache_dir is None:
            cache_dir = "cache"
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # 缓存子目录
        self.results_cache_dir = self.cache_dir / "results"
        self.history_cache_dir = self.cache_dir / "history"
        self.temp_cache_dir = self.cache_dir / "temp"
        
        # 创建子目录
        for dir_path in [self.results_cache_dir, self.history_cache_dir, self.temp_cache_dir]:
            dir_path.mkdir(exist_ok=True)
        
        # 缓存配置
        self.max_cache_size = 1000  # 最大缓存条目数
        self.cache_ttl = timedelta(days=7)  # 缓存生存时间
        
        # 内存缓存
        self._memory_cache = {}
        
        self.logger = logging.getLogger(__name__)
    
    def _generate_cache_key(self, text: str, audio_data: bytes = None) -> str:
        """生成缓存键
        
        Args:
            text: 评测文本
            audio_data: 音频数据（可选）
            
        Returns:
            缓存键字符串
        """
        # 基于文本内容生成哈希
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        
        # 如果有音频数据，也加入哈希计算
        if audio_data:
            audio_hash = hashlib.md5(audio_data).hexdigest()[:8]
            return f"{text_hash}_{audio_hash}"
        
        return text_hash
    
    def get_cached_result(self, text: str, audio_data: bytes = None) -> Optional[Dict[str, Any]]:
        """获取缓存的评测结果
        
        Args:
            text: 评测文本
            audio_data: 音频数据（可选）
            
        Returns:
            缓存的评测结果，如果不存在则返回None
        """
        cache_key = self._generate_cache_key(text, audio_data)
        
        # 先检查内存缓存
        if cache_key in self._memory_cache:
            cached_item = self._memory_cache[cache_key]
            if self._is_cache_valid(cached_item['timestamp']):
                self.logger.debug(f"从内存缓存获取结果: {cache_key}")
                return cached_item['result']
            else:
                # 缓存过期，删除
                del self._memory_cache[cache_key]
        
        # 检查磁盘缓存
        cache_file = self.results_cache_dir / f"{cache_key}.json"
        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    cached_data = json.load(f)
                
                if self._is_cache_valid(cached_data['timestamp']):
                    # 加载到内存缓存
                    self._memory_cache[cache_key] = cached_data
                    self.logger.debug(f"从磁盘缓存获取结果: {cache_key}")
                    return cached_data['result']
                else:
                    # 缓存过期，删除文件
                    cache_file.unlink()
                    
            except Exception as e:
                self.logger.error(f"读取缓存文件失败: {e}")
                cache_file.unlink(missing_ok=True)
        
        return None
    
    def cache_result(self, text: str, result: Dict[str, Any], audio_data: bytes = None):
        """缓存评测结果
        
        Args:
            text: 评测文本
            result: 评测结果
            audio_data: 音频数据（可选）
        """
        cache_key = self._generate_cache_key(text, audio_data)
        timestamp = datetime.now().isoformat()
        
        cached_item = {
            'result': result,
            'timestamp': timestamp,
            'text': text
        }
        
        # 保存到内存缓存
        self._memory_cache[cache_key] = cached_item
        
        # 保存到磁盘缓存
        cache_file = self.results_cache_dir / f"{cache_key}.json"
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(cached_item, f, ensure_ascii=False, indent=2)
            
            self.logger.debug(f"缓存结果保存成功: {cache_key}")
            
        except Exception as e:
            self.logger.error(f"保存缓存文件失败: {e}")
        
        # 清理过期缓存
        self._cleanup_expired_cache()
    
    def save_history_record(self, record: Dict[str, Any]) -> str:
        """保存历史记录
        
        Args:
            record: 历史记录数据
            
        Returns:
            记录ID
        """
        record_id = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        record['id'] = record_id
        record['timestamp'] = datetime.now().isoformat()
        
        history_file = self.history_cache_dir / f"{record_id}.json"
        
        try:
            with open(history_file, 'w', encoding='utf-8') as f:
                json.dump(record, f, ensure_ascii=False, indent=2)
            
            self.logger.debug(f"历史记录保存成功: {record_id}")
            return record_id
            
        except Exception as e:
            self.logger.error(f"保存历史记录失败: {e}")
            return ""
    
    def get_history_records(self, limit: int = 50) -> List[Dict[str, Any]]:
        """获取历史记录
        
        Args:
            limit: 返回记录数量限制
            
        Returns:
            历史记录列表
        """
        records = []
        
        try:
            # 获取所有历史文件
            history_files = list(self.history_cache_dir.glob("*.json"))
            
            # 按修改时间排序（最新的在前）
            history_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            # 读取记录
            for file_path in history_files[:limit]:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        record = json.load(f)
                        records.append(record)
                except Exception as e:
                    self.logger.error(f"读取历史记录失败 {file_path}: {e}")
                    continue
            
        except Exception as e:
            self.logger.error(f"获取历史记录失败: {e}")
        
        return records
    
    def delete_history_record(self, record_id: str) -> bool:
        """删除历史记录
        
        Args:
            record_id: 记录ID
            
        Returns:
            是否删除成功
        """
        history_file = self.history_cache_dir / f"{record_id}.json"
        
        try:
            if history_file.exists():
                history_file.unlink()
                self.logger.debug(f"历史记录删除成功: {record_id}")
                return True
            else:
                self.logger.warning(f"历史记录不存在: {record_id}")
                return False
                
        except Exception as e:
            self.logger.error(f"删除历史记录失败: {e}")
            return False
    
    def clear_all_cache(self):
        """清空所有缓存"""
        try:
            # 清空内存缓存
            self._memory_cache.clear()
            
            # 清空磁盘缓存
            for cache_file in self.results_cache_dir.glob("*.json"):
                cache_file.unlink()
            
            # 清空临时缓存
            for temp_file in self.temp_cache_dir.glob("*"):
                temp_file.unlink()
            
            self.logger.info("所有缓存已清空")
            
        except Exception as e:
            self.logger.error(f"清空缓存失败: {e}")
    
    def clear_history(self):
        """清空历史记录"""
        try:
            for history_file in self.history_cache_dir.glob("*.json"):
                history_file.unlink()
            
            self.logger.info("历史记录已清空")
            
        except Exception as e:
            self.logger.error(f"清空历史记录失败: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息
        
        Returns:
            缓存统计信息
        """
        try:
            # 统计缓存文件
            result_files = list(self.results_cache_dir.glob("*.json"))
            history_files = list(self.history_cache_dir.glob("*.json"))
            temp_files = list(self.temp_cache_dir.glob("*"))
            
            # 计算缓存大小
            total_size = 0
            for file_list in [result_files, history_files, temp_files]:
                for file_path in file_list:
                    total_size += file_path.stat().st_size
            
            return {
                'memory_cache_count': len(self._memory_cache),
                'result_cache_count': len(result_files),
                'history_count': len(history_files),
                'temp_files_count': len(temp_files),
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2)
            }
            
        except Exception as e:
            self.logger.error(f"获取缓存统计失败: {e}")
            return {}
    
    def _is_cache_valid(self, timestamp_str: str) -> bool:
        """检查缓存是否有效
        
        Args:
            timestamp_str: 时间戳字符串
            
        Returns:
            缓存是否有效
        """
        try:
            timestamp = datetime.fromisoformat(timestamp_str)
            return datetime.now() - timestamp < self.cache_ttl
        except Exception:
            return False
    
    def _cleanup_expired_cache(self):
        """清理过期缓存"""
        try:
            # 清理内存缓存
            expired_keys = []
            for key, item in self._memory_cache.items():
                if not self._is_cache_valid(item['timestamp']):
                    expired_keys.append(key)
            
            for key in expired_keys:
                del self._memory_cache[key]
            
            # 清理磁盘缓存
            for cache_file in self.results_cache_dir.glob("*.json"):
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        cached_data = json.load(f)
                    
                    if not self._is_cache_valid(cached_data['timestamp']):
                        cache_file.unlink()
                        
                except Exception:
                    # 如果文件损坏，直接删除
                    cache_file.unlink(missing_ok=True)
            
            if expired_keys:
                self.logger.debug(f"清理了 {len(expired_keys)} 个过期缓存")
                
        except Exception as e:
            self.logger.error(f"清理过期缓存失败: {e}")
    
    def export_history_to_csv(self, output_file: str) -> bool:
        """导出历史记录到CSV文件
        
        Args:
            output_file: 输出文件路径
            
        Returns:
            是否导出成功
        """
        try:
            import pandas as pd
            
            records = self.get_history_records(limit=1000)
            if not records:
                self.logger.warning("没有历史记录可导出")
                return False
            
            # 转换为DataFrame
            df_data = []
            for record in records:
                row = {
                    'ID': record.get('id', ''),
                    '时间': record.get('timestamp', ''),
                    '绕口令': record.get('text', ''),
                    '总分': record.get('overall_score', 0),
                    '准确度': record.get('accuracy_score', 0),
                    '流利度': record.get('fluency_score', 0),
                    '完整度': record.get('completeness_score', 0),
                    '等级': record.get('grade', '')
                }
                df_data.append(row)
            
            df = pd.DataFrame(df_data)
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            
            self.logger.info(f"历史记录已导出到: {output_file}")
            return True
            
        except ImportError:
            self.logger.error("需要安装pandas库才能导出CSV")
            return False
        except Exception as e:
            self.logger.error(f"导出历史记录失败: {e}")
            return False
    
    def save_evaluation_result(self, evaluation_result) -> str:
        """保存评测结果
        
        Args:
            evaluation_result: 评测结果对象
            
        Returns:
            保存的记录ID
        """
        try:
            # 将评测结果转换为可序列化的字典
            result_dict = {
                'overall_score': evaluation_result.sentence_score.overall_score,
                'pronunciation_score': evaluation_result.sentence_score.pronunciation_score,
                'fluency_score': evaluation_result.sentence_score.fluency_score,
                'integrity_score': evaluation_result.sentence_score.integrity_score,
                'tone_score': evaluation_result.sentence_score.tone_score,
                'grade_level': evaluation_result.grade_level,
                'feedback_summary': evaluation_result.feedback_summary,
                'detailed_feedback': evaluation_result.detailed_feedback,
                'improvement_tips': evaluation_result.improvement_tips,
                'timestamp': evaluation_result.timestamp.isoformat(),
                'raw_result': evaluation_result.raw_result
            }
            
            # 保存为历史记录
            record_id = self.save_history_record(result_dict)
            
            self.logger.debug(f"评测结果保存成功: {record_id}")
            return record_id
            
        except Exception as e:
            self.logger.error(f"保存评测结果失败: {e}")
            return ""

# 全局缓存管理器实例
cache_manager = CacheManager()