import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ProDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", duration: 30, price: 0 });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:3000/api/services", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:3000/api/services", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
      setFormData({ name: "", duration: 30, price: 0 });
    } catch (error) { alert("Erreur"); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🏢 Espace Pro <span className="text-sm font-normal text-slate-500">({user?.email})</span>
        </h1>
        <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium text-sm transition">
          Déconnexion
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">➕ Nouveau Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nom</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Coupe Homme"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Durée (min)</label>
                  <input 
                    type="number" 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Prix (€)</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <button className="w-full bg-slate-900 hover:bg-black text-white py-2 rounded-lg font-medium transition">
                Ajouter
              </button>
            </form>
          </div>
        </div>

        {/* COLONNE DROITE : LISTE DES SERVICES */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Mes Services Actifs</h2>
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{service.name}</h3>
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    ⏱️ {service.duration} mins
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-lg">
                  {service.price} €
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                Aucun service créé. Utilisez le formulaire à gauche.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}