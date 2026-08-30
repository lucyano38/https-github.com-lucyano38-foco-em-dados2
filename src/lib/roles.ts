export type UserRole = 'user' | 'admin' | 'master';

export const MASTER_EMAIL = 'lucyano.pci@gmail.com';

export async function getCurrentUserEmail(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('foco_em_dados_user_email');
}

export async function getUserRole(): Promise<UserRole> {
  const email = await getCurrentUserEmail();
  if (!email) return 'user';
  if (email.toLowerCase() === MASTER_EMAIL.toLowerCase()) return 'master';
  return 'user';
}

export async function isMaster(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'master';
}
