// src/components/Form/messages/ErrorMessage.tsx
/**
 * ErrorMessage Component
 * Internal component used by FormWrapper
 */

import FormMessage from './FormMessage';
import type { ReactNode } from 'react';

interface ErrorMessageProps {
  children: ReactNode;
  onDismiss?: () => void;
}

export default function ErrorMessage({
  children,
  onDismiss,
}: ErrorMessageProps) {
  return (
    <FormMessage type="error" onDismiss={onDismiss}>
      {children}
    </FormMessage>
  );
}