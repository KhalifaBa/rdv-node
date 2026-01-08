import { useState, useEffect, useContext } from "react";
import api from "../api/axios"; // Ton instance Axios configurée
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ProDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ name: "", duration: 30, price: 0 });
  
  // State pour les horaires (par défaut 9h - 19h)
  const [schedule, setSchedule] = useState({ 
    openingHour: user?.openingHour || 9, 
    closingHour: user?.closingHour || 19 
  });

  useEffect(() => { 
    fetchServices();
    fetchProAppointments();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/services/me");
      setServices(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchProAppointments = async () => {
    try {
      const res = await api.get("/appointments/pro");
      setAppointments(res.data);
    } catch (error) { console.log("Pas de RDV"); }
  };

  // --- NOUVEAU : MISE À JOUR DES HORAIRES ---
  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    if (schedule.openingHour >= schedule.closingHour) {
      return toast.error("L'ouverture doit être avant la fermeture !");
    }
    try {
      await api.put("/auth/profile", schedule);
      toast.success("Horaires mis à jour ! 🕒");
      // On recharge les services pour être sûr que tout est synchro
      fetchServices();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };
  // -------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/services", formData);
      fetchServices();
      setFormData({ name: "", duration: 30, price: 0 });
      toast.success("Service créé !");
    } catch (error) { toast.error("Erreur création"); }
  };

  const handleDeleteService = async (id) => {
    if(!window.confirm("Supprimer ce service ?")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Service supprimé 🗑️");
      fetchServices();
    } catch (error) { toast.error("Impossible de supprimer"); }
  };

  const handleCancelRDV = async (id) => {
    if(!window.confirm("Annuler ce rendez-vous client ?")) return;
    try {
      await api.delete(`/appointments/pro/${id}`);
      toast.success("RDV annulé");
      fetchProAppointments();
    } catch (error) { toast.error("Erreur annulation"); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🏢 Espace Pro <span className="text-sm font-normal text-slate-500 hidden md:inline">({user?.email})</span>
        </h1>
        <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition">
          Déconnexion
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* --- NOUVEAU BLOC : RÉGLAGE HORAIRES --- */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">⏰ Mes Horaires d'ouverture</h2>
            <form onSubmit={handleUpdateSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Ouverture</label>
                  <select 
                    value={schedule.openingHour}
                    onChange={(e) => setSchedule({...schedule, openingHour: Number(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-lg bg-slate-50 outline-none cursor-pointer"
                  >
                    {[...Array(24).keys()].map(h => (
                      <option key={h} value={h}>{h}h00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Fermeture</label>
                  <select 
                    value={schedule.closingHour}
                    onChange={(e) => setSchedule({...schedule, closingHour: Number(e.target.value)})}
                    className="w-full mt-1 p-2 border rounded-lg bg-slate-50 outline-none cursor-pointer"
                  >
                    {[...Array(24).keys()].map(h => (
                      <option key={h} value={h}>{h}h00</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition shadow-md">
                Enregistrer les horaires
              </button>
            </form>
          </div>
          {/* --------------------------------------- */}

          {/* Formulaire Création Service */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">➕ Créer un Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nom</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Consultation" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Durée (min)</label>
                  <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Prix (€)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full mt-1 p-2 border rounded-lg outline-none" />
                </div>
              </div>
              <button className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-lg font-medium transition shadow-lg shadow-slate-200">Ajouter au catalogue</button>
            </form>
          </div>

          {/* Liste des Services */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">Votre Catalogue</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-center group">
                  <div>
                    <div className="font-bold text-slate-700">{service.name}</div>
                    <div className="text-xs text-slate-400">{service.duration} min</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">{service.price} €</span>
                    <button onClick={() => handleDeleteService(service.id)} className="text-slate-300 hover:text-red-500 transition">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : AGENDA */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            📅 Mon Agenda <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full">{appointments.length}</span>
          </h2>
          {appointments.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border-2 border-dashed border-slate-200 text-center"><p className="text-slate-400 text-lg">Aucune réservation pour le moment.</p></div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Date & Heure</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Client</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Service</th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((rdv) => (
                    <tr key={rdv.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{new Date(rdv.date).toLocaleDateString()}</div>
                        <div className="text-sm text-slate-500">{new Date(rdv.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="p-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">{rdv.User?.email[0].toUpperCase()}</div><span className="text-sm text-slate-600">{rdv.User?.email}</span></div></td>
                      <td className="p-4 text-sm text-slate-600">{rdv.Service?.name} <div className="text-xs text-green-600 font-bold">+{rdv.Service?.price} €</div></td>
                      <td className="p-4 text-right"><button onClick={() => handleCancelRDV(rdv.id)} className="text-red-400 hover:text-red-600 font-medium text-sm border border-transparent hover:border-red-100 px-3 py-1 rounded transition">Annuler</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}