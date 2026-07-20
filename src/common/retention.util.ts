export const FREE_TIER_RETENTION_DAYS = 30;

export type UserTier = 'free' | 'pro' | 'team' | 'enterprise';

export function getRetentionCutoff(tier: UserTier): Date | null {
  if (tier === 'free') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - FREE_TIER_RETENTION_DAYS);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  }
  return null;
}

export function mergeOccurredAtGte(
  existing: Date | undefined,
  cutoff: Date,
): Date {
  if (!existing) return cutoff;
  return existing.getTime() > cutoff.getTime() ? existing : cutoff;
}
