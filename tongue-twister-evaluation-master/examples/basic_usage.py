# -*- coding: utf-8 -*-
"""
绕口令语音评测系统 - 基础使用示例

这个示例展示了如何使用绕口令评测系统的基本功能：
1. 初始化系统
2. 选择绕口令
3. 录音和评测
4. 查看结果

运行前请确保：
1. 已安装所需依赖包
2. 已配置讯飞API密钥
3. 麦克风设备正常工作
"""

import sys
import os
import asyncio
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from src.twister_evaluator import TwisterEvaluator
from src.utils.twister_library import TwisterLibrary
from src.utils.text_visualizer import TextVisualizer
from config.xfyun_config import XFYunConfig

def print_separator(title: str = ""):
    """打印分隔线"""
    if title:
        print(f"\n{'='*20} {title} {'='*20}")
    else:
        print("="*50)

def display_twister_info(twister_data: dict):
    """显示绕口令信息"""
    print(f"标题: {twister_data['title']}")
    print(f"难度: {twister_data['difficulty']}")
    print(f"类别: {twister_data['category']}")
    print(f"重点: {twister_data['focus']}")
    print(f"内容: {twister_data['text']}")
    print(f"提示: {twister_data['tips']}")
    print(f"预计时间: {twister_data['estimated_time']}秒")

def display_evaluation_result(result, twister_text=None):
    """显示评测结果"""
    if not result:
        print("评测失败，请检查网络连接和API配置")
        return
    
    print_separator("评测结果")
    print(f"总分: {result.sentence_score.overall_score:.1f}分")
    print(f"等级: {result.grade_level}")
    
    print("\n各维度得分:")
    print(f"  发音准确度: {result.sentence_score.pronunciation_score:.1f}分")
    print(f"  流利度: {result.sentence_score.fluency_score:.1f}分")
    print(f"  完整度: {result.sentence_score.integrity_score:.1f}分")
    print(f"  声调: {result.sentence_score.tone_score:.1f}分")
    print(f"  语速: {result.sentence_score.speed_score:.1f}分")
    
    print(f"\n总体评价: {result.feedback_summary}")
    
    if result.detailed_feedback:
        print("\n详细反馈:")
        for feedback in result.detailed_feedback:
            print(f"  - {feedback}")
    
    if result.improvement_tips:
        print("\n改进建议:")
        for tip in result.improvement_tips:
            print(f"  - {tip}")
    
    # 显示错误可视化（放在最后，避免重复）
    if hasattr(result, 'error_visualization') and result.error_visualization:
        print("\n📝 绕口令文本（错误标记）:")
        print(result.error_visualization)
    
    if hasattr(result, 'error_report') and result.error_report:
        print("\n🔍 发音错误详情:")
        print(result.error_report)
    
    # 显示HTML可视化文件信息（如果有）
    if hasattr(result, 'html_visualization_file') and result.html_visualization_file:
        print(f"\n🌐 HTML可视化文件: {result.html_visualization_file}")
        print("   您可以在浏览器中打开此文件查看详细的错误可视化效果")

async def interactive_demo():
    """交互式演示"""
    print_separator("绕口令语音评测系统")
    print("欢迎使用PandaTalk绕口令语音评测系统！")
    print("这个系统可以帮助您练习普通话发音，提高语言表达能力。")
    
    # 检查配置
    config = XFYunConfig()
    if not config.validate_config():
        print("\n❌ 配置检查失败！")
        print("请检查以下配置项：")
        print("1. 讯飞API密钥是否正确设置")
        print("2. config/xfyun_config.py文件是否存在")
        print("\n请参考README.md完成配置后再运行。")
        return
    
    print("\n✅ 配置检查通过！")
    
    # 初始化系统
    try:
        evaluator = TwisterEvaluator()
        library = TwisterLibrary()
        print("✅ 系统初始化成功！")
    except Exception as e:
        print(f"❌ 系统初始化失败: {e}")
        return
    
    while True:
        print_separator("主菜单")
        print("请选择功能：")
        print("1. 浏览绕口令库")
        print("2. 开始语音评测")
        print("3. 查看历史记录")
        print("4. 系统信息")
        print("0. 退出系统")
        
        choice = input("\n请输入选项 (0-4): ").strip()
        
        if choice == "0":
            print("感谢使用！再见！")
            break
        elif choice == "1":
            await browse_twisters(library)
        elif choice == "2":
            await start_evaluation(evaluator, library)
        elif choice == "3":
            view_history(evaluator)
        elif choice == "4":
            show_system_info(library)
        else:
            print("无效选项，请重新选择。")

