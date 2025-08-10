import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import "@/global.css";
import { ThemedText, ThemedTextType } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { useScreenDimensions } from "@/hooks/useScreenDimensions";
import { fetchLibraryItems } from "@/utils/jellyfin";

type Item = {
  Name?: string;
  Id?: string;
};

export default function LibraryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useScreenDimensions();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const tileSize = useMemo(() => {
    const columns =
      width >= 2200 ? 7 : width >= 1600 ? 6 : width >= 1200 ? 5 : 4;
    const gap = 24;
    const totalGap = gap * (columns - 1);
    const size = Math.max(220, Math.floor((width - totalGap - 160) / columns));
    return { size, gap };
  }, [width]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchLibraryItems(String(id));
      setItems(list as Item[]);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? "Failed to load library items");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View className="flex-1 bg-[--color-background]">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator
        contentContainerClassName="px-[6vh] pt-[6vh] pb-[10vh] gap-[3vh]"
      >
        <View className="flex-row items-center justify-between">
          <ThemedText type={ThemedTextType.title}>Library</ThemedText>
          <View className="flex-row gap-[2vh]">
            <ThemedButton onPress={() => router.back()}>Back</ThemedButton>
            <ThemedButton onPress={load}>
              {loading ? "Refreshing…" : "Refresh"}
            </ThemedButton>
          </View>
        </View>

        {error ? (
          <ThemedText className="text-red-400">{error}</ThemedText>
        ) : null}

        <View style={{ gap: tileSize.gap }} className="flex-row flex-wrap">
          {items.map((it) => (
            <Pressable
              key={it.Id ?? it.Name}
              onPress={() => {}}
              tvParallaxProperties={{ enabled: false }}
              style={{
                width: tileSize.size,
                height: Math.floor(tileSize.size * 1.4),
              }}
              className={`rounded-[2vh] bg-[--color-background-elevated] border-[0.25vh] border-[--color-border] justify-end items-stretch transition focus:bg-[--color-background-press] hover:bg-[--color-background-press] active:bg-[--color-background-press]`}
            >
              <View className="p-[2vh]">
                <ThemedText numberOfLines={2}>
                  {it.Name ?? "Untitled"}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
