import axios from 'axios';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: 'http://localhost:3000',
  // baseURL: 'http://localhost:30e00',
  withCredentials: true
});

// Variable para controlar si hay un refresco en curso
let isRefreshing = false;
// Cola de peticiones fallidas que serán repetidas después del refresco
let failedQueue = [];

// Procesar la cola de peticiones fallidas
const processQueue = (error, token = null) => {
  console.log(`Procesando cola de peticiones fallidas: ${failedQueue.length} peticiones pendientes`,token);
  failedQueue.forEach(prom => {
    if (error) {
      console.log('Rechazando petición en cola debido a error:', error.message);
      prom.reject(error);
    } else {
      console.log('Resolviendo petición en cola tras refresco exitoso');
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// Interceptor de peticiones
api.interceptors.request.use(
  (config) => {
    console.log(`📤 Enviando petición a: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en petición:', error.message);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
api.interceptors.response.use(
  // En caso de éxito simplemente devolvemos la respuesta
  (response) => {
    console.log(`📥 Respuesta exitosa de: ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  // En caso de error, manejamos potenciales problemas de autenticación
  async (error) => {
    const originalRequest = error.config;
    
    console.log(`❌ Error en respuesta de: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, 
      error.response ? `Código: ${error.response.status}` : 'Sin respuesta');
    
    // Si el error no es de autenticación o ya se intentó refrescar, rechazamos la promesa
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      if (!error.response) {
        console.error('Error de red o servidor no disponible');
      } else if (error.response.status !== 401) {
        console.error(`Error diferente a 401: ${error.response.status}`);
      } else if (originalRequest._retry) {
        console.error('Ya se intentó refrescar el token para esta petición');
      }
      return Promise.reject(error);
    }
    
    // Evitamos refrescar el token para ciertos endpoints
    if (originalRequest.url === '/auth/login' || 
        originalRequest.url === '/auth/refresh' || 
        originalRequest.url === '/auth/logout') {
      console.log(`No se intenta refrescar para endpoint: ${originalRequest.url}`);
      return Promise.reject(error);
    }

    console.log('⚠️ Detectado error 401, intentando refrescar token...');
    
    // Verificar cookies actuales
    console.log('🍪 Cookies disponibles:', document.cookie);
    
    // Mostrar hora actual del navegador
    const now = new Date();
    console.log('⏰ Hora actual del navegador:', now.toISOString());

    // Si ya estamos refrescando el token, añadimos la petición a la cola
    if (isRefreshing) {
      console.log('Ya hay un refresco en curso, añadiendo petición a la cola');
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          console.log('Reintentando petición original después del refresco');
          return api(originalRequest);
        })
        .catch(err => {
          console.error('Error al reintentar petición después del refresco:', err.message);
          return Promise.reject(err);
        });
    }

    // Marcamos que estamos en proceso de refresco y que este es un reintento
    originalRequest._retry = true;
    isRefreshing = true;
    console.log('Iniciando proceso de refresco de token');

    // Intentamos refrescar el token
    try {
      console.log('📤 Solicitando nuevo token...');
      const refreshResponse = await api.post('/auth/refresh');
      console.log('✅ Token refrescado exitosamente:', refreshResponse.data);
      
      isRefreshing = false;
      processQueue(null);
      
      // Reintentamos la petición original
      console.log('Reintentando petición original con nuevo token');
      return api(originalRequest);
    } catch (refreshError) {
      console.error('❌ Error al refrescar token:', refreshError.message);
      console.error('Detalles del error:', refreshError.response?.data);
      
      isRefreshing = false;
      processQueue(refreshError);
      
      // Si no se puede refrescar, enviamos evento de logout
      console.log('Enviando evento auth-error para cerrar sesión');
      window.dispatchEvent(new CustomEvent('auth-error', { detail: refreshError }));
      
      return Promise.reject(refreshError);
    }
  }
);

export default api;