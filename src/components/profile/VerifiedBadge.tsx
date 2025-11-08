// src/components/profile/VerifiedBadge.tsx
export function VerifiedBadge({ verified, isOrganisation }: { verified: boolean; isOrganisation: boolean }) {
  if (!verified) return null;
  const color = isOrganisation ? 'text-gray-600' : 'text-blue-500';
  const label = isOrganisation ? 'Verified Organisation' : 'Verified';
  return (
    <span className={`${color} ml-1 inline-block w-4 h-4 align-top`} title={label}>
      ✓
    </span>
  );
}
