# 讯飞语音评测API修复说明

## 修复概述

根据[讯飞语音评测API官方文档](https://www.xfyun.cn/doc/Ise/IseAPI.html#%E6%8E%A5%E5%8F%A3demo)，已修复以下关键问题：

## 🔧 已修复的问题

### 1. 评测配置参数修复
**问题**: 配置参数不符合官方文档要求
**修复**: 
- 添加了完整的`business`参数
- 正确设置`cmd="ssb"`（参数上传阶段）
- 添加了`data.status=0`和`data_type=1`
- 确保音频格式参数正确

**修复前**:
```typescript
const configData = {
  common: { app_id: this.config.appId },
  business: { /* 缺少必要参数 */ },
  data: { status: 0 }
};
```

**修复后**:
```typescript
const configData = {
  common: { app_id: this.config.appId },
  business: {
    sub: "ise",
    ent: "cn_vip", 
    category: "read_sentence",
    cmd: "ssb",
    text: `\uFEFF${text}`,
    tte: "utf-8",
    ttp_skip: true,
    aue: "raw",
    auf: "audio/L16;rate=16000",
    aus: 1
  },
  data: {
    status: 0,
    data: "",
    data_type: 1
  }
};
```

### 2. 音频数据发送修复
**问题**: 音频数据参数设置错误
**修复**:
- 移除了错误的`business`参数
- 正确设置`data.status`（1: 中间帧, 2: 最后一帧）
- 确保音频数据格式正确

**修复前**:
```typescript
const audioMessage = {
  business: { /* 错误的business参数 */ },
  data: { /* 参数不完整 */ }
};
```

**修复后**:
```typescript
const audioMessage = {
  data: {
    status: isLast ? 2 : 1,
    data: audioB64,
    data_type: 1
  }
};
```

### 3. XML解析增强
**问题**: 只支持单一标签格式
**修复**:
- 支持多种可能的标签格式
- 添加备用解析方案
- 增强错误处理和日志记录

**修复前**:
```typescript
const overallMatch = xmlData.match(/<overall_score>(\d+)<\/overall_score>/);
if (overallMatch) {
  scores.overall = parseInt(overallMatch[1]);
} else {
  console.log('❌ 未找到总体评分');
}
```

**修复后**:
```typescript
const overallMatch = xmlData.match(/<overall_score>(\d+)<\/overall_score>/);
if (overallMatch) {
  scores.overall = parseInt(overallMatch[1]);
  console.log('✅ 提取总体评分:', scores.overall);
} else {
  // 尝试其他可能的标签格式
  const overallMatch2 = xmlData.match(/<overall>(\d+)<\/overall>/);
  if (overallMatch2) {
    scores.overall = parseInt(overallMatch2[1]);
    console.log('✅ 提取总体评分(alt):', scores.overall);
  } else {
    console.log('❌ 未找到总体评分');
  }
}
```

### 4. 评测流程优化
**问题**: 调用流程不符合官方文档
**修复**:
- 添加配置生效等待时间
- 优化音频分块发送间隔
- 增强错误处理和日志记录

## 📋 官方文档要求

### 接口调用流程
1. **参数上传阶段**: `data.status=0`, `cmd="ssb"`
2. **音频上传阶段**: 
   - 第一帧: `aus=1`, `data.status=1`
   - 中间帧: `aus=2`, `data.status=1`  
   - 最后一帧: `aus=4`, `data.status=2`

### 音频要求
- **采样率**: 16kHz
- **位长**: 16bit
- **声道**: 单声道
- **格式**: PCM、WAV、MP3等
- **最大时长**: 5分钟

### 鉴权要求
- 使用HMAC-SHA256算法
- 包含`host`、`date`、`authorization`参数
- 签名基于请求行和头部信息

## 🧪 测试建议

### 1. 使用调试页面
- 进入个人档案页面
- 点击"API调试"按钮
- 进行API连接测试
- 查看详细日志和结果

### 2. 检查关键日志
- 🔗 WebSocket连接状态
- 📤 配置发送成功
- 📤 音频数据发送状态
- 📥 API响应接收
- 🔍 XML解析过程

### 3. 验证音频格式
- 确保录音格式为16kHz, 16bit, 单声道
- 检查音频数据完整性
- 验证录音长度是否足够

## 🚨 常见问题排查

### 问题1: 仍然显示0分
**可能原因**:
- API返回的XML格式与预期不符
- 音频数据格式不正确
- 网络连接问题

**解决方案**:
1. 查看控制台日志中的XML数据内容
2. 检查音频录制参数
3. 使用调试页面进行测试

### 问题2: WebSocket连接失败
**可能原因**:
- 网络连接问题
- API密钥无效
- 防火墙限制

**解决方案**:
1. 检查网络连接
2. 验证API配置
3. 尝试不同网络环境

### 问题3: 认证失败
**可能原因**:
- APPID、API_KEY、API_SECRET错误
- 签名算法问题
- 时间戳不同步

**解决方案**:
1. 检查API配置信息
2. 验证密钥有效性
3. 检查系统时间

## 📱 使用方法

1. **进入调试页面**: 个人档案 → API调试
2. **查看配置**: 确认API配置信息正确
3. **开始测试**: 点击"开始测试"按钮
4. **分析结果**: 根据测试结果和日志进行问题诊断
5. **修复问题**: 根据错误信息进行相应修复

## 🔍 下一步调试

如果问题仍然存在，建议：

1. **查看原始XML数据**: 在控制台日志中查看API返回的完整XML内容
2. **对比官方示例**: 参考官方文档中的示例代码
3. **检查网络环境**: 确保没有代理或防火墙限制
4. **联系技术支持**: 提供完整的错误日志和测试结果

## 总结

通过按照官方文档要求修复API调用参数和流程，应该能够解决录音测评成绩为0的问题。关键修复点包括：

- ✅ 正确的评测配置参数
- ✅ 符合规范的音频数据发送
- ✅ 增强的XML解析能力
- ✅ 优化的评测流程
- ✅ 详细的调试日志

建议使用提供的调试工具进行测试，并根据日志信息进一步诊断问题。
