# 导航系统说明

## 概述
应用使用Expo Router实现页面导航，底部导航栏包含三个主要标签页，每个标签页都可以自由切换。

## 导航结构

### 1. 底部导航栏
所有页面都包含相同的底部导航栏，包含三个标签：

- **自由練習** (Free Practice) - 首页
- **PK競技** (PK Arena) - PK竞技页面  
- **個人檔案** (Personal Profile) - 个人档案页面

### 2. 页面路由
- **首页**: `/(tabs)` 或 `/`
- **PK竞技**: `/pk-arena`
- **个人档案**: `/profile`
- **练习页面**: `/practice`
- **结果页面**: `/result`

## 导航逻辑

### 1. 首页 (/(tabs)/index.tsx)
```typescript
const handleTabPress = (tabName: string) => {
  if (tabName === 'pk-competition') {
    router.push('/pk-arena');
  } else if (tabName === 'profile') {
    router.push('/profile');
  } else {
    // 自由练习是当前页面，不需要跳转
    setActiveTab(tabName);
  }
};
```

**功能说明**:
- 点击"PK競技" → 跳转到PK竞技页面
- 点击"個人檔案" → 跳转到个人档案页面
- 点击"自由練習" → 保持在当前页面（首页）

### 2. PK竞技页面 (/pk-arena.tsx)
```typescript
const handleTabPress = (tabName: string) => {
  if (tabName === 'free-practice') {
    router.push('/(tabs)');
  } else if (tabName === 'profile') {
    router.push('/profile');
  } else {
    setActiveTab(tabName);
  }
};
```

**功能说明**:
- 点击"自由練習" → 返回首页
- 点击"個人檔案" → 跳转到个人档案页面
- 点击"PK競技" → 保持在当前页面

### 3. 个人档案页面 (/profile.tsx)
```typescript
const handleTabPress = (tabName: string) => {
  if (tabName === 'free-practice') {
    router.push('/(tabs)');
  } else if (tabName === 'pk-competition') {
    router.push('/pk-arena');
  } else {
    setActiveTab(tabName);
  }
};
```

**功能说明**:
- 点击"自由練習" → 返回首页
- 点击"PK競技" → 跳转到PK竞技页面
- 点击"個人檔案" → 保持在当前页面

## 导航特性

### 1. 自由切换
- 每个标签页都可以自由点击切换
- 没有页面访问限制
- 支持任意顺序的页面跳转

### 2. 状态保持
- 每个页面都维护自己的`activeTab`状态
- 当前页面的标签会高亮显示
- 页面间跳转不会丢失状态

### 3. 视觉反馈
- 活跃标签使用黄色背景 (`#FFD700`)
- 非活跃标签使用浅色背景
- 标签文字颜色和粗细会相应变化

## 样式规范

### 1. 导航栏样式
```typescript
bottomNav: {
  flexDirection: 'row',
  backgroundColor: '#FFF9C4',  // 浅黄色背景
  paddingVertical: 18,
  paddingHorizontal: 20,
  borderTopWidth: 1,
  borderTopColor: '#E5E5EA',
}
```

### 2. 标签样式
```typescript
navTab: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: 12,
  borderRadius: 10,
  marginHorizontal: 4,
}
```

### 3. 活跃状态样式
```typescript
activeTab: {
  backgroundColor: '#FFD700',  // 黄色背景
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
}
```

## 使用示例

### 1. 从首页切换到PK竞技
1. 在首页点击底部导航栏的"PK競技"标签
2. 页面跳转到PK竞技页面
3. PK竞技标签高亮显示

### 2. 从PK竞技切换到个人档案
1. 在PK竞技页面点击底部导航栏的"個人檔案"标签
2. 页面跳转到个人档案页面
3. 个人档案标签高亮显示

### 3. 返回首页
1. 在任何页面点击底部导航栏的"自由練習"标签
2. 页面返回到首页
3. 自由练习标签高亮显示

## 扩展建议

### 1. 页面缓存
- 可以实现页面缓存，避免重复加载
- 保持用户在各个页面的操作状态

### 2. 导航历史
- 添加返回按钮功能
- 实现页面间的后退导航

### 3. 深度链接
- 支持外部链接直接跳转到特定页面
- 实现分享功能

### 4. 权限控制
- 根据用户状态控制页面访问权限
- 实现登录状态检查

## 总结

导航系统设计简洁明了，每个标签页都可以自由切换，用户体验流畅。所有页面都使用统一的导航组件和样式，保持了视觉一致性。系统支持任意顺序的页面跳转，为用户提供了灵活的导航体验。
