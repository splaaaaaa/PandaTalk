import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PKArenaScreen() {
  const [activeTab, setActiveTab] = useState('pk-competition');

  const handleTabPress = (tabName: string) => {
    if (tabName === 'free-practice') {
      router.push('/(tabs)');
    } else if (tabName === 'profile') {
      router.push('/profile');
    } else {
      setActiveTab(tabName);
    }
  };

  const handleStartNewDuel = () => {
    // 处理开始新决斗的逻辑
    console.log('开始新决斗');
  };

  const handleRecordTurn = () => {
    // 处理录音回合的逻辑
    console.log('轮到你了，点击录音');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 顶部标题 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PK競技場</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 开始新决斗按钮 */}
        <TouchableOpacity 
          style={styles.startDuelButton} 
          activeOpacity={0.8}
          onPress={handleStartNewDuel}
        >
          <Text style={styles.startDuelText}>開始新決鬥</Text>
        </TouchableOpacity>

        {/* 进行中的决斗 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>進行中的決鬥</Text>
          
          {/* 第一个决斗卡片 */}
          <View style={styles.duelCard}>
            <View style={styles.playerInfo}>
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>你</Text>
                <Text style={styles.playerLevel}>等級: 3</Text>
              </View>
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            
            <View style={styles.playerInfo}>
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={24} color="#FF9500" />
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>小華</Text>
                <Text style={styles.playerLevel}>等級: 4</Text>
              </View>
            </View>
          </View>
          
          {/* 第一个决斗的行动按钮 */}
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={handleRecordTurn}
          >
            <Text style={styles.actionButtonText}>輪到你了!點擊錄音</Text>
          </TouchableOpacity>

          {/* 第二个决斗卡片 */}
          <View style={styles.duelCard}>
            <View style={styles.playerInfo}>
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>你</Text>
                <Text style={styles.playerLevel}>等級: 3</Text>
              </View>
            </View>
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            
            <View style={styles.playerInfo}>
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={24} color="#FF9500" />
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>大明</Text>
                <Text style={styles.playerLevel}>等級: 2</Text>
              </View>
            </View>
          </View>
          
          {/* 第二个决斗的状态文本 */}
          <View style={styles.waitingStatus}>
            <Text style={styles.waitingText}>等待對方回合...</Text>
          </View>
        </View>

        {/* 排行榜 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>排行榜</Text>
          
          <View style={styles.leaderboardCard}>
            <View style={styles.leaderboardIcon}>
              <Ionicons name="trophy" size={40} color="#FF3B30" />
            </View>
            <Text style={styles.leaderboardText}>排行榜</Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部导航 */}
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
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
  },
  startDuelButton: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  startDuelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  duelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  playerInfo: {
    alignItems: 'center',
    flex: 1,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerDetails: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  playerLevel: {
    fontSize: 14,
    color: '#666666',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  actionButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  waitingStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waitingText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  leaderboardIcon: {
    marginBottom: 15,
  },
  leaderboardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
    backgroundColor: '#FFD700',
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
    color: '#333333',
    fontWeight: '700',
  },
});
