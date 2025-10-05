import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Stack, useRouter } from "expo-router";

import "@/global.css";
import { ThemedText, ThemedTextType } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { useScreenDimensions } from "@/hooks/useScreenDimensions";
import { fetchLibraries } from "@/utils/jellyfin";

type LibraryItem = {
  Name?: string;
  Id?: string;
};

export default function TVHomeScreen() {
  const router = useRouter();
  const { width } = useScreenDimensions();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [libraries, setLibraries] = useState<LibraryItem[]>([]);

  const tileSize = useMemo(() => {
    const columns =
      width >= 2200 ? 6 : width >= 1600 ? 5 : width >= 1200 ? 4 : 3;
    const gap = 24;
    const totalGap = gap * (columns - 1);
    const size = Math.max(240, Math.floor((width - totalGap - 160) / columns));
    return { size, gap };
  }, [width]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLibraries();
      const items = (data?.Items ?? []) as LibraryItem[];
      setLibraries(items);
    } catch (e: any) {
      setLibraries([]);
      setError(e?.message ?? "Not signed in. Use Sign in to continue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View className="flex-1 bg-[--color-background]">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator
        contentContainerClassName="px-[6vh] pt-[4vh] pb-[10vh] gap-[3vh]"
      >
        {/* Title row hidden on tvOS, nav bar shows title */}
        {Platform.isTV ? null : (
          <View className="flex-row items-center justify-between">
            <ThemedText type={ThemedTextType.title}>Jellyfin</ThemedText>
            <View className="flex-row gap-[2vh]">
              <ThemedButton onPress={load}>
                {loading ? "Refreshing…" : "Refresh"}
              </ThemedButton>
              <ThemedButton onPress={() => router.push("/login")}>
                Sign in
              </ThemedButton>
            </View>
          </View>
        )}

        {error ? (
          <ThemedText className="text-red-400">{error}</ThemedText>
        ) : null}

        <View style={{ gap: tileSize.gap }} className="flex-row flex-wrap">
          {libraries.map((lib, idx) => (
            <Pressable
              key={lib.Id ?? lib.Name}
              onPress={() => router.push(`/library/${lib.Id}`)}
              tvParallaxProperties={{
                enabled: Platform.isTV,
                shiftDistanceX: 2.0,
                shiftDistanceY: 2.0,
                tiltAngle: 0.03,
                magnification: 1.05,
                pressMagnification: 1.02,
                pressDuration: 0.15,
                pressDelay: 0.0,
              }}
              hasTVPreferredFocus={Platform.isTV && idx === 0}
              style={{ width: tileSize.size, height: tileSize.size }}
              className={`rounded-[2vh] bg-[--color-background-elevated] border-[0.25vh] border-[--color-border] justify-center items-center transition focus:bg-[--color-background-press] hover:bg-[--color-background-press] active:bg-[--color-background-press]`}
            >
              <ThemedText className="text-center px-[2vh]">
                {lib.Name ?? "Unnamed"}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
