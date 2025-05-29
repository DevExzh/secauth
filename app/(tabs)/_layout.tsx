import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLanguage } from '@/hooks/useLanguage';
import { Tabs } from 'expo-router';
import { Home, Plus, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StatusBar, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const { t } = useLanguage();

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 90 : 80,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation.home'),
            tabBarIcon: ({ color, focused }) => (
              <Home size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 20 : 10,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              }}>
                <Plus size={28} color={colors.background} />
              </View>
            ),
            tabBarButton: (props) => (
              <View style={{ flex: 1, alignItems: 'center' }}>
                {props.children}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('navigation.profile'),
            tabBarIcon: ({ color, focused }) => (
              <User size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
