import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

// 圆环进度条组件
const CircularProgress = ({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = score / 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <Svg width={size} height={size}>
      {/* 背景圆环 */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E5EA"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* 进度圆环 */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#34C759"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const result = params.result ? JSON.parse(params.result as string) : null;

  const getScoreLevel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: '优秀', color: '#34C759' };
    if (score >= 80) return { label: '良好', color: '#007AFF' };
    if (score >= 70) return { label: '一般', color: '#FF9500' };
    return { label: '需改进', color: '#FF3B30' };
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>暂无评测结果</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>返回</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 顶部导航栏 */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>评测结果</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, { backgroundColor: '#FFD700' }]} />
          <View style={[styles.progressSegment, { backgroundColor: '#FFD700' }]} />
          <View style={[styles.progressSegment, { backgroundColor: '#E5E5EA' }]} />
        </View>
      </View>
      
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 总分显示 */}
        <View style={styles.totalScoreCard}>
          <View style={styles.scoreCircleContainer}>
            <View style={styles.scoreCircleWrapper}>
              <CircularProgress score={result.overall_score} />
              <View style={styles.scoreCircleInner}>
                <Text style={styles.scoreNumber}>{result.overall_score}</Text>
              </View>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>
                {getScoreLevel(result.overall_score).label}!
              </Text>
            </View>
          </View>
        </View>

        {/* 详细评分 */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>詳細評分</Text>
          
          <View style={styles.scoreItem}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreItemLabel}>聲調準確度</Text>
              <Text style={styles.scoreItemValue}>{result.tone_score}%</Text>
            </View>
            <View style={styles.detailProgressBar}>
              <View style={[styles.detailProgressFill, { 
                width: `${result.tone_score}%`,
                backgroundColor: result.tone_score >= 80 ? '#34C759' : '#FF9500'
              }]} />
            </View>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreItemLabel}>發音清晰度</Text>
              <Text style={styles.scoreItemValue}>{result.pronunciation_score}%</Text>
            </View>
            <View style={styles.detailProgressBar}>
              <View style={[styles.detailProgressFill, { 
                width: `${result.pronunciation_score}%`,
                backgroundColor: result.pronunciation_score >= 80 ? '#34C759' : '#FF9500'
              }]} />
            </View>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreItemLabel}>語速控制</Text>
              <Text style={styles.scoreItemValue}>{result.fluency_score}%</Text>
            </View>
            <View style={styles.detailProgressBar}>
              <View style={[styles.detailProgressFill, { 
                width: `${result.fluency_score}%`,
                backgroundColor: result.fluency_score >= 80 ? '#34C759' : '#FF9500'
              }]} />
            </View>
          </View>
        </View>

        {/* 改进建议 */}
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>改進建議</Text>
          
          <View style={styles.suggestionItem}>
            <Ionicons name="bulb" size={20} color="#FFD700" />
            <Text style={styles.suggestionText}>注意"魚"字的聲調變化</Text>
          </View>
          
          <View style={styles.suggestionItem}>
            <Ionicons name="bulb" size={20} color="#FFD700" />
            <Text style={styles.suggestionText}>適當放慢語速,保持清晰</Text>
          </View>
          
          <View style={styles.suggestionItem}>
            <Ionicons name="bulb" size={20} color="#FFD700" />
            <Text style={styles.suggestionText}>練習鼻音和邊音的區別</Text>
          </View>
        </View>

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>重新练习</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="home" size={20} color="#FFD700" />
            <Text style={styles.homeButtonText}>返回首页</Text>
          </TouchableOpacity>
        </View>

        {/* 跳过按钮 */}
        <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/(tabs)')}>
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
  progressContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  progressSegment: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  totalScoreCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 30,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  scoreCircleInner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#34C759',
  },
  scoreBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  detailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreItem: {
    marginBottom: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  scoreItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  detailProgressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  suggestionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  suggestionText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 15,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  homeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