async def browse_twisters(library: TwisterLibrary):
    """浏览绕口令库"""
    print_separator("绕口令库")
    
    # 显示统计信息
    difficulty_stats = library.get_difficulty_stats()
    category_stats = library.get_category_stats()
    
    print("库存统计:")
    print(f"  难度分布: {difficulty_stats}")
    print(f"  类别分布: {category_stats}")
    
    while True:
        print("\n浏览选项：")
        print("1. 按难度浏览")
        print("2. 按类别浏览")
        print("3. 搜索绕口令")
        print("4. 随机推荐")
        print("5. 推荐练习序列")
        print("0. 返回主菜单")
        
        choice = input("请选择 (0-5): ").strip()
        
        if choice == "0":
            break
        elif choice == "1":
            browse_by_difficulty(library)
        elif choice == "2":
            browse_by_category(library)
        elif choice == "3":
            search_twisters(library)
        elif choice == "4":
            show_random_twister(library)
        elif choice == "5":
            show_recommended_sequence(library)
        else:
            print("无效选项，请重新选择。")

def browse_by_difficulty(library: TwisterLibrary):
    """按难度浏览"""
    print("\n选择难度级别：")
    print("1. 初级")
    print("2. 中级")
    print("3. 高级")
    
    choice = input("请选择 (1-3): ").strip()
    difficulty_map = {"1": "初级", "2": "中级", "3": "高级"}
    
    if choice in difficulty_map:
        difficulty = difficulty_map[choice]
        twisters = library.get_twisters_by_difficulty(difficulty)
        
        print(f"\n{difficulty}绕口令 (共{len(twisters)}个):")
        for i, twister in enumerate(twisters, 1):
            print(f"\n{i}. {twister['title']}")
            print(f"   内容: {twister['text']}")
            print(f"   重点: {twister['focus']}")
    else:
        print("无效选择")

def browse_by_category(library: TwisterLibrary):
    """按类别浏览"""
    categories = list(library.get_category_stats().keys())
    
    print("\n选择类别：")
    for i, category in enumerate(categories, 1):
        print(f"{i}. {category}")
    
    try:
        choice = int(input("请选择: ").strip())
        if 1 <= choice <= len(categories):
            category = categories[choice - 1]
            twisters = library.get_twisters_by_category(category)
            
            print(f"\n{category} (共{len(twisters)}个):")
            for i, twister in enumerate(twisters, 1):
                print(f"\n{i}. {twister['title']}")
                print(f"   内容: {twister['text']}")
                print(f"   难度: {twister['difficulty']}")
        else:
            print("无效选择")
    except ValueError:
        print("请输入有效数字")

def search_twisters(library: TwisterLibrary):
    """搜索绕口令"""
    keyword = input("\n请输入搜索关键词: ").strip()
    if not keyword:
        print("关键词不能为空")
        return
    
    results = library.search_twisters(keyword)
    
    if results:
        print(f"\n找到 {len(results)} 个相关绕口令:")
        for i, twister in enumerate(results, 1):
            print(f"\n{i}. {twister['title']}")
            print(f"   内容: {twister['text']}")
            print(f"   难度: {twister['difficulty']}")
            print(f"   重点: {twister['focus']}")
    else:
        print(f"未找到包含'{keyword}'的绕口令")

def show_random_twister(library: TwisterLibrary):
    """显示随机绕口令"""
    twister = library.get_random_twister()
    if twister:
        print("\n🎲 随机推荐:")
        display_twister_info(twister)
    else:
        print("获取随机绕口令失败")

def show_recommended_sequence(library: TwisterLibrary):
    """显示推荐练习序列"""
    print("\n选择您的水平：")
    print("1. 初级")
    print("2. 中级")
    print("3. 高级")
    
    choice = input("请选择 (1-3): ").strip()
    level_map = {"1": "初级", "2": "中级", "3": "高级"}
    
    if choice in level_map:
        level = level_map[choice]
        sequence = library.get_recommended_sequence(level)
        
        print(f"\n📚 {level}推荐练习序列:")
        for i, twister in enumerate(sequence, 1):
            print(f"\n第{i}步: {twister['title']}")
            print(f"  内容: {twister['text']}")
            print(f"  重点: {twister['focus']}")
            print(f"  提示: {twister['tips']}")
    else:
        print("无效选择")

