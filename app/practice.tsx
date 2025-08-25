import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, Alert, Animated, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import { speechRecognitionService, SpeechRecognitionResult } from '../services/speech-recognition';
import * as FileSystem from 'expo-file-system';

export default function PracticeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognitionResult, setRecognitionResult] = useState<SpeechRecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  // 始终使用真实API
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentAudioUri, setCurrentAudioUri] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Array<{uri: string, result: SpeechRecognitionResult | null}>>([]);
  
  const timeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const playButtonAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    })();

    // 清理音频资源
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleStartRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('权限错误', '请授予麦克风权限');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingTime(0);
      setRecognitionResult(null);
      // 不清空当前音频，让用户可以播放之前的录音
      
      timeInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      
      console.log('🎤 开始录音...');
    } catch (error) {
      console.error('❌ 开始录音失败:', error);
      Alert.alert('录音失败', '无法开始录音，请重试');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }

      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        
        if (uri) {
          console.log('🎤 录音完成，文件路径:', uri);
          setCurrentAudioUri(uri); // 保存音频URI用于播放
          
          // 添加到录音历史
          const newRecording = { uri, result: null };
          setRecordings(prev => [...prev, newRecording]);
          
          await callSpeechRecognitionAPI(uri, newRecording);
        }
      }
    } catch (error) {
      console.error('❌ 停止录音失败:', error);
      Alert.alert('录音失败', '无法停止录音，请重试');
    }
  };

  const callSpeechRecognitionAPI = async (audioUri: string, recordingItem?: {uri: string, result: SpeechRecognitionResult | null}) => {
    setIsProcessing(true);
    
    try {
      const targetText = "紅鯉魚與綠鯉魚與驢";
      
      console.log('🚀 调用真实讯飞API...');
      // 读取音频文件并转换为ArrayBuffer
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const audioData = new Uint8Array(Array.from(atob(audioBase64)).map(char => char.charCodeAt(0))).buffer;
      const result = await speechRecognitionService.evaluateSpeech(targetText, audioData);
      
      setRecognitionResult(result);
      
      // 更新录音历史中的结果
      if (recordingItem) {
        setRecordings(prev => prev.map(item => 
          item.uri === recordingItem.uri ? { ...item, result } : item
        ));
      }
      
      console.log('✅ 语音识别结果:', result);
      
      // 自动跳转到结果页面
      router.push({
        pathname: '/result',
        params: { result: JSON.stringify(result) }
      });
      
    } catch (error) {
      console.error('❌ 语音识别失败:', error);
      Alert.alert('识别失败', error instanceof Error ? error.message : '语音识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const playSelectedRecording = async (uri: string) => {
    try {
      // 停止当前播放
      if (sound) {
        await sound.stopAsync();
        setSound(null);
      }
      setIsPlaying(false);
      stopPlayAnimation();
      
      // 创建新的音频对象并播放
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      startPlayAnimation();
      
      // 监听播放完成
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          stopPlayAnimation();
        }
      });
    } catch (error) {
      console.error('播放历史录音失败:', error);
      Alert.alert('播放失败', '无法播放音频，请重试');
    }
  };

  const handlePlayback = async () => {
    if (!currentAudioUri) {
      Alert.alert('提示', '请先录制音频');
      return;
    }

    try {
      if (isPlaying) {
        if (sound) {
          await sound.pauseAsync();
        }
        setIsPlaying(false);
        stopPlayAnimation();
      } else {
        if (sound) {
          await sound.playAsync();
          setIsPlaying(true);
          startPlayAnimation();
        } else {
          // 创建新的音频对象
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: currentAudioUri },
            { shouldPlay: true }
          );
          setSound(newSound);
          setIsPlaying(true);
          startPlayAnimation();
          
          // 监听播放完成
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              stopPlayAnimation();
            }
          });
        }
      }
    } catch (error) {
      console.error('播放失败:', error);
      Alert.alert('播放失败', '无法播放音频，请重试');
    }
  };

  const startPlayAnimation = () => {
    // 播放按钮缩放动画
    Animated.sequence([
      Animated.timing(playButtonAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(playButtonAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPlayAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleSkip = () => {
    router.back();
  };



  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreLevel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: '优秀', color: '#34C759' };
    if (score >= 80) return { label: '良好', color: '#007AFF' };
    if (score >= 70) return { label: '一般', color: '#FF9500' };
    return { label: '需改进', color: '#FF3B30' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 顶部导航栏 */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>發音練習</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, { 
            backgroundColor: '#FFD700'
          }]} />
          <View style={[styles.progressSegment, { 
            backgroundColor: '#E5E5EA'
          }]} />
          <View style={[styles.progressSegment, { 
            backgroundColor: '#E5E5EA'
          }]} />
        </View>
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>



      <View style={styles.contentCard}>
        <View style={styles.pinyinContainer}>
          <Text style={styles.pinyinText}>hóng lǐ yú yù lǜ lǐ yú</Text>
          <Text style={styles.chineseText}>紅鯉魚與綠鯉魚</Text>
          <Text style={styles.pinyinText}>yŭ lú</Text>
          <Text style={styles.chineseText}>與驢</Text>
        </View>
        

        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.hintButton} activeOpacity={0.8}>
            <Ionicons name="bulb" size={24} color="#FFFFFF" />
            <Text style={styles.hintText}>需要提示?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playButton} 
            onPress={() => {
              // 内容卡片的播放功能先占位
              Alert.alert('提示', '内容播放功能开发中...');
            }} 
            activeOpacity={0.8}
          >
            <Ionicons 
              name="play" 
              size={24} 
              color="#CCCCCC"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recordingCard}>
        <Text style={styles.recordingTitle}>
          {isRecording ? `录音中... ${formatTime(recordingTime)}` : '開始錄音'}
        </Text>
        
        {!hasPermission && (
          <Text style={styles.permissionWarning}>
            ⚠️ 需要麦克风权限才能录音
          </Text>
        )}
        
        <View style={styles.recordingControls}>
          <TouchableOpacity 
            style={[styles.playbackButton, isPlaying && styles.playbackButtonActive]} 
            onPress={handlePlayback} 
            activeOpacity={0.8}
            disabled={!currentAudioUri}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color={currentAudioUri ? "#000000" : "#CCCCCC"} 
              />
            </Animated.View>
            <Text style={[styles.playbackText, { color: currentAudioUri ? "#000000" : "#CCCCCC" }]}>
              {isPlaying ? "暂停" : "播放"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.recordButton, isRecording && styles.recordingActive]} 
            onPress={handleStartRecording}
            activeOpacity={0.8}
            disabled={isProcessing || !hasPermission}
          >
            {isProcessing ? (
              <View style={styles.processingIndicator}>
                <Text style={styles.processingText}>处理中...</Text>
              </View>
            ) : (
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={32} 
                color="#000000" 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
        <Text style={styles.skipText}>跳過</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  progressFill: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  progressSegment: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pinyinContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pinyinText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  chineseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  recognitionResult: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  recognitionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreSection: {
    marginBottom: 16,
  },
  overallScore: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  scoreItemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  hintButton: {
    backgroundColor: '#34C759',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#FFD700',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonActive: {
    backgroundColor: '#FF9500',
    transform: [{ scale: 1.1 }],
    shadowColor: '#FF9500',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordingCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionWarning: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playbackButton: {
    backgroundColor: '#E5E5EA',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playbackButtonActive: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  playbackText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#FFD700',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  processingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
  },
  viewResultButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewResultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

