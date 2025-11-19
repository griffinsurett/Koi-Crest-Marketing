// src/components/Form/types.ts
/**
 * Form System Type Definitions - Simplified
 */

import type { ReactNode } from 'react';

// Basic form step props
export interface FormStepProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}