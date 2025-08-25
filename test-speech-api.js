// 测试讯飞语音识别API配置
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
  
  // 使用HMAC-SHA256算法生成签名
  const signature = CryptoJS.HmacSHA256(signatureString, config.API_SECRET);
  const signatureB64 = CryptoJS.enc.Base64.stringify(signature);
  
  const authorization = `api_key="${config.API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureB64}"`;
  
  const authParams = {
    authorization: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorization)),
    date: date,
    host: 'ise-api.xfyun.cn'
  };

  const queryString = Object.entries(authParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${config.BASE_URL}?${queryString}`;
}

// 测试配置
function testConfig() {
  console.log('🔍 测试讯飞语音识别API配置...');
  console.log('📱 APPID:', config.APPID);
  console.log('🔑 API_SECRET:', config.API_SECRET.substring(0, 8) + '...');
  console.log('🔑 API_KEY:', config.API_KEY.substring(0, 8) + '...');
  
  try {
    const url = generateSignature();
    console.log('🔗 生成的连接URL:');
    console.log(url.substring(0, 100) + '...');
    
    // 验证URL格式
    if (url.includes('wss://ise-api.xfyun.cn/v2/open-ise')) {
      console.log('✅ URL格式正确');
    } else {
      console.log('❌ URL格式错误');
    }
    
    if (url.includes('authorization=') && url.includes('date=') && url.includes('host=')) {
      console.log('✅ 认证参数完整');
    } else {
      console.log('❌ 认证参数缺失');
    }
    
    console.log('\n🎯 配置测试完成！');
    console.log('📝 下一步：在浏览器中测试WebSocket连接');
    
  } catch (error) {
    console.error('❌ 配置测试失败:', error.message);
  }
}

// 运行测试
testConfig();
