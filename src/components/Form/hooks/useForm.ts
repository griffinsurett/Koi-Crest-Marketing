// src/components/Form/hooks/useForm.ts
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { ZodSchema } from "zod";
import type {
  FormValues,
  FormErrors,
  FormTouched,
  FormStatus,
  FormState,
  FormActions,
  ValidationConfig,
  FieldValidator,
} from "../types";

interface UseFormOptions extends ValidationConfig {
  initialValues?: FormValues;
  onSubmit: (values: FormValues) => Promise<void> | void;
  resetOnSuccess?: boolean;
}

interface FieldValidators {
  [fieldName: string]: FieldValidator;
}

interface UseFormReturn extends FormState, FormActions {
  registerFieldValidator: (name: string, validator: FieldValidator) => void;
  unregisterFieldValidator: (name: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}

export function useForm(options: UseFormOptions): UseFormReturn {
  const {
    initialValues = {},
    onSubmit,
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnMount = false,
    resetOnSuccess = false,
  } = options;

  // State
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);

  // Refs
  const fieldValidatorsRef = useRef<FieldValidators>({});
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const isSubmitting = status === "submitting";
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  // Register field validator
  const registerFieldValidator = useCallback(
    (name: string, validator: FieldValidator) => {
      fieldValidatorsRef.current[name] = validator;
    },
    []
  );

  // Unregister field validator
  const unregisterFieldValidator = useCallback((name: string) => {
    delete fieldValidatorsRef.current[name];
  }, []);

  // Validate field with schema (memoized)
  const validateFieldWithSchema = useCallback(
    async (name: string, value: any): Promise<string | null> => {
      if (!validationSchema) return null;

      try {
        await validationSchema.parseAsync({ [name]: value });
        return null;
      } catch (error: any) {
        const fieldError = error.errors?.find(
          (err: any) => err.path[0] === name
        );
        return fieldError?.message || null;
      }
    },
    [validationSchema]
  );

  // Validate single field (debounced for performance)
  const validateField = useCallback(
    async (name: string): Promise<boolean> => {
      // Clear existing timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      return new Promise((resolve) => {
        validationTimeoutRef.current = setTimeout(async () => {
          const value = values[name];
          let error: string | null = null;

          // Try custom field validator first
          const fieldValidator = fieldValidatorsRef.current[name];
          if (fieldValidator) {
            error = await fieldValidator(value);
          }

          // Try schema validation if no custom validator
          if (!error && validationSchema) {
            error = await validateFieldWithSchema(name, value);
          }

          // Batch update
          setErrors((prev) => ({
            ...prev,
            [name]: error || undefined,
          }));

          resolve(!error);
        }, 100); // 100ms debounce
      });
    },
    [values, validationSchema, validateFieldWithSchema]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    // Validate with schema first (most common case)
    if (validationSchema) {
      try {
        await validationSchema.parseAsync(values);
      } catch (error: any) {
        error.errors?.forEach((err: any) => {
          const fieldName = err.path[0];
          if (fieldName) {
            newErrors[fieldName] = err.message;
          }
        });
      }
    }

    // Validate with custom field validators (parallel)
    const fieldNames = Object.keys(fieldValidatorsRef.current);
    const validationResults = await Promise.all(
      fieldNames.map(async (name) => {
        const validator = fieldValidatorsRef.current[name];
        if (validator && !newErrors[name]) {
          const error = await validator(values[name]);
          return { name, error };
        }
        return null;
      })
    );

    // Apply validation results
    validationResults.forEach((result) => {
      if (result?.error) {
        newErrors[result.name] = result.error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  // Set field value (batched)
  const setFieldValue = useCallback(
    (name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if enabled (debounced)
      if (validateOnChange) {
        validateField(name);
      }
    },
    [validateOnChange, validateField]
  );

  // Set field error
  const setFieldError = useCallback(
    (name: string, error: string | undefined) => {
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    []
  );

  // Set field touched (debounced validation)
  const setFieldTouched = useCallback(
    (name: string, isTouched: boolean) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      // Validate on blur if enabled
      if (isTouched && validateOnBlur) {
        requestAnimationFrame(() => {
          validateField(name);
        });
      }
    },
    [validateOnBlur, validateField]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setStatus("idle");
    setMessage(null);
    setSubmitCount(0);
  }, [initialValues]);

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setSubmitCount((prev) => prev + 1);
      setStatus("submitting");
      setMessage(null);

      // Mark all fields as touched (batched)
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate form
      const isFormValid = await validateForm();

      if (!isFormValid) {
        setStatus("error");
        setMessage("Please fix the errors before submitting");
        return;
      }

      // Submit
      try {
        await onSubmit(values);
        setStatus("success");

        if (resetOnSuccess) {
          setTimeout(() => resetForm(), 2000);
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.message || "An error occurred while submitting the form"
        );
      }
    },
    [values, validateForm, onSubmit, resetOnSuccess, resetForm]
  );

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    values,
    errors,
    touched,
    status,
    isSubmitting,
    isValid,
    submitCount,
    message,

    // Actions
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setErrors,
    setValues,
    validateField,
    validateForm,
    resetForm,
    setStatus,
    setMessage,

    // Internal
    registerFieldValidator,
    unregisterFieldValidator,
    handleSubmit,
  };
}