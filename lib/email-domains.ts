export const allowedApplicationEmailDomains = ["std.yildiz.edu.tr", "yildiz.edu.tr"];

export function isAllowedApplicationEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@").at(1);

  return Boolean(domain && allowedApplicationEmailDomains.includes(domain));
}

export function isYtuEmail(email: string) {
  return isAllowedApplicationEmail(email);
}
