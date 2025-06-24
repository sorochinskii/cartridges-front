const host = import.meta.env.VITE_API_HOST || 'localhost'
const port = import.meta.env.VITE_API_PORT || '8448'
const prefix = import.meta.env.VITE_API_PREFIX || '/api/v1'

export const API_BASE_URL = `http://${host}${port ? `:${port}` : ''}${prefix}`