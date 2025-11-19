// src/components/Form/Form.tsx
/**
 * Form Component - Performance Optimized
 *
 * Main wrapper component that provides form context and handles submission.
 * Uses lazy initialization to avoid blocking the main thread on mount.
 */
import { useMemo, Children, isValidElement, useState, useEffect, useRef } from "react";
import { useForm } from "./hooks/useForm";
import { FormContext } from "./FormContext";
import { useMultiStep } from "./hooks/useMultiStep";
import type { FormProps } from "./types";

export default function Form({
  children,
  onSubmit,
  initialValues = {},
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
  validateOnMount = false,
  successMessage,
  successMessageClassName,
  errorMessageClassName,
  showMessageIcon = true,
  messagePosition = "top",
  className = "",
  formClassName = "",
  resetOnSuccess = false,
  scrollToError = true,
  ariaLabel,
  ariaDescribedBy,
}: FormProps) {
  // NEW: Lazy initialization flag
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldInitRef = useRef(false);

  // NEW: Only initialize when form becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !shouldInitRef.current) {
          shouldInitRef.current = true;
          // Use requestIdleCallback if available, otherwise setTimeout
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => setIsInitialized(true));
          } else {
            setTimeout(() => setIsInitialized(true), 0);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Initialize form state (only when initialized)
  const form = useForm({
    initialValues,
    onSubmit,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    validateOnMount: false, // Always false, we'll handle this manually
    resetOnSuccess,
  });

  // Detect if this is a multi-step form
  const isMultiStep = useMemo(() => {
    if (!isInitialized) return false;
    return Children.toArray(children).some(
      (child) =>
        isValidElement(child) && (child.type as any).displayName === "FormStep"
    );
  }, [children, isInitialized]);

  // Initialize multi-step functionality
  const multiStep = useMultiStep({
    enabled: isMultiStep,
    children,
    validateForm: form.validateForm,
  });

  // Run validation on mount if needed (deferred)
  useEffect(() => {
    if (isInitialized && validateOnMount) {
      requestAnimationFrame(() => {
        form.validateForm();
      });
    }
  }, [isInitialized, validateOnMount]);

  // Scroll to first error on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await (form as any).handleSubmit(e);

    if (scrollToError && !form.isValid) {
      requestAnimationFrame(() => {
        const firstErrorField = Object.keys(form.errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }
  };

  // Combine form state with multi-step state
  const contextValue = useMemo(
    () => ({
      ...form,
      isMultiStep,
      currentStep: multiStep.currentStep,
      totalSteps: multiStep.totalSteps,
      goToStep: multiStep.goToStep,
      nextStep: multiStep.nextStep,
      previousStep: multiStep.previousStep,
      isFirstStep: multiStep.isFirstStep,
      isLastStep: multiStep.isLastStep,
    }),
    [form, multiStep, isMultiStep]
  );

  // Render children - filter to current step if multi-step
  const renderedChildren = useMemo(() => {
    if (!isInitialized) return children; // Show all children before init
    if (!isMultiStep) return children;

    // Get all FormStep children
    const steps = Children.toArray(children).filter(
      (child) =>
        isValidElement(child) && (child.type as any).displayName === "FormStep"
    );

    // Get other children (like FormMessages, FormNavigation)
    const otherChildren = Children.toArray(children).filter(
      (child) =>
        !isValidElement(child) || (child.type as any).displayName !== "FormStep"
    );

    // Return current step + other children
    return [
      ...otherChildren.filter((child) => {
        return (
          isValidElement(child) &&
          (child.type as any).displayName !== "FormNavigation"
        );
      }),
      steps[multiStep.currentStep],
      ...otherChildren.filter((child) => {
        return (
          isValidElement(child) &&
          (child.type as any).displayName === "FormNavigation"
        );
      }),
    ];
  }, [children, isMultiStep, multiStep.currentStep, isInitialized]);

  return (
    <div ref={containerRef}>
      <FormContext.Provider value={contextValue}>
        <form
          onSubmit={handleSubmit}
          className={className}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          noValidate
        >
          {renderedChildren}
        </form>
      </FormContext.Provider>
    </div>
  );
}