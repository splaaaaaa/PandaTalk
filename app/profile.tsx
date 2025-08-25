import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('profile');

  const handleTabPress = (tabName: string) => {
    if (tabName === 'free-practice') {
      router.push('/(tabs)');
    } else if (tabName === 'pk-competition') {
      router.push('/pk-arena');
    } else {
      setActiveTab(tabName);
    }
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleSettings = () => {
    console.log('设置');
  };

  const handleMoreAchievements = () => {
    console.log('查看更多成就');
  };

  const handleMoreShop = () => {
    console.log('查看更多商品');
  };

  const handleDebugAPI = () => {
    router.push('/debug-api');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 用户档案头部 */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>😊</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>熊貓小P</Text>
              <Text style={styles.userId}>ID: 123455678</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton} 
              activeOpacity={0.8}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>編輯資料</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsButton} 
              activeOpacity={0.8}
              onPress={handleSettings}
            >
              <Ionicons name="settings" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 统计信息 */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>30</Text>
            <Text style={styles.statLabel}>練習天數</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2,800</Text>
            <Text style={styles.statLabel}>金幣</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>PK勝率</Text>
          </View>
        </View>

        {/* 成就记录 */}
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>成就記錄</Text>
            <TouchableOpacity onPress={handleMoreAchievements}>
              <Text style={styles.moreText}>更多</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Ionicons name="rocket" size={30} color="#FF6B6B" />
              </View>
              <Text style={styles.achievementTitle}>發音進步之星</Text>
              <Text style={styles.achievementDescription}>連續30天完成發音練習</Text>
            </View>
            
            <View style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Ionicons name="trophy" size={30} color="#FFD700" />
              </View>
              <Text style={styles.achievementTitle}>PK賽季冠軍</Text>
              <Text style={styles.achievementDescription}>在一個賽季中獲得最高積分</Text>
            </View>
            
            <View style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Ionicons name="medal" size={30} color="#4ECDC4" />
              </View>
              <Text style={styles.achievementTitle}>繞口令達人</Text>
              <Text style={styles.achievementDescription}>完成100個繞口令挑戰</Text>
            </View>
          </View>
        </View>

        {/* 金币商城 */}
        <View style={styles.shopSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>金幣商城</Text>
            <TouchableOpacity onPress={handleMoreShop}>
              <Text style={styles.moreText}>更多</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.shopItems}>
            <View style={styles.shopItem}>
              <View style={styles.shopItemLeft}>
                <View style={styles.shopItemIcon}>
                  <Ionicons name="diamond" size={24} color="#007AFF" />
                </View>
                <View style={styles.shopItemInfo}>
                  <Text style={styles.shopItemTitle}>發音糾錯次數</Text>
                  <Text style={styles.shopItemDescription}>購買額外的發音糾錯機會</Text>
                </View>
              </View>
              <Text style={styles.shopItemPrice}>x5</Text>
            </View>
            
            <View style={styles.shopItem}>
              <View style={styles.shopItemLeft}>
                <View style={styles.shopItemIcon}>
                  <Ionicons name="flower" size={24} color="#FF69B4" />
                </View>
                <View style={styles.shopItemInfo}>
                  <Text style={styles.shopItemTitle}>專屬頭像框</Text>
                  <Text style={styles.shopItemDescription}>解鎖個性化頭像裝飾</Text>
                </View>
              </View>
              <Text style={styles.shopItemStatus}>已擁有</Text>
            </View>
          </View>
        </View>

        {/* 调试工具 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>调试工具</Text>
          <TouchableOpacity 
            style={styles.debugButton} 
            activeOpacity={0.8}
            onPress={handleDebugAPI}
          >
            <Ionicons name="bug" size={20} color="#FFFFFF" />
            <Text style={styles.debugButtonText}>API调试</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingTop: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  achievementsSection: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  moreText: {
    fontSize: 14,
    color: '#666666',
  },
  achievementsGrid: {
    gap: 15,
  },
  achievementCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    marginRight: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  shopSection: {
    paddingVertical: 25,
  },
  shopItems: {
    gap: 15,
  },
  shopItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopItemIcon: {
    marginRight: 15,
  },
  shopItemInfo: {
    flex: 1,
  },
  shopItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  shopItemDescription: {
    fontSize: 14,
    color: '#666666',
  },
  shopItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  shopItemStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  section: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  debugButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
