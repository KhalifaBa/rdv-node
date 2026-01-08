import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProDashboard from "./pages/ProDashboard";
import ClientBooking from "./pages/ClientBooking";
import ClientAppointments from "./pages/ClientAppointments";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useContext } from "react";

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'PRO') return <ProDashboard />;
  if (user.role === 'CLIENT') return <ClientBooking />;
  return <div>Rôle inconnu</div>;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Route principale */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        
        {/* Route Mes RDV */}
        <Route path="/my-appointments" element={<ClientAppointments />} /> {/* <--- 2. Route */}
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;