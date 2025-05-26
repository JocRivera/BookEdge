import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getAllProgramedPlans } from "../../services/PlanProgramed";
import "swiper/css";
import "./PlanClient.css";
import { pl } from "date-fns/locale";

function PlanClient() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Cargar planes
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const data = await getAllProgramedPlans();

                const todayStr = new Date().toISOString().slice(0, 10);

                const filteredPlans = data.filter(plan => {
                    const startStr = plan.startDate;
                    const endStr = plan.endDate;

                    return (
                        plan.statusProgramed &&
                        (!startStr || todayStr >= startStr) &&
                        (!endStr || todayStr <= endStr)
                    );
                });

                if (filteredPlans.length === 0) {
                    throw new Error("No hay planes disponibles en este momento.");
                }
                setPlans(filteredPlans);
            } catch (err) {
                setError(err.message || "Error al cargar los planes");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleReserveClick = (plan) => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: "/plans" } });
            return;
        }
        // TODO: Cuando implementes el formulario de reserva:
        // navigate(`/plans/${plan.idPlan}/reserve`);
    };

    if (loading) return <div className="loading-indicator-client">Cargando planes...</div>;
    if (error) return <div className="error-indicator-client">Error: {error}</div>;

    return (
        <section className="bugGeys-plans-client-container">
            <div className="bugGeys-plans-client-swiper-nav">
                <div className="bugGeys-plans-client-nav-prev">
                    <ChevronLeft size={24} />
                </div>
                <div className="bugGeys-plans-client-nav-next">
                    <ChevronRight size={24} />
                </div>
            </div>

            <Swiper
                modules={[Navigation]}
                navigation={{
                    nextEl: ".bugGeys-plans-client-nav-next",
                    prevEl: ".bugGeys-plans-client-nav-prev",
                }}
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                    640: { slidesPerView: 1, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 25 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                }}
            >
                {plans.map((plan) => (
                    <SwiperSlide key={plan.Plan.idPlan}>
                        <article className="bugGeys-plans-client-card">
                            <figure className="bugGeys-plans-client-image-container">
                                {plan.Plan.image ? (
                                    <img
                                        src={`http://localhost:3000${plan.Plan.image}`}
                                        alt={plan.Plan.name}
                                        className="bugGeys-plans-client-image"
                                    />
                                ) : (
                                    <div className="bugGeys-plans-client-no-image">
                                        Sin Imagen
                                    </div>
                                )}
                            </figure>

                            <div className="bugGeys-plans-client-content">
                                <h2 className="bugGeys-plans-client-title">{plan.Plan.name}</h2>
                                {plan.Plan.description && (
                                    <p className="bugGeys-plans-client-description">
                                        {plan.Plan.description}
                                    </p>
                                )}
                                <div className="bugGeys-plans-client-meta">
                                    <span className="bugGeys-plans-client-price">
                                        ${plan.Plan.salePrice.toLocaleString()}
                                    </span>
                                    <span className="bugGeys-plans-client-capacity">
                                        {plan.Plan.capacity} personas
                                    </span>
                                </div>
                                <button 
                                    className="bugGeys-plans-client-reserve-btn"
                                    onClick={() => handleReserveClick(plan)}
                                >
                                    Reservar Ahora
                                </button>
                            </div>
                        </article>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

export default PlanClient;