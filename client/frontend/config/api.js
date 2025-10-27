const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiEndpoints = {
  login: `${API_BASE_URL}/`,
  cadastro: `${API_BASE_URL}/cadastro`,
  cadastroGrupo: `${API_BASE_URL}/grupo`,
};

export default API_BASE_URL;