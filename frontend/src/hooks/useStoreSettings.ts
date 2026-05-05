import { useQuery } from '@tanstack/react-query'
import { settingsService, StoreSettings } from '@/services/settingsService'

/** Retired values still returned by some APIs / DB rows — show current contact instead */
const LEGACY_SUPPORT_EMAILS = new Set(['jaeestudio12@gmail.com', 'jaaistudio12@gmail.com'])
const LEGACY_INSTAGRAM_HANDLES = new Set(['@jaai.studio', '@jaee.studio'])

const DEFAULT_SETTINGS: StoreSettings = {
  free_shipping_enabled: 'true',
  free_shipping_threshold: '1499',
  return_days: '7',
  return_policy_text: '7 Days Easy Returns',
  cod_enabled: 'false',
  cod_charges: '50',
  shipping_charges: '99',
  estimated_delivery_days: '5-7',
  support_email: 'jaaistore1212@gmail.com',
  support_phone: '',
  /** E.164 digits without +; used only for wa.me — not rendered in the UI */
  whatsapp_phone: '919404380308',
  instagram_handle: '@jaai_candle_studio',
  announcement_text: '',
  announcement_enabled: 'false',
  announcement_bar_slide_1: 'Use code JAAI10 for 10% off on your first order',
  announcement_bar_slide_2: 'Free shipping on orders above 1499 Rs',
  feature_hamper_public: 'false',
  feature_custom_candle: 'false',
  feature_two_stores_section: 'false',
  homepage_hero_candles_image_url: '',
  homepage_hero_hampers_image_url: '',
  homepage_story_image_url: '',
  shop_candles_header_image_url: '',
  shop_candles_header_title: '',
  sale_page_header_image_url: '',
  sale_page_header_title: '',
  sale_page_header_subtitle: '',
}

export function useStoreSettings() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: settingsService.getPublicSettings,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const getValue = (key: keyof StoreSettings): string => {
    const raw = settings?.[key] ?? DEFAULT_SETTINGS[key]
    if (key === 'support_email' && LEGACY_SUPPORT_EMAILS.has(raw.trim())) {
      return DEFAULT_SETTINGS.support_email
    }
    if (key === 'instagram_handle' && LEGACY_INSTAGRAM_HANDLES.has(raw.trim())) {
      return DEFAULT_SETTINGS.instagram_handle
    }
    return raw
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
    announcementBarSlide1:
      getValue('announcement_bar_slide_1' as keyof StoreSettings).trim() ||
      DEFAULT_SETTINGS.announcement_bar_slide_1,
    announcementBarSlide2:
      getValue('announcement_bar_slide_2' as keyof StoreSettings).trim() ||
      DEFAULT_SETTINGS.announcement_bar_slide_2,
    /** Digits only, suitable for https://wa.me/{digits} — never show as visible text */
    whatsappPhoneDigits: (() => {
      const raw = getValue('whatsapp_phone').replace(/\D/g, '')
      return raw.length >= 10 ? raw : '919404380308'
    })(),
  }
}
