import { useQuery } from '@tanstack/react-query'
import { settingsService, StoreSettings } from '@/services/settingsService'

const DEFAULT_SETTINGS: StoreSettings = {
  free_shipping_enabled: 'true',
  free_shipping_threshold: '999',
  return_days: '7',
  return_policy_text: '7 Days Easy Returns',
  cod_enabled: 'false',
  cod_charges: '50',
  shipping_charges: '99',
  estimated_delivery_days: '5-7',
  support_email: 'jaaistore1212@gmail.com',
  support_phone: '',
  instagram_handle: '@jaai_candle_studio',
  announcement_text: '',
  announcement_enabled: 'false',
  feature_hamper_public: 'false',
  feature_custom_candle: 'false',
  feature_two_stores_section: 'false',
}

export function useStoreSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: settingsService.getPublicSettings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const getValue = (key: keyof StoreSettings): string => {
    return settings?.[key] ?? DEFAULT_SETTINGS[key]
  }

  const getBoolValue = (key: keyof StoreSettings): boolean => {
    const value = getValue(key)
    return value === 'true'
  }

  const getNumValue = (key: keyof StoreSettings): number => {
    return parseInt(getValue(key), 10) || 0
  }

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    isLoading,
    getValue,
    getBoolValue,
    getNumValue,
    // Convenience getters
    freeShippingEnabled: getBoolValue('free_shipping_enabled'),
    freeShippingThreshold: getNumValue('free_shipping_threshold'),
    returnDays: getNumValue('return_days'),
    returnPolicyText: getValue('return_policy_text'),
    shippingCharges: getNumValue('shipping_charges'),
    codEnabled: getBoolValue('cod_enabled'),
    codCharges: getNumValue('cod_charges'),
    estimatedDeliveryDays: getValue('estimated_delivery_days'),
    supportEmail: getValue('support_email'),
    instagramHandle: getValue('instagram_handle'),
    announcementText: getValue('announcement_text'),
    announcementEnabled: getBoolValue('announcement_enabled'),
    featureHamperPublic: getBoolValue('feature_hamper_public'),
    featureCustomCandle: getBoolValue('feature_custom_candle'),
    featureTwoStoresSection: getBoolValue('feature_two_stores_section'),
  }
}
