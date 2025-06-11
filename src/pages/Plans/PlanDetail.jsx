import { X, Users, DollarSign, CalendarDays, MapPin, CheckCircle } from "lucide-react";
import { getPlanById } from "../../services/PlanService";
import "./PlanDetailClient.css";
import { useState, useEffect } from "react";
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

const PlanDetail = ({ plan, isOpen, onClose }) => {
    const [planDetails, setPlanDetails] = useState(null);
    const [isloading, setIsLoading] = useState(true);

    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    const cerradorDeModales = (e) => {
        e.stopPropagation();
        onClose();
        setIsLoading(true);
        setPlanDetails(null);
    };

    const fetchPlan = async () => {
        try {
            const response = await getPlanById(plan.idPlan);
            setPlanDetails(response);
        } catch (error) {
            console.error("Error fetching plan details:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPlan();
    }, [plan, isloading]);

    if (!isOpen || !plan) return null;

    if (!isloading && planDetails) {
        return (
            <div className="bookGEYS-plan-modal-overlay" onClick={cerradorDeModales}>
                <div className="bookGEYS-plan-modal-container" onClick={handleModalClick}>
                    <button className="bookGEYS-plan-details-close-button" onClick={cerradorDeModales}>
                        <X size={24} />
                    </button>

                    <div className="bookGEYS-plan-details-content">
                        <section className="bookGEYS-plan-details-gallery">
                            <div className="bookGEYS-plan-details-main-image-container">
                                {planDetails.plan.image ? (
                                    <img
                                        src={`http://localhost:3000${planDetails.plan.image}`}
                                        alt={planDetails.plan.name}
                                        className="bookGEYS-plan-details-image"
                                    />
                                ) : (
                                    <div className="bookGEYS-plan-details-no-image">
                                        <p>No hay imagen disponible</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bookGEYS-plan-details-info">
                            <header className="bookGEYS-plan-details-header">
                                <h1 className="bookGEYS-plan-details-title">{planDetails.plan.name}</h1>
                                <div className="bookGEYS-plan-details-specs">
                                    <div className="bookGEYS-plan-details-spec">
                                        <Users size={20} className="bookGEYS-plan-details-spec-icon" />
                                        <span>Capacidad para {planDetails.plan.capacity} personas</span>
                                    </div>
                                    <div className="bookGEYS-plan-details-spec">
                                        <DollarSign size={20} className="bookGEYS-plan-details-spec-icon" />
                                        <span>${planDetails.plan.salePrice.toLocaleString()}</span>
                                    </div>
                                    <div className="bookGEYS-plan-details-spec">
                                        <CalendarDays size={20} className="bookGEYS-plan-details-spec-icon" />
                                        <span>
                                            {format(parseISO(plan.startDate), 'd/M/yyyy', { locale: es })} - {format(parseISO(plan.endDate), 'd/M/yyyy', { locale: es })}
                                        </span>
                                    </div>
                                </div>
                            </header>

                            <div className="bookGEYS-plan-details-sections">
                                <article className="bookGEYS-plan-details-description">
                                    <h2 className="section-title">Descripción</h2>
                                    <p className="bookGEYS-plan-details-text">
                                        {planDetails.plan.description || "Sin descripción disponible"}
                                    </p>
                                </article>

                                <article className="bookGEYS-plan-details-services">
                                    <h2 className="section-title">Servicios Incluidos</h2>
                                    {planDetails.plan.Services && planDetails.plan.Services.length > 0 ? (
                                        <div className="bookGEYS-plan-details-service-tags">
                                            {planDetails.plan.Services.map((service) => (
                                                <div
                                                    key={service.Id_Service}
                                                    className="bookGEYS-plan-details-service-badge"
                                                >
                                                    <CheckCircle size={16} className="bookGEYS-plan-details-service-icon" />
                                                    <span className="bookGEYS-plan-details-service-text">
                                                        {service.name} (x{service.quantity})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="bookGEYS-plan-details-no-services">
                                            No hay servicios registrados
                                        </p>
                                    )}
                                </article>
                                <article className="bookGEYS-plan-details-cabins">
                                    <h2 className="section-title">Cabañas Incluidas</h2>
                                    {planDetails.cabinDistribution && planDetails.cabinDistribution.length > 0 ? (
                                        <div className="bookGEYS-plan-details-cabin-list">
                                            {planDetails.cabinDistribution.map((cabin) => (
                                                <div key={cabin.capacity} className="bookGEYS-plan-details-cabin-item">
                                                    <span className="bookGEYS-plan-details-cabin-capacity">Cabaña para - {cabin.capacity} personas</span>
                                                    <span className="bookGEYS-plan-details-cabin-name">
                                                        Cantidad de cabañas: {cabin.requestedQuantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="bookGEYS-plan-details-no-cabins">
                                            No hay cabañas registradas
                                        </p>
                                    )}
                                </article>
                                <article className="bookGEYS-plan-details-rooms">
                                    <h2 className="section-title">Habitaciones Incluidas</h2>
                                    {planDetails.bedroomDistribution && planDetails.bedroomDistribution.length > 0 ? (
                                        <div className="bookGEYS-plan-details-room-list">
                                            {planDetails.bedroomDistribution.map((room) => (
                                                <div key={room.capacity} className="bookGEYS-plan-details-room-item">
                                                    <span className="bookGEYS-plan-details-room-capacity">Habitación para - {room.capacity} personas</span>
                                                    <span className="bookGEYS-plan-details-room-name">
                                                        Cantidad de habitaciones: {room.requestedQuantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="bookGEYS-plan-details-no-rooms">
                                            No hay habitaciones registradas
                                        </p>
                                    )}
                                </article>
                            </div>

                            <div className="bookGEYS-plan-details-footer">
                                <button className="bookGEYS-plan-details-reserve-button">
                                    Reservar Ahora
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        );
    }
    if (isloading) {
        return <div className="bookGEYS-plan-details-loading">Cargando detalles del plan...</div>;
    }

};

export default PlanDetail;