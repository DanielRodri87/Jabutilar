const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiEndpoints = {
  cadastro: `${API_BASE_URL}/cadastro`,
  login: `${API_BASE_URL}/`,
  contato: `${API_BASE_URL}/contato`, // Endpoint adicionado
  
  // Endpoints para autenticação social
  auth: {
    google: `${API_BASE_URL}/auth/google`,
    facebook: `${API_BASE_URL}/auth/facebook`,
    apple: `${API_BASE_URL}/auth/apple`,
  }
};