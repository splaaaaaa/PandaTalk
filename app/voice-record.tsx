import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, StatusBar, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function VoiceRecordScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  const timeInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 请求麦克风权限
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    return () => {
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('权限不足', '请授予麦克风权限才能录音。');
        return;
      }

      setIsRecording(true);
      setRecordingTime(0);
      setTranscription('');

      // 启动计时器
      timeInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // 启动动画
      startAnimations();

      // 开始录音
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);

      // 模拟实时转写
      startTranscription();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('录音失败', '无法开始录音，请检查麦克风。');
      setIsRecording(false);
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }
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
          // 跳转到录音结束页面，传递录音文件URI
          router.push({
            pathname: '/voice-record-complete',
            params: { 
              duration: recordingTime,
              transcription,
              audioUri: uri,
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('停止录音失败', '无法停止录音，请重试。');
    }
  };

  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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

  const startTranscription = () => {
    const mockTranscription = [
      "Hello, this is a test recording...",
      "I'm speaking into the microphone...",
      "The voice recognition is working...",
    ];

    let index = 0;
    const transcriptionInterval = setInterval(() => {
      if (index < mockTranscription.length && isRecording) {
        setTranscription(prev => prev + (prev ? ' ' : '') + mockTranscription[index]);
        index++;
      } else {
        clearInterval(transcriptionInterval);
      }
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Message</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Recording Visual */}
        <View style={styles.recordingVisual}>
          <Animated.View
            style={[
              styles.recordingCircle,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.innerCircle}>
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={40} 
                color="#FFFFFF" 
              />
            </View>
          </Animated.View>
        </View>

        {/* Recording Time */}
        <Text style={styles.recordingTime}>
          {formatTime(recordingTime)}
        </Text>

        {/* Status Text */}
        <Text style={styles.statusText}>
          {isRecording ? 'Recording...' : 'Tap to start recording'}
        </Text>

        {/* Transcription */}
        {transcription && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionLabel}>Live Transcription:</Text>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonRecording,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isRecording ? "stop" : "mic"}
            size={32}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  recordingVisual: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingTime: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  transcriptionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: 200,
  },
  transcriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  bottomControls: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  recordButtonRecording: {
    backgroundColor: '#FF3B30',
    transform: [{ scale: 1.1 }],
  },
});
