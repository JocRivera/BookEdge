import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { CustomButton, ActionButtons } from "../../common/Button/customButton";
import { getAllPlans, deletePlan, updatePlan, createPlan } from "../../../services/PlanService";
import FormPlans from "./FormPlans";
import ViewDetail from './ViewDetail';
import { useAlert } from "../../../context/AlertContext";
import { toast } from "react-toastify";
import "./Plancss.css";

function Plan() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true); // NUEVO: estado de carga
    const [error, setError] = useState(null); // NUEVO: estado de error
    const { showAlert } = useAlert();

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllPlans();
            setData(response);
        } catch (error) {
            setError(error.message || "Error al obtener los planes");
        } finally {
            setIsLoading(false);
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
                toast.success(`Plan "${planData.get("name")}" actualizado correctamente.`);
            } else {
                updatedPlan = await createPlan(planData);
                toast.success(`Plan "${planData.get("name")}" creado correctamente.`);
            }
            fetchData();
            setIsModalOpen(false);
            setSelectedPlan(null);
        } catch (error) {
            console.error("Error al guardar el plan:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al guardar el plan.";
            toast.error(errorMessage);
            throw error;
        }
    };

    const handleDeletePlan = async (plan) => {
        showAlert({
            type: "confirm-delete",
            title: "Confirmar Eliminación",
            message: `¿Está seguro que desea eliminar el plan "${plan.name}"? Esta acción no se puede deshacer.`,
            confirmText: "Sí, Eliminar",
            onConfirm: async () => {
                try {
                    await deletePlan(plan.idPlan);
                    await fetchData();
                    toast.success(`Plan "${plan.name}" eliminado correctamente.`);
                } catch (error) {
                    console.error("Error al eliminar plan:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Error al eliminar el plan.";
                    toast.error(errorMessage);
                }
            }
        });
    };

    const handleEdit = (plan) => {
        showAlert({
            type: "confirm-edit",
            title: "Confirmar Modificación",
            message: `¿Desea modificar los datos del plan "${plan.name}"?`,
            confirmText: "Sí, Modificar",
            onConfirm: () => {
                setSelectedPlan(plan);
                setIsModalOpen(true);
            }
        });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPlans = data.filter((plan) =>
        `${plan.name} ${plan.description} ${plan.salePrice} ${plan.capacity}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleImageError = (e) => {
        e.target.style.objectFit = "contain";
        e.target.onerror = null;
    };

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
                {isLoading ? (
                    <div className="loading-indicator-admin">
                        <div className="loading-spinner-admin"></div>
                        <p>Cargando planes...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        {searchTerm
                            ? `No se encontraron resultados para "${searchTerm}"`
                            : "Error al cargar los planes"}
                    </div>
                ) : filteredPlans.length === 0 ? (
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
                                        src={`https://backendbookedge-1.onrender.com${plan.image}`}
                                        alt={plan.name}
                                        className="bookEdge-plans-card-img"
                                        onError={handleImageError}
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
                                            onEdit={() => handleEdit(plan)}
                                            onDelete={() => handleDeletePlan(plan)}
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