# Pandatalk - React Native Chat App

一个基于React Native和Expo构建的现代化聊天应用，具有iOS风格的设计和完整的聊天功能。

## 🚀 功能特性

### 主要功能
- **聊天列表**: 显示所有聊天对话，支持未读消息提醒
- **联系人管理**: 管理联系人列表，支持搜索和快速操作
- **聊天界面**: 完整的聊天对话界面，支持发送和接收消息
- **发现功能**: 发现新的群组、频道和用户
- **设置页面**: 完整的应用设置和用户资料管理

### 技术特性
- 基于Expo Router的文件路由系统
- TypeScript支持
- 响应式设计，支持iOS和Android
- 现代化的UI设计，遵循iOS设计规范
- 组件化架构，易于维护和扩展

## 📱 页面结构

```
app/
├── (tabs)/
│   ├── index.tsx          # 聊天列表页面
│   ├── contacts.tsx       # 联系人页面
│   ├── explore.tsx        # 发现页面
│   ├── settings.tsx       # 设置页面
│   └── _layout.tsx        # 标签页布局
├── chat/
│   └── [id].tsx          # 聊天详情页面
└── _layout.tsx            # 根布局
```

## 🛠️ 安装和运行

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Expo CLI
- iOS Simulator (macOS) 或 Android Emulator

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd PandatalkApp
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   # 或
   yarn start
   ```

4. **运行应用**
   - 按 `i` 在iOS模拟器中运行
   - 按 `a` 在Android模拟器中运行
   - 按 `w` 在Web浏览器中运行
   - 扫描二维码在真机上运行

## 📱 应用截图

### 主要页面
- **聊天列表**: 显示所有聊天对话
- **联系人**: 管理联系人列表
- **发现**: 发现新的群组和用户
- **设置**: 应用设置和用户资料
- **聊天详情**: 具体的聊天对话界面

## 🎨 设计特色

- **iOS风格**: 遵循iOS设计规范，提供原生体验
- **现代化UI**: 使用最新的设计趋势和组件
- **响应式布局**: 适配不同屏幕尺寸
- **流畅动画**: 平滑的页面过渡和交互效果

## 🔧 技术栈

- **框架**: React Native + Expo
- **路由**: Expo Router
- **语言**: TypeScript
- **图标**: Expo Vector Icons
- **图片**: Expo Image
- **状态管理**: React Hooks
- **样式**: StyleSheet

## 📁 项目结构

```
PandatalkApp/
├── app/                   # 应用页面
├── components/            # 可复用组件
├── constants/             # 常量定义
├── hooks/                 # 自定义Hooks
├── assets/                # 静态资源
├── scripts/               # 构建脚本
└── package.json           # 项目配置
```

## 🚀 开发指南

### 添加新页面
1. 在 `app/` 目录下创建新的页面文件
2. 使用Expo Router的文件路由系统
3. 遵循现有的页面结构和样式规范

### 添加新组件
1. 在 `components/` 目录下创建组件文件
2. 使用TypeScript定义props接口
3. 遵循现有的组件命名和样式规范

### 样式指南
- 使用StyleSheet创建样式
- 遵循iOS设计规范
- 使用主题色彩系统
- 支持深色模式

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: [https://github.com/yourusername/PandatalkApp](https://github.com/yourusername/PandatalkApp)
- 问题反馈: [Issues](https://github.com/yourusername/PandatalkApp/issues)

## 🙏 致谢

- [Expo](https://expo.dev/) - 优秀的React Native开发平台
- [React Native](https://reactnative.dev/) - 跨平台移动应用开发框架
- [Ionicons](https://ionic.io/ionicons) - 精美的图标库

---

**Pandatalk** - 让聊天更简单，让连接更紧密 🐼💬
