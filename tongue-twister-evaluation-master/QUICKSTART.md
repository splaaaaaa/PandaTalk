# 🚀 快速开始指南

欢迎使用PandaTalk绕口令语音评测系统！这个指南将帮助您在5分钟内完成系统配置并开始使用。

## 📋 准备工作

### 1. 环境要求
- Python 3.7 或更高版本
- Windows/macOS/Linux 操作系统
- 麦克风设备
- 稳定的网络连接

### 2. 获取讯飞API密钥

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 注册账号并登录
3. 创建新应用：
   - 选择「语音评测」服务
   - 记录下 `APPID`、`API_SECRET`、`API_KEY`

## ⚡ 5分钟快速配置

### 步骤1：检查环境

```bash
# 运行环境检查脚本
python check_setup.py
```

如果看到错误，请按照提示进行修复。

### 步骤2：安装依赖

```bash
# 安装所有依赖包
pip install -r requirements.txt

# 如果PyAudio安装失败，尝试：
# Windows:
pip install pipwin
pipwin install pyaudio

# macOS:
brew install portaudio
pip install pyaudio

# Linux:
sudo apt-get install python3-pyaudio
```

### 步骤3：配置API密钥

编辑 `config/xfyun_config.py` 文件：

```python
class XFYunConfig:
    # 替换为您的实际API密钥
    APPID = "your_actual_appid"        # 替换这里
    API_SECRET = "your_actual_secret"  # 替换这里
    API_KEY = "your_actual_key"        # 替换这里
```

### 步骤4：验证配置

```bash
# 再次运行检查脚本
python check_setup.py
```

看到 "🎉 恭喜！所有检查都通过了！" 就表示配置成功！

## 🎯 开始使用

### 运行示例程序

```bash
python examples/basic_usage.py
```

### 基本使用流程

1. **选择绕口令**：从不同难度级别中选择
2. **开始录音**：按提示进行语音录制
3. **获得评分**：系统自动分析并给出详细反馈
4. **查看历史**：回顾之前的练习记录

## 🎪 功能演示

### 1. 简单测试

```python
from src.twister_evaluator import TwisterEvaluator

# 初始化评测器
evaluator = TwisterEvaluator()

# 获取一个简单的绕口令
twister = evaluator.get_random_twister(difficulty='beginner')
print(f"请朗读：{twister['text']}")

# 开始录音和评测
result = evaluator.evaluate_speech(twister['text'])
print(f"总分：{result.overall_score}")
```

### 2. 交互式使用

运行 `examples/basic_usage.py` 获得完整的交互体验：

- 📚 浏览绕口令库
- 🎤 语音录制和评测
- 📊 详细的评分报告
- 📈 历史记录管理
- 💡 个性化改进建议

## 🔧 常见问题

### Q: PyAudio安装失败怎么办？
**A:** 这是最常见的问题，请按操作系统选择解决方案：

- **Windows**: `pip install pipwin && pipwin install pyaudio`
- **macOS**: `brew install portaudio && pip install pyaudio`
- **Linux**: `sudo apt-get install python3-pyaudio`

### Q: 麦克风权限问题？
**A:** 确保：
- 系统设置中允许应用访问麦克风
- 防火墙没有阻止Python程序
- 麦克风设备正常工作

### Q: API调用失败？
**A:** 检查：
- API密钥是否正确配置
- 网络连接是否正常
- 讯飞账户是否有足够的调用次数

### Q: 评分结果不准确？
**A:** 建议：
- 在安静环境中录音
- 保持适当的录音音量
- 清晰地发音
- 确保麦克风质量良好

## 📚 进阶使用

### 自定义绕口令

```python
from src.utils.twister_library import TwisterLibrary

library = TwisterLibrary()

# 添加自定义绕口令
library.add_custom_twister(
    text="红鲤鱼与绿鲤鱼与驴",
    difficulty="intermediate",
    category="initials",
    description="练习r和l音的区别"
)
```

### 批量评测

```python
# 批量测试多个绕口令
twisters = evaluator.get_twisters_by_difficulty('beginner')
for twister in twisters[:3]:
    print(f"\n测试：{twister['text']}")
    result = evaluator.evaluate_speech(twister['text'])
    print(f"得分：{result.overall_score}")
```

### 导出评测报告

```python
# 获取历史记录并导出
history = evaluator.get_evaluation_history()
evaluator.export_history_to_csv('my_progress.csv')
```

## 🎯 下一步

现在您已经成功配置了系统，可以：

1. **开始练习**：运行 `python examples/basic_usage.py`
2. **查看文档**：阅读 `README.md` 了解更多功能
3. **自定义开发**：基于现有模块开发自己的功能
4. **参与贡献**：提交bug报告或功能建议

## 📞 获取帮助

如果遇到问题：

1. 首先运行 `python check_setup.py` 诊断问题
2. 查看 `README.md` 中的详细文档
3. 检查 `tests/` 目录中的测试用例
4. 联系技术支持或提交Issue

---

🎉 **祝您使用愉快！让我们一起在绕口令的世界中提升语言技能吧！** 🎉