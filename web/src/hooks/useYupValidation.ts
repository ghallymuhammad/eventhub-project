import { useState } from 'react';
import * as Yup from 'yup';

interface UseYupValidationResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isValidating: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateAll: () => Promise<boolean>;
  setValues: (values: T) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  reset: () => void;
}

export function useYupValidation<T extends Record<string, any>>(
  schema: Yup.Schema<T>,
  initialValues: T
): UseYupValidationResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = async (field: keyof T): Promise<boolean> => {
    try {
      setIsValidating(true);
      await schema.validateAt(field as string, values);
      setErrors(prev => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setErrors(prev => ({ ...prev, [field]: error.message }));
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateAll = async (): Promise<boolean> => {
    try {
      setIsValidating(true);
      await schema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Partial<Record<keyof T, string>> = {};
        error.inner.forEach(err => {
          if (err.path) {
            validationErrors[err.path as keyof T] = err.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = async (field: keyof T) => {
    await validateField(field);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  const isValid = Object.values(errors).every(error => !error) && Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isValid,
    isValidating,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    setValues,
    setErrors,
    reset,
  };
}

// Helper function to get error message for a field
export const getFieldError = (errors: Record<string, string | undefined>, field: string): string | undefined => {
  return errors[field];
};

// Helper function to check if field has error
export const hasFieldError = (errors: Record<string, string | undefined>, field: string): boolean => {
  return Boolean(errors[field]);
};
