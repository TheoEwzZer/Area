import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Workflow, Plus, Link, Moon, Sun, DoorOpen, List } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/ThemeContext';
import { Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();
  const textColor = Colors[theme].text;
  const backgroundColor = Colors[theme].background;
  const borderColor = Colors[theme].tint;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Rediriger l'utilisateur vers la page de connexion ou d'accueil
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <ThemedText type="title" style={[styles.headerText, { color: textColor }]}>
          AREA
        </ThemedText>
        <View style={styles.headerRight}>
          <Pressable onPress={toggleTheme} style={[styles.pressable, { borderColor }]}>
            {theme === 'light' ? <Moon stroke={textColor} /> : <Sun stroke={textColor} />}
          </Pressable>
          <Pressable onPress={handleSignOut} style={[styles.pressable, { borderColor }]}>
            <DoorOpen stroke={textColor} />
          </Pressable>
        </View>
      </View>
      <View style={[styles.headerLine, { borderColor }]} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme].tint,
          tabBarStyle: { backgroundColor },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="link"
          options={{
            title: 'Link',
            tabBarIcon: ({ color }) => (
              <Link stroke={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Create",
            tabBarIcon: ({ color }) => (
              <Plus stroke={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workflows"
          options={{
            title: 'Workflows',
            tabBarIcon: ({ color }) => (
              <Workflow stroke={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            tabBarIcon: ({ color }) => (
              <List stroke={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLine: {
    height: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  pressable: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    marginLeft: 8,
  },
});