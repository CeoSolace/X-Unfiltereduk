// src/components/profile/VerifiedBadge.tsx
import { Tooltip } from '@headlessui/react';

export function VerifiedBadge({
  verified,
  isOrganisation,
}: {
  verified: boolean;
  isOrganisation: boolean;
}) {
  if (!verified) return null;

  const isOrg = isOrganisation;
  const color = isOrg ? 'text-gray-600' : 'text-blue-500';
  const label = isOrg ? 'Verified Organisation' : 'Verified';

  return (
    <Tooltip as="span" className="ml-1">
      <Tooltip.Button className="focus:outline-none">
        <span className={`inline-block w-4 h-4 ${color}`}>
          ✓
        </span>
      </Tooltip.Button>
      <Tooltip.Panel className="z-10 px-2 py-1 text-xs font-medium text-white bg-black rounded">
        {label}
      </Tooltip.Panel>
    </Tooltip>
  );
}
