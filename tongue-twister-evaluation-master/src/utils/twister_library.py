# -*- coding: utf-8 -*-
"""
绕口令文本库

这个模块包含了各种难度的绕口令文本，供用户选择练习。

绕口令分类：
- 初级：简单的声母、韵母练习
- 中级：复杂的音素组合
- 高级：长篇绕口令，综合练习

每个绕口令包含：
- ID：唯一标识
- 标题：绕口令名称
- 文本：完整内容
- 难度：初级/中级/高级
- 重点：练习的语音要点
- 提示：练习建议
"""

from typing import List, Dict, Any, Optional
import json
from pathlib import Path

class TwisterLibrary:
    """绕口令文本库
    
    管理所有绕口令文本，提供按难度、类型筛选功能
    """
    
    def __init__(self):
        """初始化绕口令库"""
        self.twisters = self._load_default_twisters()
    
    def _load_default_twisters(self) -> List[Dict[str, Any]]:
        """加载默认绕口令库
        
        Returns:
            绕口令列表
        """
        return [
            # 初级绕口令 - 声母练习
            {
                "id": "beginner_001",
                "title": "四是四",
                "text": "四是四，十是十，十四是十四，四十是四十。",
                "difficulty": "初级",
                "focus": "s/sh音区分",
                "tips": "注意区分平舌音's'和翘舌音'sh'，舌位要准确",
                "category": "声母练习",
                "estimated_time": 3
            },
            {
                "id": "beginner_002",
                "title": "知道不知道",
                "text": "知道就说知道，不知道就说不知道，不要知道说不知道，不知道说知道。",
                "difficulty": "初级",
                "focus": "zh/z音区分",
                "tips": "区分翘舌音'zh'和平舌音'z'，注意舌头位置",
                "category": "声母练习",
                "estimated_time": 4
            },
            {
                "id": "beginner_003",
                "title": "吃葡萄",
                "text": "吃葡萄不吐葡萄皮，不吃葡萄倒吐葡萄皮。",
                "difficulty": "初级",
                "focus": "p/t音练习",
                "tips": "注意爆破音的清晰发音，不要含糊",
                "category": "声母练习",
                "estimated_time": 3
            },
            {
                "id": "beginner_004",
                "title": "红凤凰",
                "text": "红凤凰，黄凤凰，粉红凤凰花凤凰。",
                "difficulty": "初级",
                "focus": "f/h音练习",
                "tips": "注意唇齿音'f'和舌根音'h'的区别",
                "category": "声母练习",
                "estimated_time": 3
            },
            {
                "id": "beginner_005",
                "title": "妈妈骂马",
                "text": "妈妈骑马，马慢，妈妈骂马。",
                "difficulty": "初级",
                "focus": "m音练习",
                "tips": "注意鼻音'm'的发音，嘴唇要闭合",
                "category": "声母练习",
                "estimated_time": 2
            },
            
            # 初级绕口令 - 韵母练习
            {
                "id": "beginner_006",
                "title": "小猫钓鱼",
                "text": "小猫钓鱼，钓到小鱼，小猫乐得笑嘻嘻。",
                "difficulty": "初级",
                "focus": "i/u韵母",
                "tips": "注意前高元音'i'和后高元音'u'的口型变化",
                "category": "韵母练习",
                "estimated_time": 3
            },
            {
                "id": "beginner_007",
                "title": "鹅过河",
                "text": "哥哥弟弟坡前坐，坡上卧着一只鹅，坡下流着一条河。",
                "difficulty": "初级",
                "focus": "e/o韵母",
                "tips": "注意中元音'e'和后元音'o'的发音位置",
                "category": "韵母练习",
                "estimated_time": 4
            },
            
            # 中级绕口令 - 复合音练习
            {
                "id": "intermediate_001",
                "title": "石狮子",
                "text": "石室诗士施氏，嗜狮，誓食十狮。氏时时适市视狮。",
                "difficulty": "中级",
                "focus": "sh/s音综合",
                "tips": "这是经典的平翘舌音练习，要特别注意每个字的发音",
                "category": "综合练习",
                "estimated_time": 5
            },
            {
                "id": "intermediate_002",
                "title": "老六放牛",
                "text": "柳林镇有个六号楼，刘老六住六号楼。有一天，来了牛老六，牵了六只猴，还有侯老六，拉了六头牛，住上刘老六的六号楼。",
                "difficulty": "中级",
                "focus": "l/n音区分",
                "tips": "注意边音'l'和鼻音'n'的区别，舌头位置要准确",
                "category": "声母练习",
                "estimated_time": 8
            },
            {
                "id": "intermediate_003",
                "title": "白石塔",
                "text": "白石白又滑，搬来白石搭白塔。白石搭白塔，白塔白石搭。搭好白石塔，白塔白又滑。",
                "difficulty": "中级",
                "focus": "b/p音练习",
                "tips": "注意不送气音'b'和送气音'p'的区别",
                "category": "声母练习",
                "estimated_time": 6
            },
            {
                "id": "intermediate_004",
                "title": "哑巴和喇嘛",
                "text": "打南边来了个哑巴，腰里别了个喇叭；打北边来了个喇嘛，手里提了个獭犸。提着獭犸的喇嘛要拿獭犸换别着喇叭的哑巴的喇叭。",
                "difficulty": "中级",
                "focus": "复合音练习",
                "tips": "这是综合性练习，注意语速和清晰度的平衡",
                "category": "综合练习",
                "estimated_time": 10
            },
            {
                "id": "intermediate_005",
                "title": "花和瓜",
                "text": "瓜藤开花像喇叭，娃娃爱花不掐花。瓜藤开花瓜花开，没花就没瓜。",
                "difficulty": "中级",
                "focus": "g/k/h音练习",
                "tips": "注意舌根音的发音位置，不要混淆",
                "category": "声母练习",
                "estimated_time": 5
            },
            
            # 高级绕口令 - 长篇综合练习
            {
                "id": "advanced_001",
                "title": "化肥会挥发",
                "text": "黑化肥发灰，灰化肥发黑。黑化肥发灰会挥发，灰化肥挥发会发黑。黑化肥挥发发灰会花飞，灰化肥挥发发黑会飞花。",
                "difficulty": "高级",
                "focus": "f/h音高难度",
                "tips": "这是最具挑战性的绕口令之一，需要大量练习",
                "category": "综合练习",
                "estimated_time": 8
            },
            {
                "id": "advanced_002",
                "title": "司小四和史小世",
                "text": "司小四和史小世，四月十四日十四时四十上集市，司小四买了四十四斤四两西红柿，史小世买了十四斤四两细蚕丝。",
                "difficulty": "高级",
                "focus": "s/sh音高难度",
                "tips": "包含大量数字和平翘舌音，需要特别仔细",
                "category": "综合练习",
                "estimated_time": 10
            },
            {
                "id": "advanced_003",
                "title": "老龙恼怒闹老农",
                "text": "老龙恼怒闹老农，老农恼怒闹老龙。农怒龙恼农更怒，龙恼农怒龙更恼。",
                "difficulty": "高级",
                "focus": "l/n音高难度",
                "tips": "快速的l/n音转换，考验舌头的灵活性",
                "category": "声母练习",
                "estimated_time": 6
            },
            {
                "id": "advanced_004",
                "title": "牛郎恋刘娘",
                "text": "牛郎恋刘娘，刘娘念牛郎，牛郎年年念刘娘，刘娘年年恋牛郎，郎念娘来娘恋郎。",
                "difficulty": "高级",
                "focus": "l/n音韵律",
                "tips": "注意韵律和节奏，不要只追求速度",
                "category": "综合练习",
                "estimated_time": 7
            },
            {
                "id": "advanced_005",
                "title": "扁担长板凳宽",
                "text": "扁担长，板凳宽，扁担没有板凳宽，板凳没有扁担长。扁担绑在板凳上，板凳不让扁担绑在板凳上。",
                "difficulty": "高级",
                "focus": "b/p/d/t音",
                "tips": "多种爆破音的组合，要注意清晰度",
                "category": "综合练习",
                "estimated_time": 8
            },
            
            # 特殊类型 - 声调练习
            {
                "id": "tone_001",
                "title": "妈妈骂马",
                "text": "妈妈骑马，马慢，妈妈骂马。",
                "difficulty": "初级",
                "focus": "四声练习",
                "tips": "注意'妈(mā)''马(mǎ)''骂(mà)'的声调变化",
                "category": "声调练习",
                "estimated_time": 3
            },
            {
                "id": "tone_002",
                "title": "狮子史",
                "text": "狮子史，史狮子，狮子史史狮子。",
                "difficulty": "中级",
                "focus": "声调+平翘舌",
                "tips": "同时练习声调和平翘舌音",
                "category": "声调练习",
                "estimated_time": 4
            }
        ]
    
    def get_all_twisters(self) -> List[Dict[str, Any]]:
        """获取所有绕口令
        
        Returns:
            所有绕口令列表
        """
        return self.twisters.copy()
    
    def get_twisters_by_difficulty(self, difficulty: str) -> List[Dict[str, Any]]:
        """根据难度获取绕口令
        
        Args:
            difficulty: 难度级别（初级/中级/高级/全部）
            
        Returns:
            符合条件的绕口令列表
        """
        if difficulty == "全部":
            return self.get_all_twisters()
        
        return [t for t in self.twisters if t['difficulty'] == difficulty]
    
    def get_twisters_by_category(self, category: str) -> List[Dict[str, Any]]:
        """根据类别获取绕口令
        
        Args:
            category: 类别（声母练习/韵母练习/声调练习/综合练习）
            
        Returns:
            符合条件的绕口令列表
        """
        return [t for t in self.twisters if t['category'] == category]
    
    def get_twister_by_id(self, twister_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取绕口令
        
        Args:
            twister_id: 绕口令ID
            
        Returns:
            绕口令信息，如果不存在返回None
        """
        for twister in self.twisters:
            if twister['id'] == twister_id:
                return twister.copy()
        return None
    
    def search_twisters(self, keyword: str) -> List[Dict[str, Any]]:
        """搜索绕口令
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            包含关键词的绕口令列表
        """
        keyword = keyword.lower()
        results = []
        
        for twister in self.twisters:
            # 在标题、文本、重点中搜索
            if (keyword in twister['title'].lower() or 
                keyword in twister['text'].lower() or 
                keyword in twister['focus'].lower()):
                results.append(twister.copy())
        
        return results
    
    def get_random_twister(self, difficulty: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """获取随机绕口令
        
        Args:
            difficulty: 指定难度，None表示任意难度
            
        Returns:
            随机绕口令
        """
        import random
        
        if difficulty:
            candidates = self.get_twisters_by_difficulty(difficulty)
        else:
            candidates = self.twisters
        
        if candidates:
            return random.choice(candidates).copy()
        return None
    
    def get_difficulty_stats(self) -> Dict[str, int]:
        """获取难度统计
        
        Returns:
            各难度级别的绕口令数量
        """
        stats = {"初级": 0, "中级": 0, "高级": 0}
        
        for twister in self.twisters:
            difficulty = twister['difficulty']
            if difficulty in stats:
                stats[difficulty] += 1
        
        return stats
    
    def get_category_stats(self) -> Dict[str, int]:
        """获取类别统计
        
        Returns:
            各类别的绕口令数量
        """
        stats = {}
        
        for twister in self.twisters:
            category = twister['category']
            stats[category] = stats.get(category, 0) + 1
        
        return stats
    
    def add_custom_twister(self, twister_data: Dict[str, Any]) -> bool:
        """添加自定义绕口令
        
        Args:
            twister_data: 绕口令数据
            
        Returns:
            添加是否成功
        """
        required_fields = ['id', 'title', 'text', 'difficulty', 'focus', 'tips', 'category']
        
        # 检查必需字段
        for field in required_fields:
            if field not in twister_data:
                return False
        
        # 检查ID是否已存在
        if self.get_twister_by_id(twister_data['id']):
            return False
        
        # 添加默认字段
        if 'estimated_time' not in twister_data:
            twister_data['estimated_time'] = len(twister_data['text']) // 10 + 2
        
        self.twisters.append(twister_data)
        return True
    
    def remove_twister(self, twister_id: str) -> bool:
        """删除绕口令
        
        Args:
            twister_id: 绕口令ID
            
        Returns:
            删除是否成功
        """
        for i, twister in enumerate(self.twisters):
            if twister['id'] == twister_id:
                del self.twisters[i]
                return True
        return False
    
    def save_to_file(self, filename: str) -> bool:
        """保存绕口令库到文件
        
        Args:
            filename: 文件名
            
        Returns:
            保存是否成功
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.twisters, f, ensure_ascii=False, indent=2)
            return True
        except Exception:
            return False
    
    def load_from_file(self, filename: str) -> bool:
        """从文件加载绕口令库
        
        Args:
            filename: 文件名
            
        Returns:
            加载是否成功
        """
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                self.twisters = json.load(f)
            return True
        except Exception:
            return False
    
    def get_recommended_sequence(self, user_level: str = "初级") -> List[Dict[str, Any]]:
        """获取推荐的练习序列
        
        Args:
            user_level: 用户水平
            
        Returns:
            推荐的练习序列
        """
        if user_level == "初级":
            # 初学者：从简单的声母练习开始
            sequence_ids = [
                "beginner_005",  # 妈妈骂马（最简单）
                "beginner_001",  # 四是四
                "beginner_003",  # 吃葡萄
                "beginner_002",  # 知道不知道
                "beginner_004",  # 红凤凰
            ]
        elif user_level == "中级":
            # 中级：混合练习
            sequence_ids = [
                "intermediate_003",  # 白石塔
                "intermediate_005",  # 花和瓜
                "intermediate_002",  # 老六放牛
                "intermediate_001",  # 石狮子
            ]
        else:  # 高级
            # 高级：挑战性练习
            sequence_ids = [
                "advanced_003",  # 老龙恼怒
                "advanced_004",  # 牛郎恋刘娘
                "advanced_005",  # 扁担长板凳宽
                "advanced_001",  # 化肥会挥发
                "advanced_002",  # 司小四和史小世
            ]
        
        sequence = []
        for twister_id in sequence_ids:
            twister = self.get_twister_by_id(twister_id)
            if twister:
                sequence.append(twister)
        
        return sequence

# 使用示例
if __name__ == "__main__":
    library = TwisterLibrary()
    
    print("=== 绕口令文本库 ===")
    
    # 统计信息
    difficulty_stats = library.get_difficulty_stats()
    category_stats = library.get_category_stats()
    
    print(f"\n难度统计: {difficulty_stats}")
    print(f"类别统计: {category_stats}")
    
    # 获取初级绕口令
    beginner_twisters = library.get_twisters_by_difficulty("初级")
    print(f"\n初级绕口令 ({len(beginner_twisters)}个):")
    for twister in beginner_twisters[:3]:
        print(f"  - {twister['title']}: {twister['text']}")
    
    # 搜索功能
    search_results = library.search_twisters("四")
    print(f"\n搜索'四'的结果 ({len(search_results)}个):")
    for twister in search_results:
        print(f"  - {twister['title']}: {twister['text']}")
    
    # 推荐序列
    recommended = library.get_recommended_sequence("初级")
    print(f"\n初级推荐练习序列:")
    for i, twister in enumerate(recommended, 1):
        print(f"  {i}. {twister['title']} - {twister['focus']}")
    
    print("\n绕口令文本库加载完成！")