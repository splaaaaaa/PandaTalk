// Figma 插件主代码
figma.showUI(__html__, { width: 400, height: 600 });

// 监听来自 UI 的消息
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'share-design') {
    await shareDesignToPandatalk(msg.designData);
  } else if (msg.type === 'get-selection') {
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const designData = await extractDesignData(selection);
      figma.ui.postMessage({ type: 'selection-data', data: designData });
    } else {
      figma.ui.postMessage({ type: 'no-selection' });
    }
  }
};

// 提取设计数据
async function extractDesignData(nodes) {
  const designData = {
    id: figma.currentPage.id,
    name: figma.currentPage.name,
    timestamp: new Date().toISOString(),
    nodes: [],
    preview: null
  };

  for (const node of nodes) {
    const nodeData = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    };

    // 如果是文本节点，提取文本内容
    if (node.type === 'TEXT') {
      nodeData.text = node.characters;
      nodeData.fontSize = node.fontSize;
      nodeData.fontName = node.fontName;
    }

    // 如果是形状节点，提取颜色信息
    if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON') {
      if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID') {
          nodeData.color = {
            r: Math.round(fill.color.r * 255),
            g: Math.round(fill.color.g * 255),
            b: Math.round(fill.color.b * 255)
          };
        }
      }
    }

    designData.nodes.push(nodeData);
  }

  // 生成预览图
  try {
    const image = await figma.createImage(await figma.currentPage.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 }
    }));
    designData.preview = image.hash;
  } catch (error) {
    console.log('无法生成预览图:', error);
  }

  return designData;
}

// 分享设计到 Pandatalk
async function shareDesignToPandatalk(designData) {
  try {
    // 这里可以集成实际的 API 调用
    // 目前使用模拟的分享功能
    const shareData = {
      type: 'figma-design',
      design: designData,
      message: `分享了一个 Figma 设计: ${designData.name}`,
      timestamp: new Date().toISOString()
    };

    // 发送到聊天应用（这里需要实际的 API 端点）
    console.log('分享设计到 Pandatalk:', shareData);
    
    // 显示成功消息
    figma.ui.postMessage({ 
      type: 'share-success', 
      message: '设计已成功分享到 Pandatalk！' 
    });

  } catch (error) {
    console.error('分享失败:', error);
    figma.ui.postMessage({ 
      type: 'share-error', 
      message: '分享失败，请重试' 
    });
  }
}

// 插件启动时的初始化
figma.ui.postMessage({ 
  type: 'plugin-ready', 
  message: 'Pandatalk 集成插件已准备就绪！' 
});

