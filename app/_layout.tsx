import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StudyProvider } from "@/providers/StudyProvider";
import { PremiumProvider } from "@/providers/PremiumProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="topic/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="quiz/[topicId]"
        options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }}
      />
      <Stack.Screen
        name="subtopic/[id]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="flashcards/[topicId]"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="wrong-answers"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="paywall"
        options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <PremiumProvider>
          <StudyProvider>
            <RootLayoutNav />
          </StudyProvider>
        </PremiumProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
