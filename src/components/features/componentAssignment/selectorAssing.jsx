import { useState } from "react";
import CabinComfortsCards from "./Cabin/AssignAmenitiesTable ";
import RoomComfortsCards from "./Bedroom/AssignAmenitiesTable";
import { CustomButton } from "../../../components/common/Button/customButton";
import { MdCabin, MdBed } from "react-icons/md";
import { FaArrowCircleLeft } from "react-icons/fa";
import "./selectorAssing.css";

const ComfortAssignmentSelector = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleBackToSelection = () => {
    setSelectedOption(null);
  };

  const renderContent = () => {
    if (!selectedOption) {
      return (
        <div className="selection-container">
          <h1 className="selection-title">Asignación de Comodidades</h1>
          <p className="selection-subtitle">
            ¿A dónde deseas asignar comodidades?
          </p>

          <div className="option-cards">
            <div
              className="option-card cabin-card"
              onClick={() => handleOptionSelect("cabins")}
            >
              <div className="option-icon cabin-icon">
                <MdCabin size={32} className="option-icon-svg" />
              </div>
              <h2>Cabañas</h2>
              <p>Asignar comodidades a cabañas disponibles</p>
            </div>

            <div
              className="option-card room-card"
              onClick={() => handleOptionSelect("rooms")}
            >
              <div className="option-icon room-icon">
                <MdBed size={32} className="option-icon-svg" />
              </div>
              <h2>Habitaciones</h2>
              <p>Asignar comodidades a habitaciones disponibles</p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="assignment-container">
          <div className="back-navigation">
            <button className="btn-volver" onClick={handleBackToSelection}>
              <FaArrowCircleLeft size={25} />
            </button>
          </div>

          {selectedOption === "cabins" ? (
            <CabinComfortsCards />
          ) : (
            <RoomComfortsCards />
          )}
        </div>
      );
    }
  };

  return <div className="comfort-assignment-wrapper">{renderContent()}</div>;
};

export default ComfortAssignmentSelector;
