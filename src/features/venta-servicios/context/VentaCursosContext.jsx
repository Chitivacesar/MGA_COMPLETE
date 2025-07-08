import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const VentaCursosContext = createContext();

export const useVentaCursos = () => {
  const context = useContext(VentaCursosContext);
  if (!context) {
    throw new Error('useVentaCursos debe ser usado dentro de un VentaCursosProvider');
  }
  return context;
};

export const VentaCursosProvider = ({ children }) => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshVentas = async () => {
    await fetchVentas();
  };

  const fetchVentas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/api/ventas');
      console.log('Respuesta de la API:', response.data);
      // Verificar que response.data sea un array
      const ventasData = Array.isArray(response.data) ? response.data : response.data.ventas || [];
      console.log('Datos procesados:', ventasData);
      // Filtrar solo las ventas de tipo "curso"
      const ventasCursos = ventasData.filter(venta => venta.tipo === 'curso');
      console.log('Ventas de cursos filtradas:', ventasCursos);
      
      // Obtener información de los clientes para cada beneficiario
      const ventasConClientes = await Promise.all(ventasCursos.map(async (venta) => {
        if (venta.beneficiarioId?.clienteId) {
          const clienteResponse = await axios.get(`http://localhost:3000/api/beneficiarios/${venta.beneficiarioId.clienteId}`);
          console.log('Respuesta del cliente:', clienteResponse.data);
          return {
            ...venta,
            cliente: clienteResponse.data
          };
        }
        return venta;
      }));

      console.log('Ventas con información de clientes:', ventasConClientes);
      setVentas(ventasConClientes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatVentaParaTabla = (venta) => {
    return {
      id: venta.codigoVenta,
      beneficiario: venta.beneficiarioId ? `${venta.beneficiarioId.nombre} ${venta.beneficiarioId.apellido}` : 'No especificado',
      cliente: venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido}` : 'No especificado',
      curso: venta.cursoId ? venta.cursoId.nombre : 'No especificado',
      ciclo: venta.ciclo,
      clases: venta.numero_de_clases,
      valorTotal: venta.valor_total,
      estado: venta.estado,
      motivoAnulacion: venta.motivoAnulacion
    };
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const anularVenta = async (ventaId, motivoAnulacion) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3000/api/ventas/${ventaId}`, {
        estado: 'anulada',
        motivoAnulacion
      });
      await fetchVentas();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteVenta = async (ventaId) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/ventas/${ventaId}`);
      await fetchVentas();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    ventas,
    loading,
    error,
    fetchVentas,
    refreshVentas,
    formatVentaParaTabla,
    anularVenta,
    deleteVenta
  };

  return (
    <VentaCursosContext.Provider value={value}>
      {children}
    </VentaCursosContext.Provider>
  );
};