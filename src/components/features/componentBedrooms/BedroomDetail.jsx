import React from "react";
import { MdClose, MdPerson } from "react-icons/md";
import "./BedroomCard.css";

const BedroomDetail = ({ isOpen, onClose, bedroom, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container detail-modal">
        <div className="modal-header">
          <h2>Detalles de la Habitación</h2>
          <button className="close-button" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        {loading ? (
          <div className="loading-details">
            <p>Cargando detalles...</p>
          </div>
        ) : !bedroom ? (
          <div className="error-details">
            <p>No se pudo cargar la información de la habitación</p>
          </div>
        ) : (
          <div className="bedroom-detail-content">
            <div className="bedroom-detail-image">
              <img
                src={`http://localhost:3000/uploads/${bedroom.imagen}`}
                alt={bedroom.name}
                onError={(e) => {
                  e.target.style.objectFit = "contain";
                  e.target.onerror = null;
                }}
              />
            </div>

            <div className="bedroom-detail-info">
              <div className="detail-header">
                <h3>{bedroom.name}</h3>
                <span
                  className={`bedroom-status ${
                    bedroom.status === "En Mantenimiento"
                      ? "status-en-mantenimiento"
                      : bedroom.status === "En Servicio"
                      ? "status-en-servicio"
                      : "status-fuera-de-servicio"
                  }`}
                >
                  {bedroom.status}
                </span>
              </div>

              <div className="detail-section">
                <h4>Descripción</h4>
                <p>{bedroom.description || "Sin descripción disponible"}</p>
              </div>

              <div className="detail-section">
                <div className="capacity-detail">
                  <MdPerson className="icon-person" />
                <h4>Capacidad</h4>
                  <span>:{bedroom.capacity || "No especificada"}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4 className="tittlecomodiades">Comodidades</h4>
                <div className="comforts-detail">
                  {bedroom.Comforts && bedroom.Comforts.length > 0 ? (
                    <div className="all-comforts">
                      {bedroom.Comforts.map((comfort) => (
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

        <div className="modal-footer-detail">
          <button className="cancel-btn-detail" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BedroomDetail;