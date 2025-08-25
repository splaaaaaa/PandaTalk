import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('free-practice');

  const handleTabPress = (tabName: string) => {
    if (tabName === 'pk-competition') {
      router.push('/pk-arena');
    } else if (tabName === 'profile') {
      router.push('/profile');
    } else {
      // 自由练习是当前页面，不需要跳转
      setActiveTab(tabName);
    }
  };

  const handleStartChallenge = () => {
    router.push('/practice');
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <View style={styles.topNavContent}>
          <TouchableOpacity style={styles.topNavButton}>
            <Ionicons name="menu" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>個人成就</Text>
          <TouchableOpacity style={styles.topNavButton}>
            <Ionicons name="notifications" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header with User Stats */}
        <View style={styles.header}>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="paw" size={20} color="#FFD700" />
              </View>
              <Text style={styles.statValue}>1,250</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={20} color="#AF52DE" />
              </View>
              <Text style={styles.statValue}>5</Text>
            </View>
          </View>
        </View>

        {/* Challenge King Card */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeContent}>
            <View style={styles.challengeLeft}>
              <View style={styles.trophyIcon}>
                <Ionicons name="trophy" size={32} color="#FFD700" />
              </View>
              <View style={styles.challengeText}>
                <Text style={styles.challengeTitle}>本週挑戰王</Text>
                <Text style={styles.challengeDescription}>完成5個挑戰,獲得特殊徽章</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>80%</Text>
            </View>
          </View>
        </View>

        {/* Achievement Cards Row */}
        <View style={styles.achievementRow}>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name="star" size={24} color="#FFD700" />
            </View>
            <Text style={styles.achievementTitle}>發音達人</Text>
            <Text style={styles.achievementDescription}>連續7天練習</Text>
          </View>
          
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons name="locate" size={24} color="#FF3B30" />
            </View>
            <Text style={styles.achievementTitle}>發音大師</Text>
            <Text style={styles.achievementDescription}>準確率達95%</Text>
          </View>
        </View>

        {/* Challenge Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>挑戰</Text>
          <View style={styles.challengeSection}>
            <View style={styles.pandaContainer}>
              <Text style={styles.pandaEmoji}>🐼</Text>
            </View>
            <TouchableOpacity 
              style={styles.startChallengeButton} 
              activeOpacity={0.8}
              onPress={handleStartChallenge}
            >
              <Text style={styles.startChallengeText}>開始{'\n'}挑戰</Text>
            </TouchableOpacity>
          </View>
        </View>





        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>統計</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, styles.weeklyColor]}>15</Text>
              <Text style={styles.statLabel}>本週練習</Text>
              <Text style={styles.statChange}>+3 較上週</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, styles.accuracyColor]}>87%</Text>
              <Text style={styles.statLabel}>正確率</Text>
              <Text style={styles.statChange}>優秀</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, styles.consecutiveColor]}>7</Text>
              <Text style={styles.statLabel}>連續天數</Text>
              <Text style={styles.statChange}>保持熱度</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'free-practice' && styles.activeTab]}
          onPress={() => handleTabPress('free-practice')}
        >
          <Text style={[styles.navText, activeTab === 'free-practice' && styles.activeNavText]}>自由練習</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'pk-competition' && styles.activeTab]}
          onPress={() => handleTabPress('pk-competition')}
        >
          <Text style={[styles.navText, activeTab === 'pk-competition' && styles.activeNavText]}>PK競技</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navTab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => handleTabPress('profile')}
        >
          <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>個人檔案</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingTop: 10,
    paddingBottom: 15,
  },
  topNavContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  challengeCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  challengeText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressFill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD700',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 15,
  },
  challengeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pandaContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pandaEmoji: {
    fontSize: 80,
  },
  startChallengeButton: {
    backgroundColor: '#FFD700',
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  startChallengeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
  },


  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weeklyColor: {
    color: '#FFD700',
  },
  accuracyColor: {
    color: '#34C759',
  },
  consecutiveColor: {
    color: '#FF9500',
  },
  statLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  statChange: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#FFE082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#000000',
    fontWeight: '700',
  },
});
