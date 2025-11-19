// src/components/Form/messages/LoadingMessage.tsx
/**
 * LoadingMessage Component
 * Internal component used by FormWrapper
 */

import FormMessage from './FormMessage';
import type { ReactNode } from 'react';

interface LoadingMessageProps {
  children: ReactNode;
}

export default function LoadingMessage({
  children,
}: LoadingMessageProps) {
  return (
    <FormMessage type="loading">
      {children}
    </FormMessage>
  );
}