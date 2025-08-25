// Pandatalk Figma 插件配置文件

const CONFIG = {
  // 插件基本信息
  plugin: {
    name: 'Pandatalk Integration',
    version: '1.0.0',
    author: 'Pandatalk Team',
    description: '与 Pandatalk 聊天应用集成的 Figma 插件'
  },

  // UI 配置
  ui: {
    width: 400,
    height: 600,
    minWidth: 350,
    minHeight: 500
  },

  // API 配置
  api: {
    baseURL: 'https://api.pandatalk.com',
    endpoints: {
      shareDesign: '/api/v1/designs/share',
      getUserInfo: '/api/v1/users/me',
      getChats: '/api/v1/chats',
      uploadImage: '/api/v1/uploads/image',
      health: '/api/v1/health'
    },
    timeout: 30000, // 30秒超时
    retryAttempts: 3,
    retryDelay: 1000
  },

  // 设计导出配置
  export: {
    format: 'PNG',
    scale: 2,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.9
  },

  // 支持的元素类型
  supportedElements: [
    'RECTANGLE',
    'ELLIPSE',
    'POLYGON',
    'STAR',
    'VECTOR',
    'TEXT',
    'FRAME',
    'GROUP',
    'COMPONENT',
    'INSTANCE',
    'BOOLEAN_OPERATION',
    'LINE'
  ],

  // 颜色配置
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
      disabled: '#C7C7CC'
    },
    border: '#E5E5EA'
  },

  // 字体配置
  fonts: {
    family: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'SF Mono, Monaco, Inconsolata, "Roboto Mono", monospace'
    },
    size: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px'
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  // 动画配置
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // 本地存储键名
  storage: {
    apiKey: 'pandatalk_api_key',
    userId: 'pandatalk_user_id',
    chatId: 'pandatalk_chat_id',
    settings: 'pandatalk_settings',
    recentDesigns: 'pandatalk_recent_designs'
  },

  // 默认设置
  defaults: {
    autoSave: true,
    showPreview: true,
    includeMetadata: true,
    compressImages: true,
    maxRecentDesigns: 10
  },

  // 错误消息
  messages: {
    errors: {
      noSelection: '请先选择要分享的设计元素',
      noNetwork: '网络连接失败，请检查网络设置',
      apiError: 'API 请求失败，请稍后重试',
      invalidConfig: '配置信息无效，请检查设置',
      exportFailed: '导出设计失败，请重试',
      shareFailed: '分享失败，请检查权限和配置'
    },
    success: {
      designShared: '设计已成功分享到 Pandatalk！',
      settingsSaved: '设置已保存',
      previewGenerated: '预览图已生成'
    },
    info: {
      pluginReady: 'Pandatalk 集成插件已准备就绪！',
      gettingInfo: '正在获取设计信息...',
      sharing: '正在分享设计...',
      processing: '正在处理...'
    }
  },

  // 调试配置
  debug: {
    enabled: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    showConsole: false
  }
};

// 配置验证函数
function validateConfig() {
  const required = ['api.baseURL', 'ui.width', 'ui.height'];
  
  for (const path of required) {
    const value = getNestedValue(CONFIG, path);
    if (value === undefined || value === null) {
      console.error(`配置缺失: ${path}`);
      return false;
    }
  }
  
  return true;
}

// 获取嵌套对象值
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// 设置配置值
function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => current[key], CONFIG);
  target[lastKey] = value;
}

// 获取配置值
function getConfig(path) {
  return getNestedValue(CONFIG, path);
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, validateConfig, setConfig, getConfig };
} else if (typeof window !== 'undefined') {
  window.PandatalkConfig = { CONFIG, validateConfig, setConfig, getConfig };
}

// 初始化时验证配置
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!validateConfig()) {
      console.error('Pandatalk 插件配置验证失败');
    }
  });
}

