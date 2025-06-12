import { useAlertContext } from '../contexts/AlertContext';

const useAlert = () => {
  // Usar el contexto de alertas en lugar de estado local
  return useAlertContext();
};

export default useAlert;