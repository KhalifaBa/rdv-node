import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";
import { setHours, setMinutes } from "date-fns";
import { AuthContext } from "../context/AuthContext";

registerLocale('fr', fr);

export default function ClientBooking() {
  const { user, logout } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (error) { console.error(error); }
  };

  const handleBook = async (serviceId) => {
    const date = selectedDates[serviceId];
    if (!date) return toast("Choisis une date et une heure !", { icon: '👆' });

    try {
      await api.post("/appointments", { serviceId, date: date.toISOString() });
      toast.success("Réservé avec succès !");
      const newDates = { ...selectedDates };
      delete newDates[serviceId];
      setSelectedDates(newDates);
    } catch (error) {
      toast.error(error.response?.status === 409 ? "Ce créneau est déjà pris ❌" : "Erreur");
    }
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-indigo-600 text-white py-12 px-6 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold mb-2">Réservez votre moment 💆‍♂️</h1>
        <p className="opacity-90 mb-6">Bienvenue, {user?.email}</p>
        <div className="flex justify-center gap-4">
            <Link to="/my-appointments" className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-100 transition">📅 Voir mes RDV</Link>
            <button onClick={logout} className="border border-white/30 px-6 py-2 rounded-full hover:bg-white/10 transition text-white">Se déconnecter</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
             // 1. Récupération des horaires dynamiques du Pro (via la jointure User)
             // Si le pro n'a pas défini d'heure, on met 9h-19h par défaut
             const openH = service.User?.openingHour ?? 9;
             const closeH = service.User?.closingHour ?? 19;

             return (
              <div key={service.id} className="bg-white rounded-2xl shadow-xl overflow-visible flex flex-col border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-2xl"></div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-2xl text-slate-800">{service.name}</h3>
                      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block mt-1">⏱️ {service.duration} mins</span>
                      {/* Affichage des horaires pour info */}
                      <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded-full mt-2 inline-block">
                        Ouvert : {openH}h - {closeH}h
                      </span>
                    </div>
                    <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-lg">
                      {service.price}€
                    </span>
                  </div>

                  <div className="mt-auto space-y-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase text-center">Choisir un créneau</label>
                    
                    {/* 2. DatePicker Configuré */}
                    <div className="relative">
                      <DatePicker
                        selected={selectedDates[service.id]}
                        onChange={(date) => setSelectedDates({ ...selectedDates, [service.id]: date })}
                        showTimeSelect
                        withPortal // <--- AFFICHE LE CALENDRIER AU CENTRE DE L'ÉCRAN
                        locale="fr"
                        timeCaption="Heure"
                        dateFormat="d MMMM yyyy à HH:mm"
                        minDate={new Date()} 
                        
                        // --- LIMITES DYNAMIQUES ---
                        minTime={setHours(setMinutes(new Date(), 0), openH)} 
                        maxTime={setHours(setMinutes(new Date(), 0), closeH)}
                        // --------------------------

                        filterTime={filterPassedTime}
                        placeholderText="📅 Cliquez pour choisir..."
                        className="w-full text-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-bold text-slate-600 hover:bg-slate-100 transition"
                      />
                    </div>

                    <button 
                      onClick={() => handleBook(service.id)}
                      className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95"
                    >
                      Confirmer la réservation
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}