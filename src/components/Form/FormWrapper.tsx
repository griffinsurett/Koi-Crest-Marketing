// src/components/Form/FormWrapper.tsx
/**
 * React Form Wrapper - HTML5 Validation Only
 * Handles submission logic and state management
 * Uses native browser validation - no dependencies!
 */

import { useState, type FormEvent, type ReactNode } from 'react';

export interface FormWrapperProps {
  children: ReactNode | ((formState: FormState) => ReactNode);
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  successMessage?: string | ReactNode;
  errorMessage?: string | ReactNode;
  resetOnSuccess?: boolean;
  className?: string;
  
  // Multi-step support
  isMultiStep?: boolean;
  steps?: ReactNode[];
  
  // Callbacks
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface FormState {
  isSubmitting: boolean;
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
  currentStep: number;
  totalSteps: number;
}

export default function FormWrapper({
  children,
  onSubmit,
  successMessage = 'Form submitted successfully!',
  errorMessage = 'An error occurred. Please try again.',
  resetOnSuccess = false,
  className = '',
  isMultiStep = false,
  steps = [],
  onSuccess,
  onError,
}: FormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = isMultiStep ? steps.length : 1;

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
      setMessage(typeof successMessage === 'string' ? successMessage : null);
      
      if (resetOnSuccess) {
        form.reset();
        setCurrentStep(0); // Reset to first step if multi-step
      }
      
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      const errMsg = err instanceof Error ? err.message : typeof errorMessage === 'string' ? errorMessage : 'An error occurred';
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

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const formState: FormState = {
    isSubmitting,
    status,
    message,
    currentStep,
    totalSteps,
  };

  // Render children as-is (no need to inject errors since HTML5 handles it)
  const renderChildren = typeof children === 'function' ? children(formState) : children;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={className}
      noValidate={false} // Allow HTML5 validation
    >
      {/* Status Messages */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            status === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          role="alert"
        >
          {message}
        </div>
      )}
      
      {/* Success message from prop */}
      {status === 'success' && typeof successMessage !== 'string' && successMessage}

      {/* Render children */}
      {isMultiStep ? (
        <>
          {steps[currentStep]}
          
          {/* Multi-step navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={previousStep}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            )}
            
            {currentStep === 0 && <div />} {/* Spacer */}
            
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
        </>
      ) : (
        renderChildren
      )}
    </form>
  );
}