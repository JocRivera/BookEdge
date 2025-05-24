import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getReservationsByUser } from "../../services/reservationsService";
import "./ReservationsClient.css";

const ReservationsClient = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Console.log al montar el componente
  console.log("[ReservationsClient] Component mounted", {
    user,
    loading,
    error
  });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 2. Console.log antes de hacer la petición
        console.log("[ReservationsClient] Fetching reservations for user:", user?.id);
        
        if (user?.id) {
          const userReservations = await getReservationsByUser(user.id);
          
          // 3. Console.log con la respuesta del API
          console.log("[ReservationsClient] API Response:", userReservations);
          
          if (!userReservations || userReservations.length === 0) {
            console.log("[ReservationsClient] No reservations found");
            setError("No tienes reservas activas");
          }
          setReservations(userReservations);
        }
      } catch (err) {
        // 4. Console.log de errores
        console.error("[ReservationsClient] Error fetching reservations:", {
          error: err,
          message: err.message,
          stack: err.stack
        });
        setError("Error al cargar tus reservaciones");
      } finally {
        setLoading(false);
        // 5. Console.log al finalizar la carga
        console.log("[ReservationsClient] Loading completed", {
          reservationsCount: reservations.length,
          loading,
          error
        });
      }
    };

    fetchReservations();
  }, [user]);

  // 6. Console.log del estado actual antes de renderizar
  console.log("[ReservationsClient] Current state:", {
    user,
    reservations,
    loading,
    error
  });

  if (loading) {
    console.log("[ReservationsClient] Rendering loading state");
    return <div className="reservations-loading">Cargando tus reservaciones...</div>;
  }

  if (error) {
    console.log("[ReservationsClient] Rendering error state:", error);
    return <div className="reservations-error">{error}</div>;
  }

  // 7. Console.log antes de renderizar las reservas
  console.log("[ReservationsClient] Rendering reservations", {
    count: reservations.length,
    sample: reservations.length > 0 ? reservations[0] : null
  });

  return (
    <div className="reservations-client-container">
      {/* ... resto del JSX ... */}
    </div>
  );
};

export default ReservationsClient;