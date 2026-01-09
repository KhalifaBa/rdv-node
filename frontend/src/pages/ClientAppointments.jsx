import { useState, useEffect, useContext } from "react";
import api from "../api/axios"; // Utilise l'instance configurée 'api', pas 'axios' direct
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function ClientAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments"); // Route: GET /api/appointments
      setAppointments(res.data);
    } catch (error) { toast.error("Impossible de charger les RDV"); }
  };

  // --- CORRECTION 1 : Annulation via POST ---
  const handleCancel = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce RDV ? (Remboursement selon conditions)")) return;
    try {
      // On appelle la route 'cancel-client' définie dans le backend
      const res = await api.post(`/appointments/cancel-client/${id}`);
      
      // On affiche le message du backend (ex: "RDV annulé et remboursé")
      toast.success(res.data.message); 
      fetchAppointments();
    } catch (error) { 
        toast.error(error.response?.data?.message || "Erreur lors de l'annulation"); 
    }
  };

  // Petit helper pour afficher le bon badge de statut
  const getStatusBadge = (status, isPaid) => {
      if (status?.includes('cancelled_refunded')) return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded font-bold uppercase">Annulé (Remboursé)</span>;
      if (status?.includes('cancelled')) return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold uppercase">Annulé (Non remboursé)</span>;
      if (isPaid) return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold uppercase">Confirmé & Payé</span>;
      return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold uppercase">Réservé</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">📅 Mes Rendez-vous</h1>
          <Link to="/dashboard" className="text-indigo-600 font-medium hover:underline flex items-center gap-2">← Retour aux services</Link>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
            <p className="text-slate-500 text-lg">Vous n'avez aucun rendez-vous prévu.</p>
            <Link to="/dashboard" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Réserver un service</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((rdv) => {
                // --- CORRECTION 2 : Vérification du statut ---
                const isCancelled = rdv.status && rdv.status.includes('cancelled');

                return (
                  <div key={rdv.id} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4 ${isCancelled ? 'opacity-60 bg-slate-50' : ''}`}>
                    <div>
                      <h3 className={`font-bold text-xl ${isCancelled ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {rdv.Service ? rdv.Service.name : "Service supprimé"}
                      </h3>
                      <div className="text-slate-500 mt-1 flex gap-2 items-center">
                        <span>🗓️ {new Date(rdv.date).toLocaleDateString()}</span>
                        <span>⏰ {new Date(rdv.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      {/* Badge dynamique */}
                      <div className="mt-2">
                        {getStatusBadge(rdv.status, rdv.isPaid)}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                      <div className="font-bold text-xl text-slate-700">{rdv.Service ? rdv.Service.price : 0} €</div>
                      
                      {/* --- CORRECTION 3 : Cacher le bouton si annulé --- */}
                      {!isCancelled && (
                          <button 
                            onClick={() => handleCancel(rdv.id)} 
                            className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                          >
                            Annuler
                          </button>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
}