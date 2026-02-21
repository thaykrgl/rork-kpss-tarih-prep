import React, { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { useStudy } from './StudyProvider';
import { light, dark } from '@/constants/colors';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const { progress } = useStudy();
  const systemColorScheme = useColorScheme();

  const theme = useMemo(() => {
    const activeTheme = progress.theme || 'system';
    
    if (activeTheme === 'system') {
      return systemColorScheme === 'dark' ? dark : light;
    }
    
    return activeTheme === 'dark' ? dark : light;
  }, [progress.theme, systemColorScheme]);

  const isDark = useMemo(() => {
    const activeTheme = progress.theme || 'system';
    if (activeTheme === 'system') {
      return systemColorScheme === 'dark';
    }
    return activeTheme === 'dark';
  }, [progress.theme, systemColorScheme]);

  return {
    colors: theme,
    isDark,
    themeMode: progress.theme || 'system',
  };
});
