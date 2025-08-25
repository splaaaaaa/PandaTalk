// 完整的讯飞语音识别流程测试
const WebSocket = require('ws');
const CryptoJS = require('crypto-js');

// 您的API配置
const config = {
  APPID: 'a696bc26',
  API_SECRET: 'ZDQxMGYzNmQ2ZTg4NWNjOTY2MjhiZjI3',
  API_KEY: '761d772b70b55f9225c5e55b89c58963',
  BASE_URL: 'wss://ise-api.xfyun.cn/v2/open-ise'
};

// 生成签名
function generateSignature(method = 'GET') {
  const date = new Date().toUTCString();
  const signatureString = `host: ise-api.xfyun.cn\ndate: ${date}\n${method} /v2/open-ise HTTP/1.1`;
  
  const signature = CryptoJS.HmacSHA256(signatureString, config.API_SECRET);
  const signatureB64 = CryptoJS.enc.Base64.stringify(signature);
  
  const authorization = `api_key="${config.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureB64}"`;
  
  const authParams = {
    authorization: Buffer.from(authorization).toString('base64'),
    date: date,
    host: 'ise-api.xfyun.cn'
  };

  const queryString = Object.entries(authParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${config.BASE_URL}?${queryString}`;
}

// 生成模拟音频数据
function generateMockAudioData(durationMs = 3000) {
  // 生成3秒的16kHz 16bit PCM音频数据
  const sampleRate = 16000;
  const bytesPerSample = 2; // 16bit = 2 bytes
  const numSamples = Math.floor((durationMs / 1000) * sampleRate);
  const buffer = Buffer.alloc(numSamples * bytesPerSample);
  
  // 生成简单的正弦波音频数据
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 16384; // 440Hz音调
    buffer.writeInt16LE(Math.round(sample), i * bytesPerSample);
  }
  
  return buffer;
}

// 完整的语音识别测试
async function testCompleteFlow() {
  console.log('🚀 开始完整的语音识别流程测试...');
  
  try {
    // 1. 生成连接URL
    const url = generateSignature();
    console.log('🔗 连接URL生成成功');
    console.log('📱 APPID:', config.APPID);
    
    // 2. 建立WebSocket连接
    console.log('🔌 正在建立WebSocket连接...');
    const ws = new WebSocket(url);
    
    return new Promise((resolve, reject) => {
      let hasReceivedResult = false;
      
      ws.on('open', async () => {
        console.log('✅ WebSocket连接成功');
        
        try {
          // 3. 发送评测配置
          console.log('📤 发送评测配置...');
          const configData = {
            common: {
              app_id: config.APPID
            },
            business: {
              sub: "ise",
              ent: "cn_vip",
              category: "read_sentence",
              cmd: "ssb",
              text: "\uFEFF紅鯉魚與綠鯉魚與驢",
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
          
          ws.send(JSON.stringify(configData));
          console.log('✅ 评测配置发送成功');
          
          // 等待配置生效
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // 4. 发送模拟音频数据
          console.log('📤 开始发送模拟音频数据...');
          const audioData = generateMockAudioData(3000); // 3秒音频
          const chunkSize = 2560; // 80ms的音频数据
          const totalChunks = Math.ceil(audioData.length / chunkSize);
          
          console.log(`📊 音频总大小: ${audioData.length} bytes`);
          console.log(`📊 分块数量: ${totalChunks}`);
          
          for (let i = 0; i < audioData.length; i += chunkSize) {
            const chunk = audioData.slice(i, i + chunkSize);
            const isLast = (i + chunkSize >= audioData.length);
            const isFirst = (i === 0);
            
            // 根据讯飞API文档设置参数
            let aus = 2; // 默认中间帧
            if (isFirst) aus = 1;
            if (isLast) aus = 4;
            
            const audioMessage = {
              business: {
                aue: "raw",
                cmd: "auw",
                aus: aus
              },
              data: {
                status: isLast ? 2 : 1,
                data: chunk.toString('base64'),
                data_type: 1
              }
            };
            
            ws.send(JSON.stringify(audioMessage));
            console.log(`📤 发送第${Math.floor(i / chunkSize) + 1}/${totalChunks}块: ${chunk.length} bytes, aus: ${aus}`);
            
            // 避免发送过快
            if (!isLast) {
              await new Promise(resolve => setTimeout(resolve, 30));
            }
          }
          
          console.log('✅ 音频数据发送完成');
          
        } catch (error) {
          console.error('❌ 发送数据失败:', error);
          reject(error);
        }
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('📥 收到消息:', JSON.stringify(message, null, 2));
          
          // 检查是否有评测结果
          if (message.data && message.data.status === 2 && message.data.data) {
            hasReceivedResult = true;
            console.log('🎯 收到评测结果！');
            console.log('📊 结果数据长度:', message.data.data.length);
            ws.close();
            resolve('success');
          }
          
          // 检查错误
          if (message.code && message.code !== 0) {
            console.error('❌ API返回错误:', message);
            ws.close();
            reject(new Error(`API错误: ${message.message || '未知错误'}`));
          }
          
        } catch (error) {
          console.log('📥 收到原始消息:', data.toString());
        }
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket错误:', error);
        reject(error);
      });
      
      ws.on('close', (code, reason) => {
        console.log('🔌 WebSocket连接关闭:', code, reason);
        if (!hasReceivedResult) {
          reject(new Error(`连接关闭: ${reason}`));
        }
      });
      
      // 设置超时
      setTimeout(() => {
        if (!hasReceivedResult) {
          console.error('⏰ 测试超时');
          ws.close();
          reject(new Error('测试超时'));
        }
      }, 30000); // 30秒超时
      
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 运行测试
async function runTest() {
  try {
    console.log('🧪 开始测试讯飞语音识别API...');
    console.log('📋 测试内容:');
    console.log('  1. 生成认证签名');
    console.log('  2. 建立WebSocket连接');
    console.log('  3. 发送评测配置');
    console.log('  4. 发送模拟音频数据');
    console.log('  5. 接收评测结果');
    console.log('');
    
    const result = await testCompleteFlow();
    console.log('🎉 测试成功完成！');
    console.log('✅ 所有步骤都通过了');
    
  } catch (error) {
    console.error('💥 测试失败:', error.message);
    process.exit(1);
  }
}

// 检查依赖
try {
  require('ws');
  require('crypto-js');
  runTest();
} catch (error) {
  console.error('❌ 缺少依赖包，请先安装:');
  console.error('npm install ws crypto-js');
  process.exit(1);
}
