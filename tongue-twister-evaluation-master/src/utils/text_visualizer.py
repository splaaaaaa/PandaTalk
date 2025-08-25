from typing import List, Dict, Any
from colorama import Fore, Style, init

# 初始化colorama以支持Windows控制台颜色
init(autoreset=True)

class TextVisualizer:
    """文本可视化工具，用于显示带有错误标记的绕口令文本"""
    
    def __init__(self):
        self.error_colors = {
            1: Fore.YELLOW,    # 轻微错误 - 黄色
            2: Fore.RED,       # 明显错误 - 红色
            3: Fore.MAGENTA    # 严重错误 - 紫色
        }
    
    def visualize_text_with_errors(self, text: str, word_details: List[Dict[str, Any]]) -> str:
        """可视化显示带有错误标记的文本
        
        Args:
            text: 原始绕口令文本
            word_details: 单词详细信息列表，包含错误信息
            
        Returns:
            带有颜色标记的文本字符串
        """
        # 创建字符到错误信息的映射
        char_errors = {}
        for word in word_details:
            content = word.get('content', '')
            errors = word.get('errors', [])
            if errors:
                # 找到最严重的错误级别
                max_error_level = max(error['error_level'] for error in errors)
                char_errors[content] = max_error_level
        
        # 构建可视化文本
        result = []
        for char in text:
            if char in char_errors:
                error_level = char_errors[char]
                color = self.error_colors.get(error_level, Fore.RED)
                result.append(f"{color}{char}{Style.RESET_ALL}")
            else:
                result.append(char)
        
        return ''.join(result)
    
    def generate_error_report(self, text: str, word_details: List[Dict[str, Any]]) -> str:
        """生成详细的错误报告
        
        Args:
            text: 原始绕口令文本
            word_details: 单词详细信息列表，包含错误信息
            
        Returns:
            详细的错误报告字符串
        """
        report = []
        report.append("\n=== 发音错误分析 ===")
        report.append(f"原文：{text}")
        report.append(f"标记：{self.visualize_text_with_errors(text, word_details)}")
        report.append("\n图例：")
        report.append(f"  {Fore.YELLOW}黄色{Style.RESET_ALL} - 轻微错误")
        report.append(f"  {Fore.RED}红色{Style.RESET_ALL} - 明显错误")
        report.append(f"  {Fore.MAGENTA}紫色{Style.RESET_ALL} - 严重错误")
        
        # 统计错误
        error_chars = []
        for word in word_details:
            content = word.get('content', '')
            errors = word.get('errors', [])
            if errors:
                error_chars.append({
                    'char': content,
                    'symbol': word.get('symbol', ''),
                    'errors': errors
                })
        
        if error_chars:
            report.append("\n=== 具体错误详情 ===")
            for item in error_chars:
                char = item['char']
                symbol = item['symbol']
                errors = item['errors']
                
                report.append(f"\n字：{char} (标准拼音：{symbol})")
                for error in errors:
                    error_type = "韵母" if error['is_yun'] else "声母"
                    phone = error['phone_content']
                    level = error['error_type']
                    tone_info = f"，声调：{error['tone']}" if error['tone'] else ""
                    report.append(f"  - {error_type} '{phone}' {level}{tone_info}")
        else:
            report.append("\n✅ 未发现明显的发音错误！")
        
        return '\n'.join(report)
    
    def generate_html_visualization(self, text: str, word_details: List[Dict[str, Any]]) -> str:
        """生成HTML格式的可视化文本
        
        Args:
            text: 原始绕口令文本
            word_details: 单词详细信息列表，包含错误信息
            
        Returns:
            HTML格式的可视化文本
        """
        # 创建字符到错误信息的映射
        char_errors = {}
        for word in word_details:
            content = word.get('content', '')
            errors = word.get('errors', [])
            if errors:
                max_error_level = max(error['error_level'] for error in errors)
                char_errors[content] = {
                    'level': max_error_level,
                    'details': errors
                }
        
        # HTML样式
        html_styles = {
            1: 'color: #FFA500; font-weight: bold;',  # 橙色
            2: 'color: #FF0000; font-weight: bold;',  # 红色
            3: 'color: #8B008B; font-weight: bold;'   # 紫色
        }
        
        # 构建HTML
        html_parts = ['<div style="font-size: 24px; font-family: SimHei, Microsoft YaHei, sans-serif;">']
        
        for char in text:
            if char in char_errors:
                error_info = char_errors[char]
                level = error_info['level']
                style = html_styles.get(level, html_styles[2])
                
                # 创建工具提示
                tooltip_text = []
                for error in error_info['details']:
                    error_type = "韵母" if error['is_yun'] else "声母"
                    tooltip_text.append(f"{error_type}错误: {error['error_type']}")
                tooltip = '; '.join(tooltip_text)
                
                html_parts.append(f'<span style="{style}" title="{tooltip}">{char}</span>')
            else:
                html_parts.append(char)
        
        html_parts.append('</div>')
        
        # 添加图例
        legend = '''
        <div style="margin-top: 20px; font-size: 14px;">
            <p><strong>错误标记图例：</strong></p>
            <p><span style="color: #FFA500; font-weight: bold;">橙色</span> - 轻微错误</p>
            <p><span style="color: #FF0000; font-weight: bold;">红色</span> - 明显错误</p>
            <p><span style="color: #8B008B; font-weight: bold;">紫色</span> - 严重错误</p>
        </div>
        '''
        
        return ''.join(html_parts) + legend