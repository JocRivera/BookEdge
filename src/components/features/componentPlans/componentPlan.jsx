import { CiSearch } from "react-icons/ci";
import { CustomButton } from "../../common/Button/customButton";
import "./componentPlan.css";

function Plan() {
    return (
        <section className="container-plans">
            <div className="title-container">
                <h1 className="title-plan">Nuestros Planes</h1>
            </div>

            <div className="plan-search">
                <div>
                    <CiSearch className="search-icon" />
                    <input
                        type="text"
                        className="search"
                        placeholder="Buscar ..."
                        // value={searchTerm}
                        onChange={(e) => {
                            // setSearchTerm(e.target.value);
                            // setCurrentPage(0); // Resetear a primera página al buscar
                        }}
                    />
                </div>
                <CustomButton
                    variant="primary"
                    icon="add"
                    onClick={() => {
                        // setSelectedPlan(null);
                        // setModalOpen(true);
                    }}
                >
                    Agregar Plan
                </CustomButton>
            </div>
        </section>
    );
}

export default Plan;