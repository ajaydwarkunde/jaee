import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useStoreSettings } from '@/hooks/useStoreSettings'

type Feature = 'hamper' | 'customCandle'

export default function FeatureGate({ feature, children }: { feature: Feature; children: ReactNode }) {
  const { featureHamperPublic, featureCustomCandle } = useStoreSettings()
  const allowed = feature === 'hamper' ? featureHamperPublic : featureCustomCandle
  if (!allowed) return <Navigate to="/" replace />
  return <>{children}</>
}
