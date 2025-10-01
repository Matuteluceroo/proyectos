// 🔍 useFormValidation.js - Hook personalizado para validación de formularios
import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouchedState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📝 Validadores predefinidos
  const validators = {
    required: (value, message = 'Este campo es requerido') => {
      if (!value || value.toString().trim() === '') {
        return message;
      }
      return null;
    },

    email: (value, message = 'Ingresa un email válido') => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return message;
      }
      return null;
    },

    minLength: (minLength, message) => (value) => {
      if (value && value.length < minLength) {
        return message || `Debe tener al menos ${minLength} caracteres`;
      }
      return null;
    },

    maxLength: (maxLength, message) => (value) => {
      if (value && value.length > maxLength) {
        return message || `No debe exceder ${maxLength} caracteres`;
      }
      return null;
    },

    pattern: (regex, message) => (value) => {
      if (value && !regex.test(value)) {
        return message || 'Formato inválido';
      }
      return null;
    },

    username: (value, message = 'Usuario debe tener 3-20 caracteres alfanuméricos') => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (value && !usernameRegex.test(value)) {
        return message;
      }
      return null;
    },

    password: (value, message = 'Contraseña debe tener al menos 6 caracteres') => {
      if (value && value.length < 6) {
        return message;
      }
      return null;
    },

    confirmPassword: (originalPassword, message = 'Las contraseñas no coinciden') => (value) => {
      if (value && value !== originalPassword) {
        return message;
      }
      return null;
    }
  };

  // ✅ Validar un campo específico
  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Si rules es un array, ejecutar todos los validadores
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        if (typeof rule === 'function') {
          const error = rule(value);
          if (error) return error;
        } else if (typeof rule === 'string' && validators[rule]) {
          const error = validators[rule](value);
          if (error) return error;
        }
      }
    } else if (typeof rules === 'function') {
      return rules(value);
    } else if (typeof rules === 'string' && validators[rules]) {
      return validators[rules](value);
    }

    return null;
  }, [validationRules]);

  // 📝 Validar todos los campos
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [values, validateField, validationRules]);

  // 🔄 Cambiar valor de un campo
  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [touched, validateField]);

  // 👆 Marcar campo como tocado
  const setTouched = useCallback((fieldName) => {
    setTouchedState(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validar cuando se toca por primera vez
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, [values, validateField]);

  // 🎯 Handler para inputs
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setValue(name, fieldValue);
  }, [setValue]);

  // 👆 Handler para blur (salir del campo)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(name);
  }, [setTouched]);

  // 🚀 Handler para submit
  const handleSubmit = useCallback(async (onSubmit) => {
    return async (e) => {
      if (e) e.preventDefault();
      
      setIsSubmitting(true);
      
      // Marcar todos los campos como tocados
      const allTouched = {};
      Object.keys(validationRules).forEach(field => {
        allTouched[field] = true;
      });
      setTouchedState(allTouched);

      // Validar formulario completo
      const { isValid, errors: validationErrors } = validateForm();
      
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Error en submit:', error);
        }
      }
      
      setIsSubmitting(false);
      return isValid;
    };
  }, [values, validationRules, validateForm]);

  // 🔄 Resetear formulario
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 📊 Estado del formulario
  const formState = {
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
    isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    hasErrors: Object.keys(errors).some(key => errors[key]),
    touchedFields: Object.keys(touched).length
  };

  return {
    // Valores y estado
    values,
    errors,
    touched,
    isSubmitting,
    formState,
    
    // Métodos
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    reset,
    
    // Validadores disponibles
    validators
  };
};

export default useFormValidation;