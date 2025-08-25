import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';

export default function VoiceRecordCompleteScreen() {
  const router = useRouter();
  const { duration, transcription, audioUri } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  
  const positionUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 加载音频文件
    loadAudio();
    
    return () => {
      // 清理资源
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, []);

  const loadAudio = async () => {
    try {
      if (audioUri) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri as string },
          { shouldPlay: false }
        );
        
        setSound(newSound);
        
        // 获取音频时长
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setPlaybackDuration(status.durationMillis || 0);
        }
        
        // 监听播放状态
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis || 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to load audio', error);
      Alert.alert('错误', '无法加载录音文件');
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!sound) return;

      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        if (positionUpdateInterval.current) {
          clearInterval(positionUpdateInterval.current);
        }
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        
        // 启动位置更新定时器
        positionUpdateInterval.current = setInterval(() => {
          sound.getStatusAsync().then((status) => {
            if (status.isLoaded) {
              setPlaybackPosition(status.positionMillis || 0);
            }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to play/pause audio', error);
      Alert.alert('错误', '播放失败，请重试');
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (playbackDuration === 0) return 0;
    return (playbackPosition / playbackDuration) * 100;
  };

  const handleSend = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Message</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <View style={styles.recordingIcon}>
            <Ionicons name="mic" size={40} color="#FF3B30" />
          </View>
          <Text style={styles.duration}>{formatTime(Number(duration) * 1000)}</Text>
          <Text style={styles.summaryText}>Voice message recorded successfully</Text>
        </View>

        <View style={styles.audioPlayer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          
          <View style={styles.audioInfo}>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getProgressPercentage()}%` }]} />
            </View>
            <Text style={styles.timeInfo}>
              {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
            </Text>
          </View>
        </View>

        <View style={styles.transcriptionSection}>
          <Text style={styles.sectionTitle}>Transcription</Text>
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>{transcription}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  duration: {
    fontSize: 36,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  audioPlayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  audioInfo: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progress: {
    height: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 2,
    width: '60%',
  },
  timeInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  transcriptionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  transcriptionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 15,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
