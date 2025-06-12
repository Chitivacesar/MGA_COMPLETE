import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './shared/contexts/store';
import { router } from './routes';
import { AuthProvider } from './features/auth/context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}>
        <AuthProvider>
          {/* Aquí puedes agregar otros contextos si es necesario */}
        </AuthProvider>
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);
