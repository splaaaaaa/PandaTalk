#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
绕口令库管理模块

提供绕口令内容管理、难度分级、分类检索等功能。
"""

import json
import random
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum

class DifficultyLevel(Enum):
    """难度等级枚举"""
    BEGINNER = "beginner"      # 初级
    INTERMEDIATE = "intermediate"  # 中级
    ADVANCED = "advanced"      # 高级
    EXPERT = "expert"          # 专家级

class Category(Enum):
    """绕口令分类枚举"""
    ANIMALS = "animals"        # 动物类
    FOOD = "food"             # 食物类
    NATURE = "nature"         # 自然类
    PEOPLE = "people"         # 人物类
    OBJECTS = "objects"       # 物品类
    ACTIONS = "actions"       # 动作类
    CLASSIC = "classic"       # 经典类
    MODERN = "modern"         # 现代类

@dataclass
class TwisterItem:
    """绕口令条目数据类"""
    id: str
    title: str
    content: str
    difficulty: DifficultyLevel
    category: Category
    description: str = ""
    keywords: List[str] = None
    pronunciation_tips: List[str] = None
    practice_points: List[str] = None
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []
        if self.pronunciation_tips is None:
            self.pronunciation_tips = []
        if self.practice_points is None:
            self.practice_points = []

class TwisterLibrary:
    """绕口令库管理类"""
    
    def __init__(self):
        """初始化绕口令库"""
        self.twisters: List[TwisterItem] = []
        self._load_default_twisters()
    
    def _load_default_twisters(self):
        """加载默认绕口令数据"""
        default_twisters = [
            {
                "id": "tw001",
                "title": "四是四，十是十",
                "content": "四是四，十是十，十四是十四，四十是四十。",
                "difficulty": DifficultyLevel.BEGINNER,
                "category": Category.CLASSIC,
                "description": "经典数字绕口令，练习平翘舌音",
                "keywords": ["数字", "平翘舌"],
                "pronunciation_tips": ["注意'四'和'十'的发音区别", "'十四'和'四十'要读清楚"],
                "practice_points": ["平舌音si", "翘舌音shi"]
            },
            {
                "id": "tw002",
                "title": "吃葡萄不吐葡萄皮",
                "content": "吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。",
                "difficulty": DifficultyLevel.INTERMEDIATE,
                "category": Category.FOOD,
                "description": "食物类绕口令，练习唇音和舌音配合",
                "keywords": ["葡萄", "唇音"],
                "pronunciation_tips": ["'葡萄'的'pu'和'tao'要清晰", "注意'吐'字的发音"],
                "practice_points": ["唇音p", "舌音t"]
            },
            {
                "id": "tw003",
                "title": "红凤凰",
                "content": "红凤凰，黄凤凰，红粉凤凰，粉红凤凰。",
                "difficulty": DifficultyLevel.ADVANCED,
                "category": Category.ANIMALS,
                "description": "动物类绕口令，练习鼻音和边音",
                "keywords": ["凤凰", "颜色", "鼻音"],
                "pronunciation_tips": ["'凤凰'的'feng'和'huang'要分清", "注意颜色词的连读"],
                "practice_points": ["鼻音ng", "边音l"]
            },
            {
                "id": "tw004",
                "title": "哥哥弟弟坡前坐",
                "content": "哥哥弟弟坡前坐，坡上卧着一只鹅，坡下流着一条河，哥哥说：宽宽的河，弟弟说：白白的鹅。鹅要过河，河要渡鹅，不知是鹅过河，还是河渡鹅。",
                "difficulty": DifficultyLevel.EXPERT,
                "category": Category.CLASSIC,
                "description": "经典长篇绕口令，综合练习多种音素",
                "keywords": ["哥弟", "河鹅", "综合练习"],
                "pronunciation_tips": ["注意'哥'、'鹅'、'河'的区别", "长句要保持节奏感"],
                "practice_points": ["声母g、h区别", "韵母e、o区别", "语调变化"]
            },
            {
                "id": "tw005",
                "title": "小猫钓鱼",
                "content": "小猫钓鱼，钓到小鱼，小鱼跳，小猫笑。",
                "difficulty": DifficultyLevel.BEGINNER,
                "category": Category.ANIMALS,
                "description": "简单动物绕口令，适合初学者",
                "keywords": ["小猫", "钓鱼", "简单"],
                "pronunciation_tips": ["注意'小'字的发音", "'钓'和'跳'要区分"],
                "practice_points": ["声母x", "韵母iao"]
            }
        ]
        
        for twister_data in default_twisters:
            twister = TwisterItem(
                id=twister_data["id"],
                title=twister_data["title"],
                content=twister_data["content"],
                difficulty=twister_data["difficulty"],
                category=twister_data["category"],
                description=twister_data.get("description", ""),
                keywords=twister_data.get("keywords", []),
                pronunciation_tips=twister_data.get("pronunciation_tips", []),
                practice_points=twister_data.get("practice_points", [])
            )
            self.twisters.append(twister)
    
    def get_all_twisters(self) -> List[TwisterItem]:
        """获取所有绕口令"""
        return self.twisters.copy()
    
    def get_by_id(self, twister_id: str) -> Optional[TwisterItem]:
        """根据ID获取绕口令"""
        for twister in self.twisters:
            if twister.id == twister_id:
                return twister
        return None
    
    def get_by_difficulty(self, difficulty: DifficultyLevel) -> List[TwisterItem]:
        """根据难度获取绕口令"""
        return [t for t in self.twisters if t.difficulty == difficulty]
    
    def get_by_category(self, category: Category) -> List[TwisterItem]:
        """根据分类获取绕口令"""
        return [t for t in self.twisters if t.category == category]
    
    def search_by_keyword(self, keyword: str) -> List[TwisterItem]:
        """根据关键词搜索绕口令"""
        results = []
        keyword_lower = keyword.lower()
        
        for twister in self.twisters:
            # 在标题、内容、描述、关键词中搜索
            if (keyword_lower in twister.title.lower() or
                keyword_lower in twister.content.lower() or
                keyword_lower in twister.description.lower() or
                any(keyword_lower in kw.lower() for kw in twister.keywords)):
                results.append(twister)
        
        return results
    
    def get_random_twister(self, difficulty: Optional[DifficultyLevel] = None,
                          category: Optional[Category] = None) -> Optional[TwisterItem]:
        """随机获取一个绕口令"""
        candidates = self.twisters
        
        if difficulty:
            candidates = [t for t in candidates if t.difficulty == difficulty]
        
        if category:
            candidates = [t for t in candidates if t.category == category]
        
        if not candidates:
            return None
        
        return random.choice(candidates)
    
    def get_difficulty_stats(self) -> Dict[str, int]:
        """获取难度分布统计"""
        stats = {}
        for difficulty in DifficultyLevel:
            count = len([t for t in self.twisters if t.difficulty == difficulty])
            stats[difficulty.value] = count
        return stats
    
    def get_category_stats(self) -> Dict[str, int]:
        """获取分类分布统计"""
        stats = {}
        for category in Category:
            count = len([t for t in self.twisters if t.category == category])
            stats[category.value] = count
        return stats
    
    def add_twister(self, twister: TwisterItem) -> bool:
        """添加新的绕口令"""
        # 检查ID是否已存在
        if self.get_by_id(twister.id):
            return False
        
        self.twisters.append(twister)
        return True
    
    def remove_twister(self, twister_id: str) -> bool:
        """删除绕口令"""
        for i, twister in enumerate(self.twisters):
            if twister.id == twister_id:
                del self.twisters[i]
                return True
        return False
    
    def update_twister(self, twister_id: str, **kwargs) -> bool:
        """更新绕口令信息"""
        twister = self.get_by_id(twister_id)
        if not twister:
            return False
        
        for key, value in kwargs.items():
            if hasattr(twister, key):
                setattr(twister, key, value)
        
        return True
    
    def export_to_json(self, filepath: str) -> bool:
        """导出绕口令库到JSON文件"""
        try:
            data = []
            for twister in self.twisters:
                twister_dict = {
                    "id": twister.id,
                    "title": twister.title,
                    "content": twister.content,
                    "difficulty": twister.difficulty.value,
                    "category": twister.category.value,
                    "description": twister.description,
                    "keywords": twister.keywords,
                    "pronunciation_tips": twister.pronunciation_tips,
                    "practice_points": twister.practice_points
                }
                data.append(twister_dict)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            print(f"导出失败: {e}")
            return False
    
    def import_from_json(self, filepath: str) -> bool:
        """从JSON文件导入绕口令库"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            imported_twisters = []
            for item in data:
                twister = TwisterItem(
                    id=item["id"],
                    title=item["title"],
                    content=item["content"],
                    difficulty=DifficultyLevel(item["difficulty"]),
                    category=Category(item["category"]),
                    description=item.get("description", ""),
                    keywords=item.get("keywords", []),
                    pronunciation_tips=item.get("pronunciation_tips", []),
                    practice_points=item.get("practice_points", [])
                )
                imported_twisters.append(twister)
            
            self.twisters = imported_twisters
            return True
        except Exception as e:
            print(f"导入失败: {e}")
            return False
    
    def get_practice_sequence(self, difficulty: DifficultyLevel, count: int = 5) -> List[TwisterItem]:
        """获取练习序列，按难度递进"""
        # 获取指定难度及以下的绕口令
        difficulty_order = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, 
                          DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT]
        
        max_index = difficulty_order.index(difficulty)
        candidates = []
        
        for i in range(max_index + 1):
            level_twisters = self.get_by_difficulty(difficulty_order[i])
            candidates.extend(level_twisters)
        
        # 随机选择并排序
        if len(candidates) <= count:
            return candidates
        
        selected = random.sample(candidates, count)
        # 按难度排序
        selected.sort(key=lambda x: difficulty_order.index(x.difficulty))
        
        return selected

# 创建全局实例
twister_library = TwisterLibrary()

def get_twister_library() -> TwisterLibrary:
    """获取绕口令库实例"""
    return twister_library