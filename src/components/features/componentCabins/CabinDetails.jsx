import React from "react";
import { MdClose, MdPerson } from "react-icons/md";
import "./CabinCard.css";

const CabinDetail = ({ isOpen, onClose, cabin, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container detail-modal">
        <div className="modal-header">
          <h2>Detalles de la Cabaña</h2>
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        {loading ? (
          <div className="loading-details">
            <p>Cargando detalles...</p>
          </div>
        ) : !cabin ? (
          <div className="error-details">
            <p>No se pudo cargar la información de la cabaña</p>
          </div>
        ) : (
          <div className="cabin-detail-content">
            <div className="cabin-detail-image">
              <img
                src={`http://localhost:3000/uploads/${cabin.imagen}`}
                alt={cabin.name}
                onError={(e) => {
                  e.target.style.objectFit = "contain";
                  e.target.onerror = null;
                }}
              />
            </div>

            <div className="cabin-detail-info">
              <div className="detail-header">
                <h3>{cabin.name}</h3>
                <span
                  className={`cabin-status ${
                    cabin.status === "En Mantenimiento"
                      ? "status-en-mantenimiento"
                      : cabin.status === "En Servicio"
                      ? "status-en-servicio"
                      : "status-fuera-de-servicio"
                  }`}
                >
                  {cabin.status}
                </span>
              </div>

              <div className="detail-section">
                <h4>Descripción</h4>
                <p>{cabin.description || "Sin descripción disponible"}</p>
              </div>

              <div className="detail-section">
                <h4>Capacidad</h4>
                <div className="capacity-detail">
                  <MdPerson className="icon-person" />
                  <span>{cabin.capacity || "No especificada"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Comodidades</h4>
                <div className="comforts-detail">
                  {cabin.Comforts && cabin.Comforts.length > 0 ? (
                    <div className="all-comforts">
                      {cabin.Comforts.map((comfort) => (
                        <span
                          key={comfort.idComfort || Math.random()}
                          className="comfort-badge"
                        >
                          {comfort.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="no-comforts">Sin comodidades asignadas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabinDetail;