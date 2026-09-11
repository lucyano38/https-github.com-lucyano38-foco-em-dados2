export const MASTER_EMAIL = 'lucyano.pci@gmail.com';

export function getCurrentUserEmail(): string {
  if (typeof window === 'undefined') return MASTER_EMAIL;
  return localStorage.getItem('foco_em_dados_user_email') || MASTER_EMAIL;
}

export function isMasterUser(email?: string | null): boolean {
  if (!email) return true; // Fallback para desenvolvimento
  return email === MASTER_EMAIL;
}
