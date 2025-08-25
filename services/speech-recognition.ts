// 语音识别服务 - 集成讯飞API
import { xfyunConfig, audioConfig, evaluationConfig } from '../config/api-config';
import CryptoJS from 'crypto-js';

export interface SpeechRecognitionResult {
  overall_score: number;
  pronunciation_score: number;
  fluency_score: number;
  integrity_score: number;
  tone_score: number;
  accuracy_score: number;
  emotion_score: number;
  word_details: WordDetail[];
  is_rejected: boolean;
  except_info: string;
  raw_result: any;
}

export interface WordDetail {
  content: string;
  symbol: string;
  beg_pos: number;
  end_pos: number;
  time_len: number;
  errors: PhoneError[];
}

export interface PhoneError {
  phone_content: string;
  error_level: number;
  is_yun: boolean;
  tone: string;
  error_type: string;
}

export interface SpeechRecognitionConfig {
  appId: string;
  apiSecret: string;
  apiKey: string;
  text: string;
}

export class SpeechRecognitionService {
  private config: SpeechRecognitionConfig | null = null;
  private websocket: WebSocket | null = null;
  private isConnected = false;
  private networkListener: (() => void) | null = null;
  private keepAliveInterval: any = null;

  constructor() {
    this.config = {
      appId: xfyunConfig.APPID,
      apiSecret: xfyunConfig.API_SECRET,
      apiKey: xfyunConfig.API_KEY,
      text: ''
    };
    
    // 添加网络状态监听
    this.setupNetworkListener();
  }
  
  // 设置网络状态监听
  private setupNetworkListener(): void {
    // React Native环境下不设置网络监听，避免使用浏览器API
    // 网络状态检测将在连接时进行
    console.log('📱 React Native环境，跳过网络监听设置');
  }
  
  // 清理网络监听器
  private cleanupNetworkListener(): void {
    // React Native环境下无需清理
    console.log('📱 React Native环境，跳过网络监听器清理');
  }

  configure(config: Partial<SpeechRecognitionConfig>): void {
    if (this.config) {
      this.config = { ...this.config, ...config };
    }
  }

