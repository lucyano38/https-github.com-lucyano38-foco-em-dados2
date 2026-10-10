import { useAuth } from '../contexts/AuthContext'

export function useProfile() {
  const { user, profile, plan, loading, refreshProfile } = useAuth()

  return {
    user,
    profile,
    plan,
    loading,
    refreshProfile,
  }
}
