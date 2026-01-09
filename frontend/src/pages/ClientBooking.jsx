import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale/fr";
import { setHours, setMinutes } from "date-fns";
import { AuthContext } from "../context/AuthContext";

// --- STRIPE IMPORTS ---
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/PaymentForm';

// ⚠️ REMPLACE PAR TA CLÉ PUBLIQUE STRIPE (pk_test_...) ⚠️
const stripePromise = loadStripe('pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'); 

registerLocale('fr', fr);

export default function ClientBooking() {
  const { user, logout } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [selectedDates, setSelectedDates] = useState({});
  
  // États pour le paiement
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/services");
      setServices(res.data);
    } catch (error) { console.error(error); }
  };

  // 1. L'utilisateur clique sur "Réserver" -> On ouvre le paiement
  const initiateBooking = (serviceId) => {
    const date = selectedDates[serviceId];
    if (!date) return toast("Veuillez choisir une date et une heure 👆", { icon: '📅' });
    
    // Vérif si le créneau est passé
    if (new Date(date) < new Date()) return toast.error("Vous ne pouvez pas réserver dans le passé !");

    const service = services.find(s => s.id === serviceId);
    
    // On stocke les infos temporairement
    setPendingBooking({ serviceId, date, price: service.price });
    setShowPayment(true);
  };

  // 2. Le paiement est validé -> On enregistre en base
  const handlePaymentSuccess = async (paymentId) => {
    try {
      await api.post("/appointments", { 
        serviceId: pendingBooking.serviceId, 
        date: pendingBooking.date.toISOString(),
        isPaid: true,
        stripePaymentId: paymentId
      });
      
      toast.success("Réservation confirmée ! 🎉");
      setShowPayment(false);
      
      // Nettoyage de la date sélectionnée
      const newDates = { ...selectedDates };
      delete newDates[pendingBooking.serviceId];
      setSelectedDates(newDates);
      setPendingBooking(null);

    } catch (error) {
      toast.error(error.response?.status === 409 ? "Créneau déjà pris entre temps ❌" : "Erreur enregistrement");
      // Si erreur BDD mais payé, il faudrait idéalement gérer le remboursement via Stripe ici
    }
  };

  const filterPassedTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    return currentDate.getTime() < selectedDate.getTime();
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-slate-50 font-sans">
        
        {/* Header Client */}
        <header className="bg-indigo-600 text-white py-12 px-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 pattern-dots"></div>
            <h1 className="text-4xl font-extrabold mb-2 relative z-10">Réservez votre moment ✨</h1>
            <p className="opacity-90 mb-6 text-indigo-100 relative z-10">Connecté en tant que {user?.email}</p>
            <div className="flex justify-center gap-4 relative z-10">
                <Link to="/my-appointments" className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-md hover:bg-indigo-50 transition">
                    📅 Mes Réservations
                </Link>
                <button onClick={logout} className="border border-white/30 px-6 py-2 rounded-full hover:bg-white/10 transition text-white">
                    Déconnexion
                </button>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 -mt-10 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
                // Récupération des horaires dynamiques (ou défaut 9h-19h)
                const openH = service.User?.openingHour ?? 9;
                const closeH = service.User?.closingHour ?? 19;

                return (
                <div key={service.id} className="bg-white rounded-2xl shadow-xl overflow-visible flex flex-col border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="h-3 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-t-2xl"></div>
                    
                    <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                        <h3 className="font-bold text-2xl text-slate-800">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">⏱️ {service.duration} min</span>
                        </div>
                        <span className="text-xs text-indigo-500 font-semibold mt-2 block">
                            Ouvert de {openH}h à {closeH}h
                        </span>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 font-extrabold px-4 py-2 rounded-xl text-xl">
                        {service.price}€
                        </span>
                    </div>

                    <div className="mt-auto space-y-4">
                        <label className="block text-xs font-bold text-slate-400 uppercase text-center mb-1">Choisir un créneau</label>
                        
                        <div className="relative">
                            <DatePicker
                                selected={selectedDates[service.id]}
                                onChange={(date) => setSelectedDates({ ...selectedDates, [service.id]: date })}
                                showTimeSelect
                                locale="fr"
                                timeCaption="Heure"
                                dateFormat="d MMMM yyyy à HH:mm"
                                minDate={new Date()}
                                minTime={setHours(setMinutes(new Date(), 0), openH)} 
                                maxTime={setHours(setMinutes(new Date(), 0), closeH)}
                                filterTime={filterPassedTime}
                                placeholderText="📅 Cliquez pour choisir une date"
                                className="w-full text-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-bold text-slate-700 hover:bg-slate-100 transition"
                            />
                        </div>

                        <button 
                        onClick={() => initiateBooking(service.id)}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            <span>Réserver et Payer</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{service.price} €</span>
                        </button>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        </main>

        {/* MODAL DE PAIEMENT */}
        {showPayment && pendingBooking && (
            <PaymentForm 
                serviceId={pendingBooking.serviceId}
                date={pendingBooking.date}
                price={pendingBooking.price}
                onSuccess={handlePaymentSuccess}
                onClose={() => setShowPayment(false)}
            />
        )}

      </div>
    </Elements>
  );
}