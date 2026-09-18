/**
 * Regra única de visibilidade pública de imóveis.
 * Imóveis "disponivel" e "reservado" aparecem no site.
 * Imóveis "vendido" (ou qualquer outro status inativo) ficam fora das listagens públicas.
 */

export const PUBLIC_STATUSES = ["disponivel", "reservado"] as const;

export function isPubliclyVisible<T extends { status?: string | null }>(property: T): boolean {
  const status = property?.status || "disponivel";
  return (PUBLIC_STATUSES as readonly string[]).includes(status);
}

export function getVisibleProperties<T extends { status?: string | null }>(list: T[]): T[] {
  return (list || []).filter(isPubliclyVisible);
}
