import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { CustomButton, ActionButtons } from "../../common/Button/customButton";
import { getAllPlans, deletePlan, updatePlan, createPlan } from "../../../services/PlanService";
import FormPlans from "./FormPlans";
import ViewDetail from './ViewDetail';
import "./Plancss.css";

function Plan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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
            let updatedPlan;
            if (selectedPlan) {
                if (!planData.get("image") || planData.get("image") === "") {
                    planData.delete("image");
                }
                updatedPlan = await updatePlan(selectedPlan.idPlan, planData);
                fetchData();
            } else {
                updatedPlan = await createPlan(planData);
                fetchData();
            }
            setIsModalOpen(false);
            setSelectedPlan(null);
        } catch (error) {
            console.error("Error al guardar el plan:", error);
        }
    };

    const handleDeletePlan = async (planId) => {
        await deletePlan(planId);
        fetchData();
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPlans = data.filter((plan) =>
        `${plan.name} ${plan.description} ${plan.salePrice} ${plan.capacity}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <section className="bookEdge-plans-container">
            <div className="bookEdge-plans-title-wrapper">
                <h1 className="bookEdge-plans-heading">Nuestros Planes</h1>
            </div>

            <div className="bookEdge-plans-search-bar">
                <div className="bookEdge-plans-search-wrapper">
                    <CiSearch className="bookEdge-plans-search-icon" />
                    <input
                        type="text"
                        className="bookEdge-plans-search-input"
                        placeholder="Buscar planes..."
                        value={searchTerm}
                        onChange={handleSearch}
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

            <div className="bookEdge-plans-grid-container">
                {filteredPlans.length === 0 ? (
                    <div className="empty-state-admin">
                        {searchTerm
                            ? `No se encontraron resultados para "${searchTerm}"`
                            : "No hay planes disponibles"}
                    </div>
                ) : (
                    filteredPlans.map((plan) => (
                        <div key={plan.idPlan} className="bookEdge-plans-card">
                            <div className="bookEdge-plans-card-image-container">
                                {plan.image ? (
                                    <img
                                        src={`http://localhost:3000${plan.image}`}
                                        alt={plan.name}
                                        className="bookEdge-plans-card-img"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/300x200?text=Imagen+no+disponible";
                                        }}
                                    />
                                ) : (
                                    <div className="bookEdge-plans-card-placeholder">
                                        <span>Sin imagen</span>
                                    </div>
                                )}
                            </div>
                            <div className="bookEdge-plans-card-content">
                                <div className="bookEdge-plans-card-header">
                                    <h3 className="bookEdge-plans-card-title">{plan.name}</h3>
                                    <span className="bookEdge-plans-card-price">
                                        ${plan.salePrice.toLocaleString()}
                                    </span>
                                </div>
                                <p className="bookEdge-plans-card-description">{plan.description}</p>
                                <div className="bookEdge-plans-card-meta">
                                    <span className="bookEdge-plans-card-meta-item">
                                        <i className="far fa-user"></i> {plan.capacity} personas
                                    </span>
                                </div>
                                <div className="bookEdge-plans-card-actions">
                                    <div></div>
                                    <div className="bookEdge-plans-card-buttons">
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
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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