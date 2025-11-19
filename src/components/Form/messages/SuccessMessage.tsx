// src/components/Form/messages/SuccessMessage.tsx
/**
 * SuccessMessage Component
 * Internal component used by FormWrapper
 */

import FormMessage from './FormMessage';
import type { ReactNode } from 'react';

interface SuccessMessageProps {
  children: ReactNode;
  onDismiss?: () => void;
}

export default function SuccessMessage({
  children,
  onDismiss,
}: SuccessMessageProps) {
  return (
    <FormMessage type="success" onDismiss={onDismiss}>
      {children}
    </FormMessage>
  );
}