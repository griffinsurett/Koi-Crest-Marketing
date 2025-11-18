// src/components/preferences/consent/OptOutButton.tsx
/**
 * CCPA Opt-Out Button
 */

import { useState } from 'react';
import { optOutOfSale } from '@/utils/consent/consent';
import Button from '@/components/Button/Button';

export default function OptOutButton() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleOptOut = () => {
    optOutOfSale();
    setShowConfirmation(true);
    setTimeout(() => window.location.reload(), 1500);
  };

  if (showConfirmation) {
    return (
      <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
        <p className="font-bold text-green-900 text-lg">✅ Success!</p>
        <p className="text-green-800 text-sm mt-2">
          You've opted out. Non-essential cookies disabled. Reloading...
        </p>
      </div>
    );
  }

  return (
    <Button
      variant='primary'
      onClick={handleOptOut}
      type="button"
    >
      🚫 Opt Out of Data Sharing
    </Button>
  );
}