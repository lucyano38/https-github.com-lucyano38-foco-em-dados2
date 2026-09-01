export const MASTER_EMAILS = [
  'lucyano.pci@gmail.com',
  'atendimento@focoemdados.com.br'
];

export const isMasterAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  return MASTER_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
};
