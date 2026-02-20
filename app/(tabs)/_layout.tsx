import { Tabs } from "expo-router";
import { BookOpen, Trophy, Bookmark, Brain } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
          ...(Platform.OS === "web" ? { height: 60 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Konular",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Çalışma",
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "İlerleme",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Kaydedilenler",
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
