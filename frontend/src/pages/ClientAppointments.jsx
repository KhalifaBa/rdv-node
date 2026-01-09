import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function ClientAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);

  // --- NOUVEAUX ÉTATS POUR LA MODALE ---
  const [showModal, setShowModal] = useState(false);
  const [selectedRdvId, setSelectedRdvId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (error) { 
      toast.error("Impossible de charger les RDV"); 
    }
  };

  // 1. Fonction qui OUVRE la modale (au clic sur le bouton "Annuler" de la liste)
  const handleOpenModal = (id) => {
    setSelectedRdvId(id);
    setShowModal(true);
  };

  // 2. Fonction qui CONFIRME l'annulation (au clic sur "Oui" dans la modale)
  const handleConfirmCancel = async () => {
    if (!selectedRdvId) return;
    setIsCancelling(true); // Active le chargement sur le bouton

    try {
      const res = await api.post(`/appointments/cancel-client/${selectedRdvId}`);
      
      // Succès
      toast.success(res.data.message); 
      fetchAppointments(); // Rafraîchir la liste
      setShowModal(false); // Fermer la modale
    } catch (error) { 
      toast.error(error.response?.data?.message || "Erreur lors de l'annulation"); 
    } finally {
      setIsCancelling(false); // Désactive le chargement
    }
  };

  // Helper pour l'affichage des badges
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
                      
                      <div className="mt-2">
                        {getStatusBadge(rdv.status, rdv.isPaid)}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                      <div className="font-bold text-xl text-slate-700">{rdv.Service ? rdv.Service.price : 0} €</div>
                      
                      {!isCancelled && (
                          <button 
                            // CHANGEMENT ICI : On appelle handleOpenModal au lieu de l'API direct
                            onClick={() => handleOpenModal(rdv.id)} 
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

      {/* --- MODALE DE CONFIRMATION (Style Tailwind) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Êtes-vous sûr ?</h3>
            <p className="text-slate-600 mb-6">
              Voulez-vous vraiment annuler ce rendez-vous ? <br/>
              <span className="text-xs text-orange-600 font-semibold">Si le délai est dépassé, aucun remboursement ne sera effectué.</span>
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
              >
                Retour
              </button>
              
              <button 
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>...</span>
                  </>
                ) : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}