import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { speechRecognitionService } from '../services/speech-recognition';
import { xfyunConfig } from '../config/api-config';

export default function DebugAPIScreen() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  const testAPIConnection = async () => {
    setIsTesting(true);
    setTestResult('正在测试API连接...\n');
    
    try {
      // 测试1: 检查配置
      setTestResult(prev => prev + '✅ 检查API配置...\n');
      console.log('🔧 API配置:', xfyunConfig);
      
      // 测试2: 测试WebSocket连接
      setTestResult(prev => prev + '🔌 测试WebSocket连接...\n');
      
      // 创建一个更真实的测试音频数据（模拟16kHz, 16bit, 单声道PCM）
      const sampleRate = 16000;
      const duration = 2; // 2秒
      const testAudioData = new ArrayBuffer(sampleRate * duration * 2); // 16bit = 2 bytes
      const testText = "红鲤鱼与绿鲤鱼与驴";
      
      setTestResult(prev => prev + '📤 发送测试请求...\n');
      setTestResult(prev => prev + `📝 测试文本: ${testText}\n`);
      setTestResult(prev => prev + `🎵 音频数据: ${testAudioData.byteLength} bytes\n`);
      
      const result = await speechRecognitionService.evaluateSpeech(testText, testAudioData);
      
      setTestResult(prev => prev + '✅ API调用成功!\n');
      setTestResult(prev => prev + `📊 总体评分: ${result.overall_score}\n`);
      setTestResult(prev => prev + `🎯 发音评分: ${result.pronunciation_score}\n`);
      setTestResult(prev => prev + `📈 流利度评分: ${result.fluency_score}\n`);
      setTestResult(prev => prev + `🔒 完整性评分: ${result.integrity_score}\n`);
      setTestResult(prev => prev + `🎵 声调评分: ${result.tone_score}\n`);
      setTestResult(prev => prev + `🎯 准确度评分: ${result.accuracy_score}\n`);
      setTestResult(prev => prev + `😊 情感评分: ${result.emotion_score}\n`);
      
      // 显示原始结果
      if (result.raw_result) {
        setTestResult(prev => prev + '\n📄 原始API响应:\n');
        setTestResult(prev => prev + JSON.stringify(result.raw_result, null, 2) + '\n');
      }
      
    } catch (error) {
      console.error('❌ API测试失败:', error);
      setTestResult(prev => prev + `❌ API测试失败: ${error instanceof Error ? error.message : '未知错误'}\n`);
      
      // 显示详细错误信息
      if (error instanceof Error) {
        setTestResult(prev => prev + `🔍 错误类型: ${error.constructor.name}\n`);
        setTestResult(prev => prev + `📝 错误消息: ${error.message}\n`);
        if (error.stack) {
          setTestResult(prev => prev + `📚 错误堆栈: ${error.stack}\n`);
        }
      }
    } finally {
      setIsTesting(false);
    }
  };

  const clearResult = () => {
    setTestResult('');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 顶部导航栏 */}
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>API调试</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* API配置信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API配置信息</Text>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>APPID:</Text>
            <Text style={styles.configValue}>{xfyunConfig.APPID}</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>API_KEY:</Text>
            <Text style={styles.configValue}>{xfyunConfig.API_KEY.substring(0, 8)}...</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>API_SECRET:</Text>
            <Text style={styles.configValue}>{xfyunConfig.API_SECRET.substring(0, 8)}...</Text>
          </View>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>BASE_URL:</Text>
            <Text style={styles.configValue}>{xfyunConfig.BASE_URL}</Text>
          </View>
        </View>

        {/* 测试按钮 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API连接测试</Text>
          <TouchableOpacity 
            style={[styles.testButton, isTesting && styles.testButtonDisabled]} 
            onPress={testAPIConnection}
            disabled={isTesting}
          >
            <Ionicons name="bug" size={20} color="#FFFFFF" />
            <Text style={styles.testButtonText}>
              {isTesting ? '测试中...' : '开始测试'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearResult}
          >
            <Text style={styles.clearButtonText}>清除结果</Text>
          </TouchableOpacity>
        </View>

        {/* 测试结果 */}
        {testResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>测试结果</Text>
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          </View>
        ) : null}

        {/* 调试说明 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>调试说明</Text>
          <Text style={styles.instructionText}>
            1. 点击"开始测试"按钮测试API连接{'\n'}
            2. 查看控制台日志获取详细信息{'\n'}
            3. 如果测试失败，检查网络连接和API配置{'\n'}
            4. 确保音频数据格式正确（16kHz, 16bit, 单声道）
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  configLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  configValue: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  testButtonDisabled: {
    backgroundColor: '#999999',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  resultContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  resultText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
