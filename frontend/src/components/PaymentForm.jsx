// ✅ BONS IMPORTS
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PaymentForm({ serviceId, date, price, onSuccess, onClose }) {
  // On récupère l'instance Stripe chargée par le Parent (ClientBooking)
  const stripe = useStripe(); 
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Sécurité : Si Stripe n'est pas encore chargé par le parent
    if (!stripe || !elements) {
        setLoading(false);
        return;
    }

    try {
      // 1. Création de l'intention de paiement (Backend)
      const { data } = await api.post('/payment/create-intent', { serviceId });
      
      // 2. Validation (Stripe)
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        setLoading(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          onSuccess(result.paymentIntent.id);
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Erreur lors du paiement.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Paiement Sécurisé 🔒</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>
        
        <p className="mb-6 text-slate-600">
          Montant à régler : <span className="font-bold text-indigo-600 text-lg">{price} €</span>
        </p>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="flex gap-3 mt-4">
             <button type="button" onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-slate-600 hover:bg-slate-50">
               Annuler
             </button>
             <button 
               type="submit" 
               disabled={!stripe || loading} 
               className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
             >
               {loading ? 'Traitement...' : `Payer ${price} €`}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}