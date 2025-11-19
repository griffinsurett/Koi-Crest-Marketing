// src/components/Form/ReactFormEnhancer.tsx
/**
 * ReactFormEnhancer - Progressive Enhancement for Form.astro
 * 
 * Attaches to existing HTML form and adds React features:
 * - Zod validation
 * - Real-time error display
 * - AJAX submission
 * - Success/error messages
 * 
 * Works with pure Input components (no context needed)
 */
import { useEffect, useRef, useState } from "react";
import type { ZodSchema } from "zod";

interface ReactFormEnhancerProps {
  formId: string;
  validationSchema?: ZodSchema;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  successMessage?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ReactFormEnhancer({
  formId,
  validationSchema,
  onSubmit,
  validateOnBlur = true,
  validateOnChange = false,
  successMessage = "Form submitted successfully!",
  resetOnSuccess = false,
  onSuccess,
  onError,
}: ReactFormEnhancerProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) {
      console.warn(`ReactFormEnhancer: Form with id "${formId}" not found`);
      return;
    }
    formRef.current = form;

    // Validate a single field
    const validateField = async (name: string, value: any): Promise<string | null> => {
      if (!validationSchema) return null;

      try {
        await validationSchema.parseAsync({ [name]: value });
        return null;
      } catch (error: any) {
        const fieldError = error.errors?.find((err: any) => err.path[0] === name);
        return fieldError?.message || 'Invalid value';
      }
    };

    // Display error for a field
    const displayError = (name: string, error: string | null) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;

      const errorDiv = input.parentElement?.querySelector(`#${name}-error`);
      if (errorDiv) {
        errorDiv.textContent = error || '';
        if (error) {
          input.setAttribute('aria-invalid', 'true');
        } else {
          input.removeAttribute('aria-invalid');
        }
      }
    };

    // Clear all errors
    const clearErrors = () => {
      form.querySelectorAll('[id$="-error"]').forEach(el => {
        el.textContent = '';
      });
      form.querySelectorAll('[aria-invalid]').forEach(el => {
        el.removeAttribute('aria-invalid');
      });
    };

    // Handle field blur validation
    const handleBlur = async (e: Event) => {
      if (!validateOnBlur) return;
      
      const input = e.target as HTMLInputElement;
      const name = input.name;
      if (!name) return;

      const error = await validateField(name, input.value);
      displayError(name, error);
    };

    // Handle field change validation
    const handleInput = async (e: Event) => {
      if (!validateOnChange) return;
      
      const input = e.target as HTMLInputElement;
      const name = input.name;
      if (!name) return;

      // Debounce validation
      clearTimeout((input as any).__validationTimeout);
      (input as any).__validationTimeout = setTimeout(async () => {
        const error = await validateField(name, input.value);
        displayError(name, error);
      }, 300);
    };

    // Handle form submission
    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      setMessage(null);
      clearErrors();
      setIsSubmitting(true);

      // Get form data
      const formData = new FormData(form);
      const values: Record<string, any> = {};
      
      // Convert FormData to object (handle checkboxes properly)
      formData.forEach((value, key) => {
        if (key.endsWith('[]')) {
          // Handle multiple checkboxes
          const cleanKey = key.slice(0, -2);
          if (!values[cleanKey]) values[cleanKey] = [];
          values[cleanKey].push(value);
        } else {
          const input = form.querySelector(`[name="${key}"]`) as HTMLInputElement;
          if (input?.type === 'checkbox') {
            values[key] = input.checked;
          } else {
            values[key] = value;
          }
        }
      });

      // Validate all fields
      if (validationSchema) {
        try {
          validationSchema.parse(values);
        } catch (error: any) {
          // Display all errors
          error.errors?.forEach((err: any) => {
            const fieldName = err.path[0];
            if (fieldName) {
              displayError(fieldName, err.message);
            }
          });

          // Scroll to first error
          const firstErrorField = error.errors?.[0]?.path[0];
          if (firstErrorField) {
            const element = form.querySelector(`[name="${firstErrorField}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          setIsSubmitting(false);
          return;
        }
      }

      // Submit
      try {
        await onSubmit(values);
        setMessage({ type: 'success', text: successMessage });
        
        if (resetOnSuccess) {
          form.reset();
          clearErrors();
        }
        
        onSuccess?.();
      } catch (error: any) {
        setMessage({ 
          type: 'error', 
          text: error.message || 'An error occurred while submitting the form' 
        });
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Attach event listeners
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('blur', handleBlur);
      input.addEventListener('input', handleInput);
    });

    form.addEventListener('submit', handleSubmit);

    // Cleanup
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('blur', handleBlur);
        input.removeEventListener('input', handleInput);
      });
      form.removeEventListener('submit', handleSubmit);
    };
  }, [formId, validationSchema, onSubmit, validateOnBlur, validateOnChange, successMessage, resetOnSuccess, onSuccess, onError]);

  // Render message if exists
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-lg mb-4 ${
        message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}
      role="alert"
      aria-live="polite"
    >
      {message.type === 'success' && (
        <span className="inline-block mr-2" aria-hidden="true">✓</span>
      )}
      {message.type === 'error' && (
        <span className="inline-block mr-2" aria-hidden="true">⚠️</span>
      )}
      {message.text}
    </div>
  );
}