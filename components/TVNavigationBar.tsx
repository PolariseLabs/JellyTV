import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

import '@/global.css';
import { ThemedButton, ThemedButtonBehavior } from './ThemedButton';
import { ThemedText, ThemedTextType } from './ThemedText';

export function TVNavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  const items = useMemo(
    () => [
      { label: 'Home', path: '/' },
      { label: 'Sign in', path: '/login' },
      { label: 'About', path: '/about' },
    ],
    []
  );

  if (!Platform.isTV) return null;

  return (
    <View
      className="bg-[--color-background-elevated] border-b-[0.25vh] border-[--color-border] px-[6vh] py-[3vh]"
      accessibilityRole="header"
    >
      <View className="flex-row items-center justify-between">
        <ThemedText type={ThemedTextType.title}>Jellyfin</ThemedText>
        <View className="flex-row gap-[3vh]">
          {items.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <ThemedButton
                key={item.path}
                onPress={() => router.push(item.path as any)}
                focusHoverBehavior={ThemedButtonBehavior.borderOnFocusHover}
                className={
                  'px-[2vh] py-[1vh] rounded-[2vh] ' +
                  (isActive ? 'border-[--color-text]' : '')
                }
                textType={ThemedTextType.link}
                textClassName={isActive ? 'opacity-100' : 'opacity-80'}
                hasTVPreferredFocus={pathname === '/' && index === 0}
              >
                {item.label}
              </ThemedButton>
            );
          })}
        </View>
      </View>
    </View>
  );
}