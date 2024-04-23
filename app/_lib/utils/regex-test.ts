export function isAdminEmail(email: string) {
  const adminEmailRegex = /\+admin@/;
  return adminEmailRegex.test(email);
}
