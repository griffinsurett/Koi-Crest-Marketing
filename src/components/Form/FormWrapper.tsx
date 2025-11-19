// src/components/Form/FormWrapper.tsx
/**
 * React Form Wrapper - HTML5 Validation Only
 * Handles submission logic and state management
 * Uses native browser validation - no dependencies!
 * 
 * Uses internal message components for clean code organization
 */

import { useState, Children, isValidElement, type FormEvent, type ReactNode } from 'react';
import SuccessMessage from './messages/SuccessMessage';
import ErrorMessage from './messages/ErrorMessage';
import LoadingMessage from './messages/LoadingMessage';

export interface FormWrapperProps {
  children: ReactNode;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  resetOnSuccess?: boolean;
  className?: string;
  
  // Callbacks
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function FormWrapper({
  children,
  onSubmit,
  successMessage = 'Form submitted successfully!',
  errorMessage = 'An error occurred. Please try again.',
  loadingMessage = 'Submitting your form...',
  resetOnSuccess = false,
  className = '',
  onSuccess,
  onError,
}: FormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Detect if this is a multi-step form by checking for FormStep children
  const childrenArray = Children.toArray(children);
  const formSteps = childrenArray.filter(
    (child) => isValidElement(child) && (child.type as any).displayName === 'FormStep'
  );
  const isMultiStep = formSteps.length > 0;
  const totalSteps = isMultiStep ? formSteps.length : 1;

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    
    // Use HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity(); // Show native browser validation messages
      return;
    }

    const formData = new FormData(form);

    // Submit
    try {
      setIsSubmitting(true);
      setStatus('submitting');
      setMessage(null);

      // Convert FormData to object
      const data: Record<string, any> = {};
      formData.forEach((value, key) => {
        // Handle checkboxes
        if (formData.getAll(key).length > 1) {
          // Multiple values (checkboxes with same name)
          data[key] = formData.getAll(key);
        } else if (form.querySelector(`[name="${key}"][type="checkbox"]`)) {
          // Single checkbox
          data[key] = value === 'on';
        } else {
          data[key] = value;
        }
      });

      await onSubmit(data);
      
      setStatus('success');
      setMessage(successMessage);
      
      if (resetOnSuccess) {
        form.reset();
        setCurrentStep(0); // Reset to first step if multi-step
      }
      
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      const errMsg = err instanceof Error ? err.message : errorMessage;
      setMessage(errMsg);
      onError?.(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multi-step navigation
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Dismiss message
  const dismissMessage = () => {
    setMessage(null);
    setStatus('idle');
  };

  // Render children based on mode
  const renderContent = () => {
    if (isMultiStep) {
      // Multi-step: only show current step
      return formSteps[currentStep];
    } else {
      // Single-step: show all children
      return children;
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={className}
      noValidate={false} // Allow HTML5 validation
    >
      {/* Status Messages - Using message components */}
      {status === 'submitting' && (
        <LoadingMessage>{loadingMessage}</LoadingMessage>
      )}
      
      {status === 'success' && message && (
        <SuccessMessage onDismiss={dismissMessage}>
          {message}
        </SuccessMessage>
      )}
      
      {status === 'error' && message && (
        <ErrorMessage onDismiss={dismissMessage}>
          {message}
        </ErrorMessage>
      )}

      {/* Render content */}
      {renderContent()}

      {/* Multi-step navigation */}
      {isMultiStep && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={previousStep}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
          ) : (
            <div /> // Spacer
          )}
          
          <div className="text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </div>
          
          {currentStep < totalSteps - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      )}
    </form>
  );
}