// Pandatalk API 集成示例
// 这个文件展示了如何与实际的聊天应用 API 进行集成

class PandatalkAPI {
  constructor(config) {
    this.baseURL = config.baseURL || 'https://api.pandatalk.com';
    this.apiKey = config.apiKey;
    this.userId = config.userId;
    this.chatId = config.chatId;
  }

  // 分享设计到指定聊天
  async shareDesign(designData) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/designs/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-User-ID': this.userId
        },
        body: JSON.stringify({
          chatId: this.chatId,
          design: {
            name: designData.name,
            description: designData.message,
            elements: designData.nodes,
            preview: designData.preview,
            metadata: {
              source: 'figma',
              figmaFileId: designData.id,
              figmaPageName: designData.name,
              timestamp: designData.timestamp
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: '设计分享成功！'
      };

    } catch (error) {
      console.error('分享设计失败:', error);
      return {
        success: false,
        error: error.message,
        message: '分享失败，请检查网络连接和配置'
      };
    }
  }

  // 获取用户信息
  async getUserInfo() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-User-ID': this.userId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  // 获取聊天列表
  async getChats() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/chats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-User-ID': this.userId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('获取聊天列表失败:', error);
      throw error;
    }
  }

  // 上传预览图
  async uploadPreview(imageData, fileName) {
    try {
      const formData = new FormData();
      formData.append('image', imageData, fileName);
      formData.append('type', 'design-preview');

      const response = await fetch(`${this.baseURL}/api/v1/uploads/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-User-ID': this.userId
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.imageUrl;

    } catch (error) {
      console.error('上传预览图失败:', error);
      throw error;
    }
  }

  // 验证 API 连接
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.ok;

    } catch (error) {
      console.error('API 连接测试失败:', error);
      return false;
    }
  }
}

// 配置示例
const config = {
  baseURL: 'https://api.pandatalk.com',
  apiKey: 'your-api-key-here',
  userId: 'your-user-id',
  chatId: 'target-chat-id'
};

// 使用示例
async function shareDesignWithAPI(designData) {
  const api = new PandatalkAPI(config);
  
  try {
    // 测试连接
    const isConnected = await api.testConnection();
    if (!isConnected) {
      throw new Error('无法连接到 Pandatalk API');
    }

    // 分享设计
    const result = await api.shareDesign(designData);
    
    if (result.success) {
      console.log('设计分享成功:', result.data);
      return result;
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error('分享失败:', error);
    throw error;
  }
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PandatalkAPI, shareDesignWithAPI };
} else if (typeof window !== 'undefined') {
  window.PandatalkAPI = PandatalkAPI;
  window.shareDesignWithAPI = shareDesignWithAPI;
}