  // 生成真实的HMAC-SHA256认证签名
  private generateSignature(method: string = 'GET'): string {
    if (!this.config) {
      throw new Error('API配置未设置');
    }

    const date = new Date().toUTCString();
    const signatureString = `host: ise-api.xfyun.cn\ndate: ${date}\n${method} /v2/open-ise HTTP/1.1`;
    
    // 使用真实的HMAC-SHA256算法生成签名
    const signature = CryptoJS.HmacSHA256(signatureString, this.config.apiSecret);
    const signatureB64 = CryptoJS.enc.Base64.stringify(signature);
    
    const authorization = `api_key="${this.config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureB64}"`;
    
    const authParams = {
      authorization: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorization)),
      date: date,
      host: 'ise-api.xfyun.cn'
    };

    const queryString = Object.entries(authParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `${xfyunConfig.BASE_URL}?${queryString}`;
  }

  // 启动连接保活机制
  private startKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
    }
    
    // 每30秒发送一次心跳包
    this.keepAliveInterval = setInterval(() => {
      if (this.websocket && this.isConnected) {
        try {
          // 发送心跳包
          const heartbeat = {
            data: {
              status: 1,
              data: "",
              data_type: 1
            }
          };
          this.websocket.send(JSON.stringify(heartbeat));
          console.log('💓 发送心跳包');
        } catch (error) {
          console.error('❌ 发送心跳包失败:', error);
        }
      }
    }, 30000);
  }
  
  // 停止保活机制
  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  // 建立WebSocket连接
  private async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // React Native环境下不检查navigator.onLine
        // 直接尝试建立连接
        
        const url = this.generateSignature();
        console.log('🔗 尝试连接到讯飞API:', url);
        console.log('🔑 使用APPID:', this.config?.appId);
        
        // 增加连接超时设置
        const connectionTimeout = setTimeout(() => {
          if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
            console.error('⏰ WebSocket连接超时，关闭连接');
            this.websocket.close();
            resolve(false);
          }
        }, 15000); // 15秒超时
        
        this.websocket = new WebSocket(url);
        
        this.websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.isConnected = true;
          console.log('✅ WebSocket连接已建立');
          console.log('🌐 连接状态:', this.websocket?.readyState);
          
          // 启动连接保活机制
          this.startKeepAlive();
          
          resolve(true);
        };
        
        this.websocket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('❌ WebSocket连接错误:', error);
          console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
          console.error('🌐 React Native环境，网络状态检测受限');
          this.isConnected = false;
          resolve(false);
        };
        
        this.websocket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.isConnected = false;
          console.log('🔌 WebSocket连接已关闭');
          console.log('🔌 关闭代码:', event.code);
          console.log('🔌 关闭原因:', event.reason);
          console.log('🔌 是否正常关闭:', event.wasClean);
          
          // 分析关闭原因
          if (event.code === 1000) {
            console.log('✅ 正常关闭');
          } else if (event.code === 1006) {
            console.error('❌ 异常关闭 - 网络连接中断');
          } else if (event.code === 1011) {
            console.error('❌ 服务器错误');
          } else if (event.code === 1012) {
            console.error('❌ 服务重启');
          } else if (event.code === 1013) {
            console.error('❌ 临时错误');
          }
        };
        
      } catch (error) {
        console.error('❌ 建立连接失败:', error);
        resolve(false);
      }
    });
  }

  // 发送评测配置
  private async sendConfig(text: string): Promise<boolean> {
    if (!this.websocket || !this.isConnected || !this.config) {
      return false;
    }

    try {
      // 根据讯飞API官方文档要求设置参数
      const configData = {
        common: {
          app_id: this.config.appId
        },
        business: {
          sub: "ise",
          ent: "cn_vip",
          category: "read_sentence",
          cmd: "ssb",  // 参数上传阶段使用ssb
          text: `\uFEFF${text}`, // 添加BOM标记
          tte: "utf-8",
          ttp_skip: true,
          aue: "raw",
          auf: "audio/L16;rate=16000",
          aus: 1  // 第一帧音频
        },
        data: {
          status: 0, // 第一次上传参数
          data: "",
          data_type: 1
        }
      };

      this.websocket.send(JSON.stringify(configData));
      console.log('📤 评测配置已发送:', JSON.stringify(configData, null, 2));
      return true;
    } catch (error) {
      console.error('❌ 发送配置失败:', error);
      return false;
    }
  }

  // 发送音频数据
  private async sendAudioChunk(audioData: ArrayBuffer, isLast: boolean = false, isFirst: boolean = false): Promise<boolean> {
    if (!this.websocket || !this.isConnected) {
      return false;
    }

    try {
      // 使用React Native兼容的base64编码
      const audioB64 = this.arrayBufferToBase64(audioData);
      
      // 根据讯飞API官方文档设置音频数据参数
      // aus: 1=第一帧, 2=中间帧, 4=最后一帧
      let aus = 2; // 默认中间帧
      if (isFirst) aus = 1;
      if (isLast) aus = 4;
      
      const audioMessage = {
        business: {
          aue: "raw",
          cmd: "auw",  // 音频上传阶段使用auw
          aus: aus
        },
        data: {
          status: isLast ? 2 : 1, // 1: 中间帧, 2: 最后一帧
          data: audioB64,
          data_type: 1
        }
      };

      this.websocket.send(JSON.stringify(audioMessage));
      console.log(`📤 音频数据已发送: ${audioData.byteLength} bytes, aus: ${aus}, 状态: ${isLast ? 2 : 1}`);
      return true;
    } catch (error) {
      console.error('❌ 发送音频数据失败:', error);
      return false;
    }
  }
  
  // React Native兼容的base64编码方法
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // 在React Native中使用Buffer或手动实现base64
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(binary, 'binary').toString('base64');
    } else {
      // 手动实现base64编码（简化版本）
      return this.simpleBase64Encode(binary);
    }
  }
  
  // 简化的base64编码实现
  private simpleBase64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    while (i < str.length) {
      const char1 = str.charCodeAt(i++);
      const char2 = str.charCodeAt(i++);
      const char3 = str.charCodeAt(i++);
      
      const enc1 = char1 >> 2;
      const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
      const enc3 = ((char2 & 15) << 2) | (char3 >> 6);
      const enc4 = char3 & 63;
      
      result += chars.charAt(enc1) + chars.charAt(enc2) + 
                (isNaN(char2) ? '=' : chars.charAt(enc3)) + 
                (isNaN(char3) ? '=' : chars.charAt(enc4));
    }
    
    return result;
  }

  // 接收评测结果
  private async receiveResult(): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      if (!this.websocket) {
        reject(new Error('WebSocket未连接'));
        return;
      }

      // 增加超时时间到90秒，给服务器更多处理时间
      const timeout = setTimeout(() => {
        console.error('⏰ 接收结果超时，90秒内未收到完整结果');
        reject(new Error('接收结果超时'));
      }, 90000);

      let hasReceivedFinalResult = false;
      let messageCount = 0;

      this.websocket.onmessage = (event) => {
        try {
          messageCount++;
          const data = JSON.parse(event.data);
          console.log(`📥 收到第${messageCount}条消息:`, data);
          console.log('📥 消息类型:', typeof data);
          console.log('📥 消息结构:', Object.keys(data));

          // 检查是否有错误码
          if (data.code !== undefined && data.code !== 0) {
            clearTimeout(timeout);
            console.error('❌ API返回错误码:', data.code);
            console.error('❌ 错误信息:', data.message);
            reject(new Error(`API返回错误: ${data.message || '未知错误'}`));
            return;
          }

          // 检查消息类型和状态
          if (data.data) {
            console.log('📊 数据状态:', data.data.status);
            console.log('📊 数据类型:', data.data.data_type);
            
            // 状态1: 中间状态，继续等待
            if (data.data.status === 1) {
              console.log('📤 收到中间状态，继续等待...');
              return;
            }
            
            // 状态2: 最终结果
            if (data.data.status === 2 && data.data.data) {
              clearTimeout(timeout);
              hasReceivedFinalResult = true;
              console.log('✅ 收到最终评测结果');
              console.log('📊 结果状态:', data.data.status);
              console.log('📄 XML数据长度:', data.data.data.length);
              console.log('📄 XML数据预览:', data.data.data.substring(0, 200) + '...');
              
              // 解析真实的XML结果
              const result = this.parseRealResult(data);
              console.log('🎯 解析后的结果:', result);
              resolve(result);
              return;
            }
            
            // 状态3: 评测被拒绝
            if (data.data.status === 3) {
              clearTimeout(timeout);
              console.error('❌ 评测被拒绝');
              reject(new Error('评测被拒绝'));
              return;
            }
            
            // 状态4: 评测完成但无数据
            if (data.data.status === 4) {
              clearTimeout(timeout);
              console.log('⚠️ 评测完成但无数据');
              reject(new Error('评测完成但无数据'));
              return;
            }
            
            // 其他状态
            console.log('📥 收到其他状态消息:', data.data.status);
          }
          
          // 检查是否有其他类型的消息
          if (data.action === 'started') {
            console.log('🚀 评测已开始');
          } else if (data.action === 'result') {
            console.log('📊 收到评测结果');
          } else if (data.action === 'error') {
            clearTimeout(timeout);
            console.error('❌ 收到错误消息:', data);
            reject(new Error(`API错误: ${data.desc || '未知错误'}`));
          }
          
        } catch (error) {
          console.error('❌ 解析响应失败:', error);
          console.error('❌ 原始数据:', event.data);
          // 不要因为解析失败就拒绝，继续等待
        }
      };

      this.websocket.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ WebSocket错误:', error);
        reject(new Error('WebSocket错误'));
      };

      this.websocket.onclose = (event) => {
        clearTimeout(timeout);
        if (!hasReceivedFinalResult) {
          console.error('🔌 WebSocket连接关闭，但未收到完整结果');
          console.error('🔌 关闭代码:', event.code);
          console.error('🔌 关闭原因:', event.reason);
          console.error('🔌 是否正常关闭:', event.wasClean);
          reject(new Error(`WebSocket连接关闭: ${event.reason || '未知原因'}`));
        }
      };
    });
  }

  // 解析真实的讯飞API评测结果
  private parseRealResult(data: any): SpeechRecognitionResult {
    try {
      // 解析讯飞API返回的XML数据
      if (data.data && data.data.data) {
        const xmlData = data.data.data;
        
        // 提取各项评分
        const scores = this.extractScoresFromXML(xmlData);
        
        return {
          overall_score: scores.overall || 0,
          pronunciation_score: scores.pronunciation || 0,
          fluency_score: scores.fluency || 0,
          integrity_score: scores.integrity || 0,
          tone_score: scores.tone || 0,
          accuracy_score: scores.accuracy || 0,
          emotion_score: scores.emotion || 0,
          word_details: this.extractWordDetailsFromXML(xmlData),
          is_rejected: data.data.status === 3,
          except_info: data.data.status === 3 ? "评测被拒绝" : "",
          raw_result: data
        };
      }
      
      throw new Error('无效的API响应格式');
    } catch (error) {
      console.error('解析API结果失败:', error);
      throw new Error('解析评测结果失败');
    }
  }

  // 从XML中提取评分数据
  private extractScoresFromXML(xmlData: string): any {
    const scores: any = {};
    
    try {
      console.log('🔍 开始解析XML评分数据...');
      console.log('📄 XML数据总长度:', xmlData.length);
      console.log('📄 XML数据内容:', xmlData);
      
      // 根据讯飞API实际返回格式进行解析
      // 总体评分
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
      
      // 发音评分
      const pronunciationMatch = xmlData.match(/<pronunciation_score>(\d+)<\/pronunciation_score>/);
      if (pronunciationMatch) {
        scores.pronunciation = parseInt(pronunciationMatch[1]);
        console.log('✅ 提取发音评分:', scores.pronunciation);
      } else {
        const pronunciationMatch2 = xmlData.match(/<pronunciation>(\d+)<\/pronunciation>/);
        if (pronunciationMatch2) {
          scores.pronunciation = parseInt(pronunciationMatch2[1]);
          console.log('✅ 提取发音评分(alt):', scores.pronunciation);
        } else {
          console.log('❌ 未找到发音评分');
        }
      }
      
      // 流利度评分
      const fluencyMatch = xmlData.match(/<fluency_score>(\d+)<\/fluency_score>/);
      if (fluencyMatch) {
        scores.fluency = parseInt(fluencyMatch[1]);
        console.log('✅ 提取流利度评分:', scores.fluency);
      } else {
        const fluencyMatch2 = xmlData.match(/<fluency>(\d+)<\/fluency>/);
        if (fluencyMatch2) {
          scores.fluency = parseInt(fluencyMatch2[1]);
          console.log('✅ 提取流利度评分(alt):', scores.fluency);
        } else {
          console.log('❌ 未找到流利度评分');
        }
      }
      
      // 完整性评分
      const integrityMatch = xmlData.match(/<integrity_score>(\d+)<\/integrity_score>/);
      if (integrityMatch) {
        scores.integrity = parseInt(integrityMatch[1]);
        console.log('✅ 提取完整性评分:', scores.integrity);
      } else {
        const integrityMatch2 = xmlData.match(/<integrity>(\d+)<\/integrity>/);
        if (integrityMatch2) {
          scores.integrity = parseInt(integrityMatch2[1]);
          console.log('✅ 提取完整性评分(alt):', scores.integrity);
        } else {
          console.log('❌ 未找到完整性评分');
        }
      }
      
      // 声调评分
      const toneMatch = xmlData.match(/<tone_score>(\d+)<\/tone_score>/);
      if (toneMatch) {
        scores.tone = parseInt(toneMatch[1]);
        console.log('✅ 提取声调评分:', scores.tone);
      } else {
        const toneMatch2 = xmlData.match(/<tone>(\d+)<\/tone>/);
        if (toneMatch2) {
          scores.tone = parseInt(toneMatch2[1]);
          console.log('✅ 提取声调评分(alt):', scores.tone);
        } else {
          console.log('❌ 未找到声调评分');
        }
      }
      
      // 准确度评分
      const accuracyMatch = xmlData.match(/<accuracy_score>(\d+)<\/accuracy_score>/);
      if (accuracyMatch) {
        scores.accuracy = parseInt(accuracyMatch[1]);
        console.log('✅ 提取准确度评分:', scores.accuracy);
      } else {
        const accuracyMatch2 = xmlData.match(/<accuracy>(\d+)<\/accuracy>/);
        if (accuracyMatch2) {
          scores.accuracy = parseInt(accuracyMatch2[1]);
          console.log('✅ 提取准确度评分(alt):', scores.accuracy);
        } else {
          console.log('❌ 未找到准确度评分');
        }
      }
      
      // 情感评分
      const emotionMatch = xmlData.match(/<emotion_score>(\d+)<\/emotion_score>/);
      if (emotionMatch) {
        scores.emotion = parseInt(emotionMatch[1]);
        console.log('✅ 提取情感评分:', scores.emotion);
      } else {
        const emotionMatch2 = xmlData.match(/<emotion>(\d+)<\/emotion>/);
        if (emotionMatch2) {
          scores.emotion = parseInt(emotionMatch2[1]);
          console.log('✅ 提取情感评分(alt):', scores.emotion);
        } else {
          console.log('❌ 未找到情感评分');
        }
      }
      
      // 如果没有找到任何评分，尝试查找其他可能的格式
      if (Object.keys(scores).length === 0) {
        console.log('🔍 尝试查找其他评分格式...');
        const allScoreMatches = xmlData.match(/<(\w+_?score|\w+)>(\d+)<\/\1>/g);
        if (allScoreMatches) {
          console.log('🔍 找到的评分标签:', allScoreMatches);
          allScoreMatches.forEach(match => {
            const tagMatch = match.match(/<(\w+)>(\d+)<\/\1>/);
            if (tagMatch) {
              const tagName = tagMatch[1];
              const scoreValue = parseInt(tagMatch[2]);
              scores[tagName] = scoreValue;
              console.log(`✅ 提取${tagName}:`, scoreValue);
            }
          });
        }
      }
      
      console.log('📊 最终提取的评分:', scores);
      
    } catch (error) {
      console.error('❌ 提取评分失败:', error);
    }
    
    return scores;
  }

  // 从XML中提取单词详情
  private extractWordDetailsFromXML(xmlData: string): WordDetail[] {
    try {
      console.log('🔍 开始解析单词详情...');
      const wordDetails: WordDetail[] = [];
      
      // 尝试解析讯飞API的单词详情格式
      // 这里需要根据实际的API响应格式调整
      
      // 示例：查找单词边界信息
      const wordMatches = xmlData.match(/<word[^>]*>/g);
      if (wordMatches) {
        console.log('📝 找到单词标签:', wordMatches.length);
        wordMatches.forEach((wordTag, index) => {
          // 提取单词内容
          const contentMatch = wordTag.match(/content="([^"]*)"/);
          const symbolMatch = wordTag.match(/symbol="([^"]*)"/);
          const begPosMatch = wordTag.match(/beg_pos="(\d+)"/);
          const endPosMatch = wordTag.match(/end_pos="(\d+)"/);
          
          if (contentMatch) {
            const wordDetail: WordDetail = {
              content: contentMatch[1] || '',
              symbol: symbolMatch ? symbolMatch[1] : '',
              beg_pos: begPosMatch ? parseInt(begPosMatch[1]) : 0,
              end_pos: endPosMatch ? parseInt(endPosMatch[1]) : 0,
              time_len: 0,
              errors: []
            };
            
            wordDetails.push(wordDetail);
            console.log(`✅ 解析单词 ${index + 1}:`, wordDetail.content);
          }
        });
      }
      
      console.log(`📊 成功解析 ${wordDetails.length} 个单词详情`);
      return wordDetails;
      
    } catch (error) {
      console.error('❌ 提取单词详情失败:', error);
      return [];
    }
  }

  // 完整的语音评测流程
  async evaluateSpeech(text: string, audioData: ArrayBuffer): Promise<SpeechRecognitionResult> {
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🚀 开始语音评测流程... (第${retryCount + 1}次尝试)`);
        console.log('📝 目标文本:', text);
        console.log('🎵 音频数据大小:', audioData.byteLength, 'bytes');
        
        // 1. 建立连接
        console.log('🔌 正在建立WebSocket连接...');
        if (!(await this.connect())) {
          throw new Error('连接失败');
        }

        // 2. 发送配置
        console.log('📤 正在发送评测配置...');
        if (!(await this.sendConfig(text))) {
          throw new Error('配置发送失败');
        }

        // 3. 分块发送音频数据
        console.log('📤 正在分块发送音频数据...');
        const totalChunks = Math.ceil(audioData.byteLength / audioConfig.chunk_size);
        console.log(`📊 音频将分为 ${totalChunks} 块发送`);
        
        // 等待一小段时间让配置生效
        await new Promise(resolve => setTimeout(resolve, 200));
        
        for (let i = 0; i < audioData.byteLength; i += audioConfig.chunk_size) {
          const chunk = audioData.slice(i, i + audioConfig.chunk_size);
          const isLast = (i + audioConfig.chunk_size >= audioData.byteLength);
          const isFirst = (i === 0);
          const chunkNumber = Math.floor(i / audioConfig.chunk_size) + 1;
          
          console.log(`📤 发送第 ${chunkNumber}/${totalChunks} 块音频数据: ${chunk.byteLength} bytes`);
          
          if (!(await this.sendAudioChunk(chunk, isLast, isFirst))) {
            throw new Error(`第 ${chunkNumber} 块音频发送失败`);
          }
          
          // 减少发送间隔，避免服务器超时
          if (!isLast) {
            await new Promise(resolve => setTimeout(resolve, 30)); // 使用30ms间隔，平衡速度和稳定性
          }
        }
        
        // 4. 等待音频数据处理完成
        console.log('⏳ 音频数据发送完成，等待服务器处理...');
        await new Promise(resolve => setTimeout(resolve, 300)); // 给服务器时间处理
        
        // 5. 验证音频数据完整性
        console.log('🔍 验证音频数据完整性...');
        const expectedChunks = Math.ceil(audioData.byteLength / audioConfig.chunk_size);
        console.log(`📊 预期分块数: ${expectedChunks}, 实际发送: ${totalChunks}`);
        console.log(`📊 音频总大小: ${audioData.byteLength} bytes`);
        
        if (totalChunks !== expectedChunks) {
          console.warn('⚠️ 分块数量不匹配，可能影响评测结果');
        }
        
        // 4. 接收结果
        console.log('⏳ 等待评测结果...');
        console.log('📡 WebSocket状态:', this.websocket?.readyState);
        console.log('🔗 连接状态:', this.isConnected);
        
        const result = await this.receiveResult();
        console.log('✅ 评测完成:', result);
        
        // 验证结果完整性
        if (result.overall_score === 0 && result.pronunciation_score === 0) {
          console.warn('⚠️ 警告：所有评分都为0，可能解析失败');
        }
        
        return result;
        
      } catch (error: any) {
        retryCount++;
        console.error(`❌ 第${retryCount}次尝试失败:`, error);
        
        // 分析错误类型
        const errorMessage = error.message || '';
        if (errorMessage.includes('server read msg timeout') || errorMessage.includes('timeout')) {
          console.log('⏰ 检测到服务器超时错误，将使用更快的发送策略重试');
        }
        
        // 关闭当前连接
        this.close();
        
        if (retryCount >= maxRetries) {
          console.error(`❌ 已达到最大重试次数(${maxRetries})，评测失败`);
          throw new Error(`语音评测失败，已重试${maxRetries}次: ${error.message}`);
        }
        
        // 等待一段时间后重试
        const waitTime = retryCount * 1000; // 减少等待时间，从2秒减少到1秒
        console.log(`⏳ ${waitTime}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error('语音评测失败');
  }

  // 关闭连接
  close(): void {
    // 停止保活机制
    this.stopKeepAlive();
    
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
      console.log('🔌 连接已关闭');
    }
  }
  
  // 销毁服务，清理所有资源
  destroy(): void {
    this.close();
    this.cleanupNetworkListener();
    console.log('🗑️ 语音识别服务已销毁');
  }
}

export const speechRecognitionService = new SpeechRecognitionService();