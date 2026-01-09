import axios from 'axios';

// 1. On récupère l'URL depuis les variables d'environnement (.env)
// Si la variable n'existe pas (ex: en local sans .env), on utilise localhost par sécurité
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log("🔗 Axios se connecte à :", BASE_URL); // Pour vérifier dans la console F12

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // Important pour les cookies
});

export default api;