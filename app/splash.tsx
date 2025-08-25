import React, { useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, SafeAreaView, Image } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    // 3秒后自动跳转到主页
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFD700" />
      
      {/* Panda Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/PandaTalk_icon.png')}
          style={styles.pandaLogo}
          resizeMode="contain"
        />
        
        {/* App 名称 */}
        <Text style={styles.appName}>PandaTalk</Text>
        <Text style={styles.appNameChinese}>普通話說</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  pandaLogo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  appNameChinese: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});
