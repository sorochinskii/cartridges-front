const port = import.meta.env.VITE_API_PORT 
  ? `:${import.meta.env.VITE_API_PORT}` 
  : '';

const apiUrl = `http://${
  import.meta.env.VITE_API_HOST
}${port}/${
  import.meta.env.VITE_API_PREFIX || 'api/v1'
}`;

export const API_BASE_URL = apiUrl;