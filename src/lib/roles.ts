export const MASTER_EMAIL = 'lucyano.pci@gmail.com';

export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return MASTER_EMAIL;
  return localStorage.getItem('foco_em_dados_user_email') || MASTER_EMAIL;
}

export function hasProAccess(email?: string | null, isPro: boolean = false): boolean {
  if (email === MASTER_EMAIL) return true;
  return isPro;
}
