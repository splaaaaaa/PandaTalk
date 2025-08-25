import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const [nickname, setNickname] = useState('熊貓JP');
  const [selectedFrame, setSelectedFrame] = useState(0);

  const handleSave = () => {
    console.log('保存资料');
    router.back();
  };

  const handleChangeAvatar = () => {
    console.log('更换头像');
  };

  const avatarFrames = [
    { id: 0, name: '使用中', color: '#FFD700', borderColor: '#FFD700', isSelected: true },
    { id: 1, name: '粉色框', color: '#FFC0CB', borderColor: '#FF69B4' },
    { id: 2, name: '藍色框', color: '#ADD8E6', borderColor: '#87CEEB' },
    { id: 3, name: '方形框', color: '#DDA0DD', borderColor: '#9370DB' },
    { id: 4, name: '鑽石框', color: '#FFD700', borderColor: '#FFD700' },
    { id: 5, name: '星形框', color: '#FFC0CB', borderColor: '#FF69B4' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 顶部导航栏 */}
      <View style={styles.topNav}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        
        <Text style={styles.navTitle}>編輯資料</Text>
        
        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 头像设置 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>頭像設置</Text>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <View style={styles.avatarFigure}>
                  <View style={styles.avatarHead} />
                  <View style={styles.avatarBody} />
                </View>
                <View style={styles.avatarDots}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.changeAvatarButton} 
            activeOpacity={0.8}
            onPress={handleChangeAvatar}
          >
            <Text style={styles.changeAvatarText}>更換頭像</Text>
          </TouchableOpacity>
        </View>

        {/* 昵称 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>暱稱</Text>
            <TextInput
              style={styles.nicknameInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="輸入暱稱"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* 专属头像框 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>專屬頭像框</Text>
          
          <View style={styles.framesGrid}>
            {avatarFrames.map((frame, index) => (
              <TouchableOpacity
                key={frame.id}
                style={[
                  styles.frameOption,
                  frame.isSelected && styles.selectedFrame
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedFrame(frame.id)}
              >
                <View style={[styles.frameAvatar, { borderColor: frame.borderColor }]}>
                  <View style={styles.frameAvatarFigure}>
                    <View style={styles.frameAvatarHead} />
                    <View style={styles.frameAvatarBody} />
                  </View>
                  {frame.id === 4 && (
                    <View style={styles.crownIcon}>
                      <Ionicons name="diamond" size={16} color="#666666" />
                    </View>
                  )}
                  {frame.id === 5 && (
                    <View style={styles.starIcon}>
                      <Ionicons name="star" size={16} color="#666666" />
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.frameName,
                  frame.isSelected && styles.selectedFrameName
                ]}>
                  {frame.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 其他设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他設置</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>用戶ID</Text>
            <Text style={styles.infoValue}>12345678</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>註冊時間</Text>
            <Text style={styles.infoValue}>2024-01-15</Text>
          </View>
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
  saveButton: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonText: {
    fontSize: 16,
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
  section: {
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    position: 'relative',
  },
  avatarFigure: {
    alignItems: 'center',
  },
  avatarHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF8C00',
    marginBottom: 5,
  },
  avatarBody: {
    width: 16,
    height: 25,
    borderRadius: 8,
    backgroundColor: '#FF8C00',
  },
  avatarDots: {
    position: 'absolute',
    top: 15,
    flexDirection: 'row',
    width: 50,
    justifyContent: 'space-between',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  changeAvatarButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  changeAvatarText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  nicknameInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000000',
    minWidth: 120,
    textAlign: 'center',
  },
  framesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  frameOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedFrame: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 10,
  },
  frameAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
    position: 'relative',
  },
  frameAvatarFigure: {
    alignItems: 'center',
  },
  frameAvatarHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF8C00',
    marginBottom: 3,
  },
  frameAvatarBody: {
    width: 10,
    height: 15,
    borderRadius: 5,
    backgroundColor: '#FF8C00',
  },
  crownIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  starIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  frameName: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  selectedFrameName: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
});