async def start_evaluation(evaluator: TwisterEvaluator, library: TwisterLibrary):
    """开始语音评测"""
    print_separator("语音评测")
    
    # 选择绕口令
    print("请选择绕口令：")
    print("1. 从推荐列表选择")
    print("2. 随机选择")
    print("3. 搜索选择")
    
    choice = input("请选择 (1-3): ").strip()
    twister = None
    
    if choice == "1":
        twister = select_from_recommended(library)
    elif choice == "2":
        twister = library.get_random_twister()
    elif choice == "3":
        twister = select_from_search(library)
    else:
        print("无效选择")
        return
    
    if not twister:
        print("未选择绕口令")
        return
    
    print_separator("准备评测")
    display_twister_info(twister)
    
    input("\n请准备好后按回车键开始录音...")
    
    try:
        # 开始评测
        print("\n🎤 开始录音，请朗读上面的绕口令...")
        print("(录音中，按回车键结束录音)")
        
        # 生成录音文件名
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_filename = f"recordings/{twister['title']}_{timestamp}.wav"
        
        result = await evaluator.evaluate_speech_interactive(
            text=twister['text'],
            save_audio=True,
            audio_filename=audio_filename
        )
        
        # 显示结果
        display_evaluation_result(result, twister['text'])
        
        # 保存记录
        if result:
            evaluator.add_history_record({
                'twister_id': twister['id'],
                'twister_title': twister['title'],
                'result': result
            })
            print("\n✅ 评测记录已保存")
            print(f"🎵 录音文件已保存至: {audio_filename}")
        
    except KeyboardInterrupt:
        print("\n录音被用户中断")
    except Exception as e:
        print(f"\n❌ 评测过程出错: {e}")

def select_from_recommended(library: TwisterLibrary) -> dict:
    """从推荐列表选择"""
    print("\n选择难度：")
    print("1. 初级")
    print("2. 中级")
    print("3. 高级")
    
    choice = input("请选择 (1-3): ").strip()
    level_map = {"1": "初级", "2": "中级", "3": "高级"}
    
    if choice not in level_map:
        return None
    
    level = level_map[choice]
    twisters = library.get_twisters_by_difficulty(level)
    
    if not twisters:
        print(f"没有找到{level}绕口令")
        return None
    
    print(f"\n{level}绕口令列表：")
    for i, twister in enumerate(twisters[:10], 1):  # 最多显示10个
        print(f"{i}. {twister['title']} - {twister['focus']}")
    
    try:
        choice = int(input(f"请选择 (1-{min(len(twisters), 10)}): ").strip())
        if 1 <= choice <= min(len(twisters), 10):
            return twisters[choice - 1]
    except ValueError:
        pass
    
    print("无效选择")
    return None

def select_from_search(library: TwisterLibrary) -> dict:
    """从搜索结果选择"""
    keyword = input("\n请输入搜索关键词: ").strip()
    if not keyword:
        return None
    
    results = library.search_twisters(keyword)
    
    if not results:
        print(f"未找到包含'{keyword}'的绕口令")
        return None
    
    print(f"\n搜索结果 (共{len(results)}个):")
    for i, twister in enumerate(results[:10], 1):  # 最多显示10个
        print(f"{i}. {twister['title']} - {twister['difficulty']}")
    
    try:
        choice = int(input(f"请选择 (1-{min(len(results), 10)}): ").strip())
        if 1 <= choice <= min(len(results), 10):
            return results[choice - 1]
    except ValueError:
        pass
    
    print("无效选择")
    return None

def view_history(evaluator: TwisterEvaluator):
    """查看历史记录"""
    print_separator("历史记录")
    
    history = evaluator.get_history()
    
    if not history:
        print("暂无评测记录")
        return
    
    print(f"共有 {len(history)} 条评测记录:\n")
    
    for i, record in enumerate(history[-10:], 1):  # 显示最近10条
        print(f"{i}. {record.get('twister_title', '未知')}")
        result = record.get('result')
        if result:
            print(f"   得分: {result.overall_score:.1f}分 ({result.grade})")
            print(f"   时间: {record.get('timestamp', '未知')}")
        print()

def show_system_info(library: TwisterLibrary):
    """显示系统信息"""
    print_separator("系统信息")
    
    # 绕口令库统计
    difficulty_stats = library.get_difficulty_stats()
    category_stats = library.get_category_stats()
    total_twisters = sum(difficulty_stats.values())
    
    print("📚 绕口令库信息:")
    print(f"  总数量: {total_twisters}个")
    print(f"  难度分布: {difficulty_stats}")
    print(f"  类别分布: {category_stats}")
    
    # 系统配置
    config = XFYunConfig()
    print("\n⚙️ 系统配置:")
    print(f"  API服务: 讯飞语音评测")
    print(f"  音频格式: {config.AUDIO_FORMAT}")
    print(f"  采样率: {config.SAMPLE_RATE}Hz")
    print(f"  评测语言: {config.LANGUAGE}")
    print(f"  口音类型: {config.ACCENT}")
    
    print("\n🎯 功能特性:")
    print("  ✅ 实时语音录制")
    print("  ✅ 智能语音评测")
    print("  ✅ 多维度打分")
    print("  ✅ 详细反馈建议")
    print("  ✅ 历史记录管理")
    print("  ✅ 个性化推荐")

def main():
    """主函数"""
    try:
        # 检查Python版本
        if sys.version_info < (3, 7):
            print("❌ 需要Python 3.7或更高版本")
            return
        
        # 运行异步主程序
        asyncio.run(interactive_demo())
        
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"\n程序运行出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()