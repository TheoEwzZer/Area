import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Workflow, Plus, Link, Moon, Sun } from 'lucide-react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/ThemeContext';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { theme, toggleTheme } = useTheme();
  const textColor = Colors[theme].text;
  const backgroundColor = Colors[theme].background;
  const borderColor = Colors[theme].tint;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }]}>
        <ThemedText type="title" style={[styles.headerText, { color: textColor }]}>
          AREA
        </ThemedText>
        <Pressable onPress={toggleTheme} style={[styles.pressable, { borderColor }]}>
          {theme === 'light' ? <Moon stroke={textColor} /> : <Sun stroke={textColor} />}
        </Pressable>
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
  },
});