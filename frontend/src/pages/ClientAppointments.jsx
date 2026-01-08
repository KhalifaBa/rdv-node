import { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function ClientAppointments() {
  const { user } = useContext(AuthContext); // Plus de token
  const [appointments, setAppointments] = useState([]);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      // PLUS DE HEADER ICI
      const res = await axios.get("/appointments");
      setAppointments(res.data);
    } catch (error) { toast.error("Impossible de charger les RDV"); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce RDV ?")) return;
    try {
      // PLUS DE HEADER ICI
      await axios.delete(`/appointments/${id}`);
      toast.success("Rendez-vous annulé 🗑️");
      fetchAppointments();
    } catch (error) { toast.error("Erreur lors de l'annulation"); }
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
            {appointments.map((rdv) => (
              <div key={rdv.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-800">{rdv.Service ? rdv.Service.name : "Service supprimé"}</h3>
                  <div className="text-slate-500 mt-1 flex gap-2 items-center">
                    <span>🗓️ {new Date(rdv.date).toLocaleDateString()}</span>
                    <span>⏰ {new Date(rdv.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mt-2 font-bold uppercase tracking-wide">Confirmé</span>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div className="font-bold text-xl text-slate-700">{rdv.Service ? rdv.Service.price : 0} €</div>
                  <button onClick={() => handleCancel(rdv.id)} className="text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-4 py-2 rounded-lg transition duration-200 text-sm font-medium">Annuler</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}