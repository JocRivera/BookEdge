import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { CustomButton, ActionButtons } from "../../common/Button/customButton";
import { getAllPlans, deletePlan, updatePlan, createPlan } from "../../../services/PlanService";
import FormPlans from "./FormPlans";
import ViewDetail from './ViewDetail';
import "./componentPlan.css";

function Plan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await getAllPlans();
            setData(response);
        } catch (error) {
            console.error("Error al obtener los planes:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [isModalOpen]);

    const handleSavePlan = async (planData) => {
        try {
            let updatedPlan
            if (selectedPlan) {
                if (!planData.get("image") || planData.get("image") === "") {
                    // Eliminar el campo vacío para que el backend mantenga la imagen existente
                    planData.delete("image")
                  }
                // Editar plan existente
                updatedPlan = await updatePlan(selectedPlan.idPlan, planData)
                // Actualizar el plan en el estado local
                fetchData()
            } else {
                // Crear nuevo plan
                updatedPlan = await createPlan(planData)
                fetchData()
            }
            setIsModalOpen(false)
            setSelectedPlan(null)
        } catch (error) {
            console.error("Error al guardar el plan:", error)
        }
    }

    const handleDeletePlan = async (planId) => {
        await deletePlan(planId);
        fetchData();
    }

    return (
        <section className="container-plans">
            <div className="title-container">
                <h1 className="title-plan">Nuestros Planes</h1>
            </div>

            <div className="plan-search">
                <div className="search-container">
                    <CiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search"
                        placeholder="Buscar planes..."
                    />
                </div>
                <CustomButton
                    variant="primary"
                    icon="add"
                    onClick={() => setIsModalOpen(true)}
                >
                    Agregar Plan
                </CustomButton>
            </div>

            <div className="plans-grid">
                {data.map((plan) => (
                    <div key={plan.idPlan} className="plan-card">
                        <div className="plan-image">
                            {plan.image ? (
                                <img
                                    src={`http://localhost:3000${plan.image}`}
                                    alt={plan.name}
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible"
                                    }}
                                />
                            ) : (
                                <div className="image-placeholder">
                                    <span>Sin imagen</span>
                                </div>
                            )}
                        </div>
                        <div className="plan-content">
                            <div className="plan-header">
                                <h3 className="plan-title">{plan.name}</h3>
                                <span className="plan-price">${plan.salePrice.toLocaleString()}</span>
                            </div>
                            <p className="plan-description">{plan.description}</p>
                            <div className="plan-meta">
                                {/* <span className="meta-item">
                                    <i className="far fa-clock"></i> {plan.duration}
                                </span> */}
                                <span className="meta-item">
                                    <i className="far fa-user"></i> {plan.capacity} personas
                                </span>
                            </div>
                            <div className="plan-actions">
                                <div></div>
                                <div className="action-buttons">
                                    <ActionButtons
                                        onView={() => {
                                            setSelectedPlan(plan);
                                            setIsDetailModalOpen(true);
                                        }}
                                        onEdit={() => {
                                            setSelectedPlan(plan);
                                            setIsModalOpen(true);
                                        }}
                                        onDelete={() => handleDeletePlan(plan.idPlan)}
                                    ></ActionButtons>

                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <FormPlans
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPlan(null);
                }}
                onSave={handleSavePlan}
                planToEdit={selectedPlan}
            />

            <ViewDetail
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPlan(null);
                }}
                plan={selectedPlan}
            />
        </section>
    );
}

export default Plan;