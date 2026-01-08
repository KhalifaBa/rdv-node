import axios from 'axios';

// On crée une instance "intelligente" d'Axios
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // L'adresse de base de ton backend
  withCredentials: true // <--- C'EST ICI LA CLÉ : On force les cookies pour TOUTES les requêtes de cette instance
});

export default api;