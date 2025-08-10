import React, { useCallback, useMemo, useRef, useState } from "react";
import { Platform, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";

import "@/global.css";
import { ThemedText, ThemedTextType } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { useScreenDimensions } from "@/hooks/useScreenDimensions";
import { authenticate } from "@/utils/jellyfin";

export default function LoginScreen() {
  const router = useRouter();
  const { scale } = useScreenDimensions();
  const { colorScheme } = useColorScheme();

  const [serverUrl, setServerUrl] = useState<string>(
    "https://demo.jellyfin.org/stable"
  );
  const [username, setUsername] = useState<string>("demo");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const serverRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const inputBase = useMemo(
    () =>
      "rounded-[2vh] px-[2vh] py-[1.5vh] border-[0.25vh] text-[--color-text] border-[--color-border] bg-[--color-background-elevated] focus:border-[--color-tint]",
    []
  );

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authenticate(serverUrl.trim(), username.trim(), password);
      router.replace("/");
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }, [serverUrl, username, password, router]);

  return (
    <View className="flex-1 bg-[--color-background] items-center justify-center">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="w-[80%] max-w-[900px] gap-[2vh]">
        <ThemedText type={ThemedTextType.title} className="mb-[2vh]">
          Sign in to Jellyfin
        </ThemedText>

        <View className="gap-[1.5vh]">
          <ThemedText className="opacity-80">Server URL</ThemedText>
          <TextInput
            ref={serverRef}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="next"
            onSubmitEditing={() => usernameRef.current?.focus()}
            className={inputBase}
          />
        </View>

        <View className="gap-[1.5vh]">
          <ThemedText className="opacity-80">Username</ThemedText>
          <TextInput
            ref={usernameRef}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            className={inputBase}
          />
        </View>

        <View className="gap-[1.5vh]">
          <ThemedText className="opacity-80">Password</ThemedText>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            className={inputBase}
          />
        </View>

        {error ? (
          <ThemedText className="text-red-400 mt-[1vh]">{error}</ThemedText>
        ) : null}

        <View className="flex-row gap-[2vh] mt-[2vh]">
          <ThemedButton onPress={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </ThemedButton>
        </View>

        {Platform.isTV ? (
          <ThemedText className="opacity-70 mt-[2vh]">
            Tip: Use the remote to focus inputs and the play/OK button to edit.
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}
