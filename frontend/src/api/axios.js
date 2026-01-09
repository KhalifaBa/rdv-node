import axios from 'axios';

// 1. Ta config Vite (Très bien, on garde !)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log("🔗 Axios se connecte à :", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // Important si tu utilises des cookies, sinon optionnel mais pas gênant
});

// 2. L'AJOUT INDISPENSABLE : L'intercepteur
// C'est ce bout de code qui dit "Coucou, c'est moi, voici mon passeport (token)" à chaque requête.
api.interceptors.request.use((req) => {
  // On récupère le token stocké lors du Login
  const token = localStorage.getItem('token'); 
  
  if (token) {
    // On l'attache en en-tête (Header)
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default api;