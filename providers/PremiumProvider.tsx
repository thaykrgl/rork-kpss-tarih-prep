import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';

const ENTITLEMENT_ID = 'premium';

function getRCToken() {
  if (__DEV__ || Platform.OS === 'web')
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? '';
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  }) ?? '';
}

let rcConfigured = false;
try {
  const token = getRCToken();
  if (token) {
    Purchases.configure({ apiKey: token });
    if (__DEV__) {
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

export const [PremiumProvider, usePremium] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const customerInfoQuery = useQuery({
    queryKey: ['rc-customer-info'],
    queryFn: async () => {
      if (!rcConfigured) return null;
      console.log('[Premium] Fetching customer info...');
      const info = await Purchases.getCustomerInfo();
      console.log('[Premium] Customer info:', JSON.stringify(info.entitlements.active));
      return info;
    },
    staleTime: 1000 * 60 * 5,
  });

  const offeringsQuery = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: async () => {
      if (!rcConfigured) return null;
      console.log('[Premium] Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      console.log('[Premium] Current offering:', offerings.current?.identifier);
      console.log('[Premium] Packages:', offerings.current?.availablePackages.length);
      return offerings;
    },
    staleTime: 1000 * 60 * 10,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log('[Premium] Purchasing package:', pkg.identifier);
      const result = await Purchases.purchasePackage(pkg);
      console.log('[Premium] Purchase result:', JSON.stringify(result.customerInfo.entitlements.active));
      return result.customerInfo;
    },
    onSuccess: (info: CustomerInfo) => {
      const hasPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(hasPremium);
      queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      console.log('[Premium] Purchase success, isPremium:', hasPremium);
    },
    onError: (error: Error) => {
      console.error('[Premium] Purchase error:', error.message);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log('[Premium] Restoring purchases...');
      const info = await Purchases.restorePurchases();
      console.log('[Premium] Restore result:', JSON.stringify(info.entitlements.active));
      return info;
    },
    onSuccess: (info: CustomerInfo) => {
      const hasPremium = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(hasPremium);
      queryClient.invalidateQueries({ queryKey: ['rc-customer-info'] });
      console.log('[Premium] Restore success, isPremium:', hasPremium);
    },
    onError: (error: Error) => {
      console.error('[Premium] Restore error:', error.message);
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

  const currentOffering: PurchasesOffering | null =
    offeringsQuery.data?.current ?? null;

  const lifetimePackage: PurchasesPackage | null =
    currentOffering?.availablePackages?.[0] ?? null;

  const purchasePackage = useCallback(
    (pkg: PurchasesPackage) => {
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
