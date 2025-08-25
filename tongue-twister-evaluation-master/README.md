## ✨ 核心功能

### 1. 智能语音评测
- 🔗 基于讯飞语音评测API，专业可靠
- 🎵 支持实时录音和音频文件上传
- 📏 多维度评分：发音准确度、流畅度、完整性、语调自然度
- 💬 详细的反馈和个性化改进建议
- ⚡ 快速响应，评测结果秒级返回

### 2. 分级绕口令库
- 📚 **按难度分级**：初级(7个)、中级(5个)、高级(5个)
- 🎭 **按类型分类**：声母练习、韵母练习、声调练习、综合练习
- 🔍 **智能搜索**：支持关键词搜索，快速定位目标练习
- 🎲 **随机推荐**：可按难度随机推荐，保持练习新鲜感
- 📋 **个性化序列**：根据用户水平推荐最适合的练习顺序

### 3. 专业音频处理
- 🔄 自动音频格式转换（转换为16kHz, 16bit, 单声道PCM）
- 🎚️ 音频质量优化（音量标准化、降噪处理）
- ✂️ 智能静音检测和裁剪
- 📱 多设备音频输入支持

### 4. 智能评分系统
- 🧠 基于讯飞专业算法的评分引擎
- 📊 历史记录分析和进步趋势跟踪
- 🏆 等级评定：优秀(90+)、良好(80+)、中等(70+)、及格(60+)
- 📝 详细的单词级别评分反馈

## 🏗️ 技术架构

```
speech_evaluation/
├── config/                    # 配置管理
│   └── xfyun_config.py       # 讯飞API配置和认证
├── src/                      # 核心源代码
│   ├── api/                  # API客户端层
│   │   └── xfyun_client.py   # 讯飞WebSocket客户端
│   ├── audio/                # 音频处理层
│   │   └── audio_processor.py # 音频录制、转换、预处理
│   ├── scoring/              # 评分引擎层
│   │   └── score_engine.py   # 结果解析、评分、反馈生成
│   ├── utils/                # 工具模块
│   │   └── twister_library.py # 绕口令文本库管理
│   └── twister_evaluator.py  # 主评测控制器
├── tests/                    # 单元测试
│   └── test_basic.py         # 基础功能测试
├── examples/                 # 使用示例
│   └── basic_usage.py        # 完整的交互式演示程序
├── docs/                     # 项目文档
└── requirements.txt          # Python依赖包列表
```

## 🚀 快速开始

### 环境要求
- Python 3.7+
- Windows/macOS/Linux
- 麦克风设备
- 网络连接（用于API调用）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd speech_evaluation
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置API密钥**

获取讯飞API密钥：
1. 访问 [讯飞开放平台](https://console.xfyun.cn/)
2. 注册并登录账号
3. 创建应用，获取 APPID、API_SECRET、API_KEY

配置方式（选择其一）：

**方式一：使用配置脚本（推荐）**
```bash
python demo_config.py
```
按提示输入您的API密钥，脚本会自动创建 `config/api_keys.py` 文件。

**方式二：手动配置**
1. 复制 `config/api_keys.example.py` 为 `config/api_keys.py`
2. 编辑 `config/api_keys.py`，填入您的真实API密钥

**注意：** `api_keys.py` 文件已被添加到 `.gitignore`，不会被上传到版本控制系统，保护您的API密钥安全。

4. **运行示例程序**
```bash
python examples/basic_usage.py
```

### 获取讯飞API密钥

1. 访问 [讯飞开放平台](https://www.xfyun.cn/)
2. 注册账号并登录
3. 创建应用，选择"语音评测"服务
4. 获取APPID、API_SECRET、API_KEY
5. 将凭证填入配置文件

## 🙏 致谢

- [讯飞开放平台](https://www.xfyun.cn/) - 提供专业的语音评测API
- [PyAudio](https://pypi.org/project/PyAudio/) - Python音频处理库
- [WebSockets](https://pypi.org/project/websockets/) - WebSocket通信支持

## 📞 联系我们

如有问题或建议，请通过以下方式联系：
- 📧 Email: [renhuilin8@163.com]
