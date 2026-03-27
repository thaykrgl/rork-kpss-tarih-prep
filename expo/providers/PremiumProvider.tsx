import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

const ENTITLEMENT_ID = 'premium';

let Purchases: any = null;
let LOG_LEVEL: any = null;
let rcConfigured = false;

try {
  const mod = require('react-native-purchases');
  Purchases = mod.default;
  LOG_LEVEL = mod.LOG_LEVEL;
} catch (e) {
  console.warn('[Premium] react-native-purchases not available (Expo Go?)');
}

function getRCToken() {
  if (__DEV__ || Platform.OS === 'web')
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  }) ?? '';
}

if (Purchases) {
  try {
    const token = getRCToken();
    if (token) {
      Purchases.configure({ apiKey: token });
      if (__DEV__ && LOG_LEVEL) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      rcConfigured = true;
      console.log('[Premium] RevenueCat configured successfully');
    } else {
      console.warn('[Premium] No RevenueCat API key found');
    }
  } catch (e) {
    console.error('[Premium] Failed to configure RevenueCat:', e);
  }
}

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const customerInfoQuery = useQuery({
    queryKey: ['rc-customer-info'],
    queryFn: async () => {
      if (!rcConfigured || !Purchases) return null;
      console.log('[Premium] Fetching customer info...');
      const info = await Purchases.getCustomerInfo();
      console.log('[Premium] Customer info:', JSON.stringify(info.entitlements.active));
      return info;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const offeringsQuery = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: async () => {
      if (!rcConfigured || !Purchases) return null;
      console.log('[Premium] Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('[Premium] Current offering:', offerings.current?.identifier);
      console.log('[Premium] Packages:', offerings.current?.availablePackages?.length);
      if (offerings.current?.availablePackages) {
        offerings.current.availablePackages.forEach((pkg: any) => {
          console.log('[Premium] Package:', pkg.identifier, 'Price:', pkg.product?.priceString);
        });
      }
      return offerings;
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: any) => {
      if (!Purchases) throw new Error('Satın alma bu ortamda desteklenmiyor');
      console.log('[Premium] Purchasing package:', pkg.identifier);
      const result = await Purchases.purchasePackage(pkg);
      console.log('[Premium] Purchase result:', JSON.stringify(result.customerInfo.entitlements.active));
      return result.customerInfo;
    },
    onSuccess: (info: any) => {
      const hasPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(hasPremium);
      queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      console.log('[Premium] Purchase success, isPremium:', hasPremium);
    },
    onError: (error: any) => {
      console.error('[Premium] Purchase error:', error?.message ?? error);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!Purchases) throw new Error('Geri yükleme bu ortamda desteklenmiyor');
      console.log('[Premium] Restoring purchases...');
      const info = await Purchases.restorePurchases();
      console.log('[Premium] Restore result:', JSON.stringify(info.entitlements.active));
      return info;
    },
    onSuccess: (info: any) => {
      const hasPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(hasPremium);
      queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      console.log('[Premium] Restore success, isPremium:', hasPremium);
    },
    onError: (error: any) => {
      console.error('[Premium] Restore error:', error?.message ?? error);
    },
  });

  useEffect(() => {
    if (customerInfoQuery.data) {
      const hasPremium =
        customerInfoQuery.data.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(hasPremium);
      console.log('[Premium] Updated isPremium from query:', hasPremium);
    }
  }, [customerInfoQuery.data]);

  const currentOffering = offeringsQuery.data?.current ?? null;
  const lifetimePackage = currentOffering?.availablePackages?.[0] ?? null;

  const purchasePackage = useCallback(
    (pkg: any) => {
      purchaseMutation.mutate(pkg);
    },
    [purchaseMutation],
  );

  const restorePurchases = useCallback(() => {
    restoreMutation.mutate();
  }, [restoreMutation]);

  const canAccessTopic = useCallback(
    (topicIsPremium: boolean) => {
      if (!topicIsPremium) return true;
      return isPremium;
    },
    [isPremium],
  );

  return {
    isPremium,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    currentOffering,
    lifetimePackage,
    purchasePackage,
    restorePurchases,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    purchaseError: purchaseMutation.error,
    restoreError: restoreMutation.error,
    canAccessTopic,
  };
});
