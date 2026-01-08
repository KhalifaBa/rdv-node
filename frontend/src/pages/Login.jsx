import { useState, useContext } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom"; 
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Axios envoie les cookies automatiquement
      const res = await axios.post("/auth/login", { email, password });
      
      toast.success("Connexion réussie !");
      
      // On met à jour l'utilisateur dans le contexte
      login(res.data.user); 
      
      // <--- 3. LA REDIRECTION QUI MANQUAIT !
      navigate("/dashboard"); 
      
    } catch (error) {
        toast.error("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Connexion SaaS</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              required 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-200 shadow-md">
            Se connecter
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ? <Link to="/register" className="text-blue-600 hover:underline">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}