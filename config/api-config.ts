// API配置文件
export interface XFYunConfig {
  APPID: string;
  API_SECRET: string;
  API_KEY: string;
  BASE_URL: string;
}

// 讯飞语音评测API配置
export const xfyunConfig: XFYunConfig = {
  // 用户提供的真实API密钥
  APPID: 'a696bc26',
  API_SECRET: 'ZDQxMGYzNmQ2ZTg4NWNjOTY2MjhiZjI3',
  API_KEY: '761d772b70b55f9225c5e55b89c58963',
  
  // API接口地址
  BASE_URL: 'wss://ise-api.xfyun.cn/v2/open-ise'
};

// 音频参数配置
export const audioConfig = {
  format: 'audio/L16;rate=16000',  // 音频格式：16kHz采样率的PCM
  encoding: 'raw',                  // 音频编码
  channels: 1,                      // 单声道
  sample_rate: 16000,              // 采样率
  sample_width: 2,                 // 采样位宽（字节）
  chunk_size: 2560                 // 音频分块大小（80ms的音频数据，平衡性能和稳定性）
};

// 评测参数配置
export const evaluationConfig = {
  category: 'read_sentence',       // 评测类型：句子朗读
  language: 'zh_cn',              // 语言：中文
  ent: 'cn_vip',                  // 引擎类型
  cmd: 'ssb',                     // 命令类型
  tte: 'utf-8',                   // 文本编码
};

// 评分等级配置
export const scoreLevels = {
  excellent: { min: 90, max: 100, label: '优秀', color: '#34C759' },
  good: { min: 80, max: 89, label: '良好', color: '#007AFF' },
  fair: { min: 70, max: 79, label: '一般', color: '#FF9500' },
  poor: { min: 0, max: 69, label: '需要改进', color: '#FF3B30' }
};

// 获取评分等级
export const getScoreLevel = (score: number) => {
  if (score >= 90) return scoreLevels.excellent;
  if (score >= 80) return scoreLevels.good;
  if (score >= 70) return scoreLevels.fair;
  return scoreLevels.poor;
};

// 环境变量配置（如果使用环境变量）
export const getConfigFromEnv = (): XFYunConfig => {
  return {
    APPID: process.env.EXPO_PUBLIC_XFYUN_APPID || 'a696bc26',
    API_SECRET: process.env.EXPO_PUBLIC_XFYUN_API_SECRET || 'ZDQxMGYzNmQ2ZTg4NWNjOTY2MjhiZjI3',
    API_KEY: process.env.EXPO_PUBLIC_XFYUN_API_KEY || '761d772b70b55f9225c5e55b89c58963',
    BASE_URL: 'wss://ise-api.xfyun.cn/v2/open-ise'
  };
};

// 验证配置是否完整
export const validateConfig = (config: XFYunConfig): boolean => {
  const requiredFields = [config.APPID, config.API_SECRET, config.API_KEY];
  const defaultValues = ['your_app_id_here', 'your_api_secret_here', 'your_api_key_here'];
  return all(field => field !== defaultValues[requiredFields.indexOf(field)], requiredFields);
};

// 辅助函数
const all = (predicate: (value: string) => boolean, array: string[]): boolean => {
  return array.every(predicate);
};
