import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Affiliate {
  id: string
  user_id: string
  code: string
  balance: number
  total_earned: number
  created_at: string
}

interface Referral {
  id: string
  affiliate_id: string
  referred_email: string
  status: string
  commission: number
  created_at: string
}

interface AffiliateResult {
  affiliate: Affiliate | null
  referrals: Referral[]
  copyLink: () => void
  requestPayout: (amount: number, pixKey: string) => Promise<void>
}

export function useAffiliate(): AffiliateResult {
  const { user } = useAuth()
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])

  useEffect(() => {
    if (!user) return

    async function fetchAffiliate() {
      const { data } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setAffiliate(data as Affiliate)

        const { data: refs } = await supabase
          .from('referrals')
          .select('*')
          .eq('affiliate_id', data.id)
          .order('created_at', { ascending: false })

        if (refs) setReferrals(refs as Referral[])
      }
    }

    fetchAffiliate()
  }, [user])

  function copyLink() {
    if (!affiliate) return
    const link = `${window.location.origin}/?ref=${affiliate.code}`
    navigator.clipboard.writeText(link)
  }

  async function requestPayout(amount: number, pixKey: string) {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('payout_requests').insert({
      user_id: user.id,
      affiliate_id: affiliate?.id,
      amount,
      pix_key: pixKey,
      status: 'pending',
    })

    if (error) throw error
  }

  return { affiliate, referrals, copyLink, requestPayout }
}
