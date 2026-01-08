import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function ClientBooking() {
  const { token, user, logout } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [dates, setDates] = useState({});

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:3000/api/services", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (error) { console.error(error); }
  };

  const handleBook = async (serviceId) => {
    if (!dates[serviceId]) return toast("Merci de choisir une date !", { icon: '👆' });
    try {
      await axios.post("http://127.0.0.1:3000/api/appointments", 
        { serviceId, date: new Date(dates[serviceId]).toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Réservé avec succès !");
    } catch (error) {
      toast.error(error.response?.status === 409 ? "Ce créneau est pris ❌" : "Erreur");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-indigo-600 text-white py-12 px-6 text-center shadow-lg">
        <h1 className="text-3xl font-extrabold mb-2">Réservez votre moment</h1>
        <p className="opacity-90 mb-6">Bienvenue, {user?.email}</p>
        
        {/* Barre d'action */}
        <div className="flex justify-center gap-4">
            <Link to="/my-appointments" className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold shadow-md hover:bg-gray-100 transition">
                📅 Voir mes RDV
            </Link>
            <button onClick={logout} className="border border-white/30 px-6 py-2 rounded-full hover:bg-white/10 transition text-white">
              Se déconnecter
            </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:-translate-y-1 transition duration-300">
              <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">{service.name}</h3>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{service.duration} mins</span>
                  </div>
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-sm">
                    {service.price}€
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase">Choisir un créneau</label>
                  <input 
                    type="datetime-local" 
                    onChange={(e) => setDates({ ...dates, [service.id]: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    onClick={() => handleBook(service.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition active:scale-95"
                  >
                    Réserver maintenant
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}