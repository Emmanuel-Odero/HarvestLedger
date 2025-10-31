'use client'

import { useSearchParams } from 'next/navigation'
import ProgressiveAuthForm from '@/components/ProgressiveAuthForm'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <ProgressiveAuthForm redirectUrl={redirectUrl || undefined} />
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your wallet signature serves as your digital identity verification.
          </p>
        </div>
      </div>
    </div>
  )
}