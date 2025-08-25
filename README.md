# 🐼 PandaTalk - 智能语音评测应用

一个基于React Native和Expo构建的现代化语音评测应用，集成讯飞语音识别API，提供专业的发音练习、PK竞技和个人成长追踪功能。

## 🎯 核心功能

### 🎤 智能语音评测
- **实时语音识别**: 集成讯飞语音识别API，提供准确的发音评测
- **多维度评分**: 发音清晰度、语速控制、声调准确度、完整性、准确度、情感表达
- **详细分析报告**: 逐字分析，识别发音错误和改善建议
- **音频回放**: 支持录音回放，对比练习效果

### 🏆 练习模式
- **自由练习**: 选择练习内容，自由练习发音
- **挑战模式**: 完成指定挑战，获得成就徽章
- **进度追踪**: 记录练习天数、准确率等关键指标
- **历史记录**: 保存所有练习记录，追踪成长轨迹

### ⚔️ PK竞技场
- **实时对战**: 与其他用户进行语音PK对战
- **等级系统**: 通过胜利提升等级，解锁新功能
- **排行榜**: 查看排名，挑战更高水平用户
- **决斗记录**: 保存对战历史，分析胜负原因

### 👤 个人档案
- **成就系统**: 解锁各种成就徽章，展示学习成果
- **统计数据**: 练习天数、金币数量、PK胜率等详细统计
- **成长轨迹**: 可视化展示学习进度和技能提升
- **个性化设置**: 自定义头像、昵称等个人信息

## 🛠️ 技术架构

### 前端技术栈
- **框架**: React Native + Expo
- **路由**: Expo Router (文件路由系统)
- **语言**: TypeScript
- **状态管理**: React Hooks
- **UI组件**: 自定义组件 + Expo Vector Icons

### 核心服务
- **语音识别**: 讯飞语音识别API集成
- **音频处理**: Expo AV音频录制和播放
- **网络通信**: WebSocket实时通信
- **数据存储**: 本地存储 + 云端同步

### 设计特色
- **iOS风格设计**: 遵循iOS设计规范，提供原生体验
- **响应式布局**: 适配不同屏幕尺寸和设备
- **流畅动画**: 平滑的页面过渡和交互效果
- **深色模式**: 支持系统主题切换

## 📱 应用结构

```
app/
├── (tabs)/                    # 主要标签页
│   ├── index.tsx             # 首页 - 个人成就和挑战
│   ├── pk-arena.tsx          # PK竞技场
│   └── profile.tsx           # 个人档案
├── practice.tsx               # 练习页面
├── voice-record.tsx           # 录音页面
├── voice-record-complete.tsx  # 录音完成页面
├── result.tsx                 # 评测结果页面
├── edit-profile.tsx           # 编辑档案页面
└── debug-api.tsx              # API调试页面
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Expo CLI
- iOS Simulator (macOS) 或 Android Emulator

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/splaaaaaa/PandaTalk.git
   cd PandaTalk
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置API密钥**
   - 在 `config/api-config.ts` 中配置讯飞API密钥
   - 获取APPID、API_SECRET和API_KEY

4. **启动开发服务器**
   ```bash
   # 使用隧道模式（推荐，解决扫码问题）
   expo start --tunnel
   
   # 或使用本地网络
   expo start --lan
   ```

5. **运行应用**
   - 扫描二维码在真机上运行
   - 按 `i` 在iOS模拟器中运行
   - 按 `a` 在Android模拟器中运行
   - 按 `w` 在Web浏览器中运行

## 🔧 配置说明

### 讯飞API配置
```typescript
// config/api-config.ts
export const xfyunConfig = {
  APPID: 'your_app_id',
  API_SECRET: 'your_api_secret',
  API_KEY: 'your_api_key'
};
```

### 音频配置
- 支持高质量音频录制
- 自动音频格式转换
- 实时音频流处理

## 📊 功能特性详解

### 语音评测流程
1. **录音**: 高质量音频录制，支持实时预览
2. **上传**: 自动音频编码和分块上传
3. **分析**: 讯飞API实时语音识别和评测
4. **结果**: 多维度评分和详细分析报告
5. **反馈**: 可视化展示评测结果和改进建议

### 成就系统
- **发音达人**: 连续7天练习
- **发音大师**: 准确率达到95%
- **挑战王**: 完成每周挑战目标
- **PK王者**: 在竞技场获得高胜率

### 数据统计
- **练习统计**: 练习天数、总时长、准确率
- **竞技统计**: PK次数、胜率、等级
- **成长轨迹**: 技能提升曲线、里程碑记录

## 🎨 设计理念

- **用户友好**: 简洁直观的界面设计
- **功能完整**: 覆盖语音学习的全流程
- **体验流畅**: 优化的交互和动画效果
- **个性化**: 支持用户自定义和偏好设置

## 🔍 故障排除

### 常见问题
1. **扫码蓝屏**: 使用 `--tunnel` 模式启动
2. **录音失败**: 检查麦克风权限设置
3. **API错误**: 验证讯飞API密钥配置
4. **网络问题**: 确保网络连接稳定

### 调试工具
- 内置API调试页面
- 详细的控制台日志
- 网络状态监控

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **项目维护者**: PandaTalk Team
- **联系邮箱**: spl0203@163.com
- **项目链接**: [https://github.com/splaaaaaa/PandaTalk](https://github.com/splaaaaaa/PandaTalk)
- **问题反馈**: [Issues](https://github.com/splaaaaaa/PandaTalk/issues)

## 🙏 致谢

- [Expo](https://expo.dev/) - 优秀的React Native开发平台
- [React Native](https://reactnative.dev/) - 跨平台移动应用开发框架
- [讯飞开放平台](https://www.xfyun.cn/) - 专业的语音识别服务
- [Ionicons](https://ionic.io/ionicons) - 精美的图标库

---

**PandaTalk** - 让语音学习更智能，让发音练习更有效 🐼🎤✨

*通过AI驱动的语音评测，帮助用户提升发音准确度，实现语言学习的突破性进步。*
