import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

export default function NotFoundScreen() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen options={{ title: "Sayfa Bulunamadı" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Bu sayfa mevcut değil.</Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Ana sayfaya dön</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
