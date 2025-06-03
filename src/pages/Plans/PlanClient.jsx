"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { ChevronLeft, ChevronRight, Users, DollarSign } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { getAllProgramedPlans } from "../../services/PlanProgramed"
import PlanDetail from "./PlanDetail"
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import "swiper/css"
import "./PlanClient.css"

function EnhancedPlanClient() {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { isAuthenticated } = useAuth()
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const handlePlanDetailClick = (plan) => {
        setSelectedPlan(plan)
        setIsModalOpen(true)
    }

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true)
                const data = await getAllProgramedPlans()
                const todayStr = format(new Date(), 'yyyy-MM-dd') // formato local

                const seenIds = new Set()

                const filteredPlans = data.filter((plan) => {
                    const startStr = plan.startDate
                    const endStr = plan.endDate
                    const isInRange =
                        plan.statusProgramed &&
                        (!startStr || todayStr >= startStr) &&
                        (!endStr || todayStr <= endStr)

                    const isUnique = !seenIds.has(plan.idPlan)

                    if (isInRange && isUnique) {
                        seenIds.add(plan.idPlan)
                        return true
                    }

                    return false
                })


                if (filteredPlans.length === 0) {
                    throw new Error("No hay planes disponibles en este momento.")
                }
                setPlans(filteredPlans)
            } catch (err) {
                setError(err.message || "Error al cargar los planes")
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [])

    const handleReserveClick = (plan) => {
        if (!isAuthenticated) {
            navigate("/login", { state: { from: "/plans" } })
            return
        }
        // TODO: Implementar navegación a formulario de reserva
        // navigate(`/plans/${plan.Plan.idPlanProgramed}/reserve`)
        // Navegar al formulario de reserva pasando los datos del plan
        navigate("/reservationsCustomer")
    }

    if (loading) {
        return (
            <section className="enhanced-plans-main-container">
                <div className="enhanced-plans-loading">
                    <div>Cargando planes disponibles...</div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="enhanced-plans-main-container">
                <div className="enhanced-plans-error">
                    <div>
                        <strong>Error:</strong> {error}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="enhanced-plans-main-container">
            <header className="enhanced-plans-header">
                <h2 className="enhanced-plans-title">Planes Disponibles</h2>
                <p className="enhanced-plans-subtitle">
                    Descubre nuestros planes exclusivos y vive experiencias únicas en destinos increíbles
                </p>
            </header>

            <div className="enhanced-plans-swiper-container">
                <div className="enhanced-plans-navigation">
                    <button className="enhanced-plans-nav-button enhanced-plans-nav-prev">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="enhanced-plans-nav-button enhanced-plans-nav-next">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <Swiper
                    modules={[Navigation]}
                    navigation={{
                        nextEl: ".enhanced-plans-nav-next",
                        prevEl: ".enhanced-plans-nav-prev",
                    }}
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 25,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                        1200: {
                            slidesPerView: 3,
                            spaceBetween: 35,
                        },
                    }}
                    loop={plans.length > 3}
                    centeredSlides={false}
                    grabCursor={true}
                >
                    {plans.map((plan, index) => (
                        <SwiperSlide key={plan.idPlanProgramed}>
                            <article
                                className="enhanced-plans-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => handlePlanDetailClick(plan)} // Abre el modal al hacer clic en la tarjeta
                            >
                                <div className="enhanced-plans-image-wrapper">
                                    {plan.Plan.image ? (
                                        <img
                                            src={`http://localhost:3000${plan.Plan.image}`}
                                            alt={plan.Plan.name}
                                            className="enhanced-plans-image"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="enhanced-plans-no-image">
                                            <div>
                                                <strong>Sin Imagen Disponible</strong>
                                                <br />
                                                {plan.Plan.name}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="enhanced-plans-overlay" />

                                <div className="enhanced-plans-content">
                                    <h3 className="enhanced-plans-card-title">{plan.Plan.name}</h3>

                                    {plan.Plan.description && (
                                        <p className="enhanced-plans-description">{plan.Plan.description}</p>
                                    )}

                                    <div className="enhanced-plans-meta-info">
                                        <span className="enhanced-plans-price-tag">
                                            <DollarSign size={20} />
                                            {plan.Plan.salePrice.toLocaleString()}
                                        </span>
                                        <span className="enhanced-plans-capacity-tag">
                                            <Users size={18} />
                                            {plan.Plan.capacity} personas
                                        </span>
                                    </div>

                                    <button
                                        className="enhanced-plans-reserve-button"
                                        onClick={(e) => {
                                            e.stopPropagation() // Evita que el clic se propague al article
                                            handleReserveClick(plan)
                                        }}
                                        aria-label={`Reservar plan ${plan.Plan.name}`}
                                    >
                                        Reservar Ahora
                                    </button>
                                </div>
                            </article>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            {selectedPlan && (
                <PlanDetail
                    plan={selectedPlan}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </section>
    )
}

export default EnhancedPlanClient
