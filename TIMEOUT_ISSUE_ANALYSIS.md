# 讯飞API接收结果超时问题诊断

## 问题描述
录音测评时一直出现"接收结果超时"错误，60秒内未收到完整结果。

## 🔍 问题分析

### 1. 超时原因分析
根据讯飞官方文档和代码分析，超时问题可能由以下原因引起：

#### 1.1 WebSocket连接问题
- **连接建立失败**: 网络问题、API密钥无效、防火墙限制
- **连接意外关闭**: 服务器主动断开、网络中断
- **认证失败**: 签名算法错误、时间戳不同步

#### 1.2 音频数据问题
- **音频格式不正确**: 不是16kHz, 16bit, 单声道PCM格式
- **音频数据损坏**: 录音过程中出现问题
- **音频长度问题**: 录音太短或太长

#### 1.3 API调用流程问题
- **参数设置错误**: 不符合官方文档要求
- **状态码错误**: 没有正确设置`aus`和`data.status`
- **消息处理不完整**: 缺少必要的状态处理

### 2. 已修复的问题

#### 2.1 超时时间调整
**修复前**: 30秒超时
```typescript
const timeout = setTimeout(() => {
  reject(new Error('接收结果超时'));
}, 30000);
```

**修复后**: 60秒超时
```typescript
const timeout = setTimeout(() => {
  console.error('⏰ 接收结果超时，60秒内未收到完整结果');
  reject(new Error('接收结果超时'));
}, 60000);
```

#### 2.2 音频参数修复
**修复前**: 缺少`aus`参数
```typescript
const audioMessage = {
  data: {
    status: isLast ? 2 : 1,
    data: audioB64,
    data_type: 1
  }
};
```

**修复后**: 正确设置`aus`参数
```typescript
// aus: 1=第一帧, 2=中间帧, 4=最后一帧
let aus = 2; // 默认中间帧
if (isFirst) aus = 1;
if (isLast) aus = 4;

const audioMessage = {
  data: {
    status: isLast ? 2 : 1,
    data: audioB64,
    data_type: 1
  }
};
```

#### 2.3 消息处理增强
**修复前**: 只处理基本状态
```typescript
if (data.data && data.data.data && data.data.status === 2) {
  // 处理最终结果
}
```

**修复后**: 完整的状态处理
```typescript
// 状态1: 中间状态，继续等待
if (data.data.status === 1) {
  console.log('📤 收到中间状态，继续等待...');
  return;
}

// 状态2: 最终结果
if (data.data.status === 2 && data.data.data) {
  // 处理最终结果
}

// 状态3: 评测被拒绝
if (data.data.status === 3) {
  reject(new Error('评测被拒绝'));
}

// 状态4: 评测完成但无数据
if (data.data.status === 4) {
  reject(new Error('评测完成但无数据'));
}
```

#### 2.4 连接关闭处理
**修复前**: 缺少连接关闭处理
**修复后**: 完整的连接状态监控
```typescript
this.websocket.onclose = (event) => {
  clearTimeout(timeout);
  if (!hasReceivedFinalResult) {
    console.error('🔌 WebSocket连接关闭，但未收到完整结果');
    console.error('🔌 关闭代码:', event.code);
    console.error('🔌 关闭原因:', event.reason);
    reject(new Error(`WebSocket连接关闭: ${event.reason || '未知原因'}`));
  }
};
```

## 🧪 调试步骤

### 第一步：检查控制台日志
查看以下关键日志信息：

1. **连接状态**:
   ```
   🔗 尝试连接到讯飞API: [URL]
   ✅ WebSocket连接已建立
   ```

2. **配置发送**:
   ```
   📤 评测配置已发送: [配置详情]
   ```

3. **音频数据发送**:
   ```
   📤 音频数据已发送: [大小] bytes, aus: [值], 状态: [状态]
   ```

4. **API响应**:
   ```
   📥 收到讯飞API消息: [消息内容]
   📊 数据状态: [状态码]
   ```

### 第二步：使用调试页面
1. 进入个人档案页面
2. 点击"API调试"按钮
3. 进行API连接测试
4. 观察测试结果和错误信息

### 第三步：检查网络环境
1. 确保网络连接正常
2. 检查是否有防火墙限制
3. 尝试不同的网络环境

## 🚨 常见超时原因及解决方案

### 问题1: WebSocket连接失败
**现象**: 无法建立WebSocket连接
**原因**: 网络问题、API密钥无效、防火墙限制
**解决**: 
- 检查网络连接
- 验证API配置
- 检查防火墙设置

### 问题2: 音频格式错误
**现象**: 连接成功但发送音频后超时
**原因**: 音频格式不符合要求
**解决**:
- 确保音频为16kHz, 16bit, 单声道PCM
- 检查音频数据完整性
- 验证录音长度

### 问题3: API参数错误
**现象**: 发送配置后无响应
**原因**: 配置参数不符合官方文档
**解决**:
- 检查business参数设置
- 验证cmd和status参数
- 确保文本格式正确

### 问题4: 服务器响应慢
**现象**: 连接正常但响应延迟
**原因**: 服务器负载高、网络延迟
**解决**:
- 增加超时时间
- 重试机制
- 检查服务器状态

## 📋 官方文档要求检查

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

## 🔧 进一步调试建议

### 1. 添加更多日志
在关键位置添加详细的日志记录：
```typescript
console.log('🔍 详细调试信息:', {
  websocketState: this.websocket?.readyState,
  isConnected: this.isConnected,
  config: this.config,
  audioDataSize: audioData.byteLength
});
```

### 2. 监控WebSocket状态
```typescript
this.websocket.onopen = () => {
  console.log('🔗 WebSocket状态变化: OPEN');
  // ... 其他代码
};

this.websocket.onclose = (event) => {
  console.log('🔗 WebSocket状态变化: CLOSE', event);
  // ... 其他代码
};
```

### 3. 检查音频数据
```typescript
console.log('🎵 音频数据详情:', {
  byteLength: audioData.byteLength,
  chunkSize: audioConfig.chunk_size,
  totalChunks: Math.ceil(audioData.byteLength / audioConfig.chunk_size),
  isFirst: isFirst,
  isLast: isLast
});
```

## 📱 使用建议

1. **首次测试**: 使用调试页面进行API连接测试
2. **录音测试**: 确保录音格式正确，长度适中（2-10秒）
3. **网络环境**: 在稳定的网络环境下测试
4. **日志分析**: 仔细查看控制台日志，定位具体问题

## 总结

超时问题通常由以下原因引起：
- WebSocket连接问题（网络、认证、配置）
- 音频数据问题（格式、质量、长度）
- API调用流程问题（参数、状态、处理）
- 服务器响应问题（负载、延迟、状态）

通过使用修复后的代码和调试工具，应该能够解决大部分超时问题。如果问题仍然存在，请根据日志信息进一步诊断具体原因。
