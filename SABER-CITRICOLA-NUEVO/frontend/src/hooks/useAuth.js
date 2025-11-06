// 🎯 hooks/useAuth.js - Hook personalizado para autenticación
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook para acceder al contexto de autenticación
 * @returns {Object} Contexto de autenticación con user, login, logout, etc.
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
};