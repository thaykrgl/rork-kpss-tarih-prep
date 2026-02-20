import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { PremiumPlan } from '@/types';

const PREMIUM_KEY = 'kpss_premium_status';

export const premiumPlans: PremiumPlan[] = [
  {
    id: 'monthly',
    title: 'Aylık',
    price: '₺49,99',
    period: '/ay',
  },
  {
    id: 'yearly',
    title: 'Yıllık',
    price: '₺299,99',
    period: '/yıl',
    badge: 'En Popüler',
    savings: '%50 tasarruf',
  },
  {
    id: 'lifetime',
    title: 'Ömür Boyu',
    price: '₺499,99',
    period: 'tek seferlik',
    savings: 'Sınırsız erişim',
  },
];

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const premiumQuery = useQuery({
    queryKey: ['premiumStatus'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PREMIUM_KEY);
      return stored === 'true';
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (planId: string) => {
      console.log('[Premium] Purchasing plan:', planId);
      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
      return true;
    },
    onSuccess: () => {
      setIsPremium(true);
      queryClient.invalidateQueries({ queryKey: ['premiumStatus'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('[Premium] Restoring purchases');
      const stored = await AsyncStorage.getItem(PREMIUM_KEY);
      return stored === 'true';
    },
    onSuccess: (result) => {
      setIsPremium(result);
    },
  });

  useEffect(() => {
    if (premiumQuery.data !== undefined) {
      setIsPremium(premiumQuery.data);
    }
  }, [premiumQuery.data]);

  const purchasePlan = useCallback((planId: string) => {
    purchaseMutation.mutate(planId);
  }, [purchaseMutation]);

  const restorePurchases = useCallback(() => {
    restoreMutation.mutate();
  }, [restoreMutation]);

  const canAccessTopic = useCallback((topicIsPremium: boolean) => {
    if (!topicIsPremium) return true;
    return isPremium;
  }, [isPremium]);

  return {
    isPremium,
    isLoading: premiumQuery.isLoading,
    purchasePlan,
    restorePurchases,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    canAccessTopic,
    plans: premiumPlans,
  };
});
