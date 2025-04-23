import React from 'react';
import './ViewDetail.css';

const ViewDetail = ({ plan, isOpen, onClose }) => {
    if (!isOpen || !plan) return null;

    return (
        <div className="modal-overlay">
            <div className="plan-detail-modal">
                <div className="plan-detail-modal-header">
                    <h2>Detalle del Plan</h2>
                    <button className="plan-detail-close-button" onClick={onClose}>×</button>
                </div>
                <div className="plan-detail-content">
                    {/* Sección de información básica */}
                    <section className="plan-detail-section">
                        <h3 className="section-title">Información Básica</h3>
                        <div className="basic-info">
                            <div className="plan-image-container">
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
                            <div className="plan-info">
                                <h4>{plan.name}</h4>
                                <p className="description">{plan.description}</p>
                                <div className="meta-info">
                                    <span className="capacity">
                                        <i className="far fa-user"></i> {plan.capacity} personas
                                    </span>
                                    <span className="price">
                                        <i className="fas fa-tag"></i> ${plan.salePrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección de cabañas */}
                    <section className="plan-detail-section">
                        <h3 className="section-title">Cabañas Asignadas</h3>
                        <div className="table-container">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Capacidad</th>
                                        <th>Cantidad Solicitada</th>
                                        <th>Cabañas Asignadas</th>
                                        <th>Capacidad Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.cabinDistribution?.map((dist, index) => (
                                        <tr key={index}>
                                            <td>{dist.capacity} personas</td>
                                            <td>{dist.requestedQuantity}</td>
                                            <td>
                                                <ul className="assigned-cabins">
                                                    {dist.assignedCabins.map(cabin => (
                                                        <li key={cabin.idCabin}>{cabin.name}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>{dist.capacity * dist.requestedQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Sección de bedrooms */}
                    <section className="plan-detail-section">
                        <h3 className="section-title">Habitaciones Asignadas</h3>
                        <div className="table-container">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Capacidad</th>
                                        <th>Cantidad Solicitada</th>
                                        <th>Habitaciones Asignadas</th>
                                        <th>Capacidad Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.bedroomDistribution?.map((dist, index) => (
                                        <tr key={index}>
                                            <td>{dist.capacity} personas</td>
                                            <td>{dist.requestedQuantity}</td>
                                            <td>
                                                <ul className="assigned-cabins">
                                                    {dist.assignedBedrooms.map(bedroom => (
                                                        <li key={bedroom.idRoom}>{bedroom.name}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>{dist.capacity * dist.requestedQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Sección de servicios */}
                    <section className="plan-detail-section">
                        <h3 className="section-title">Servicios Incluidos</h3>
                        <div className="table-container">
                            <table className="detail-table">
                                <thead>
                                    <tr>
                                        <th>Servicio</th>
                                        <th>Precio Unitario</th>
                                        <th>Cantidad</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.Services?.map((service, index) => (
                                        <tr key={index}>
                                            <td>{service.name}</td>
                                            <td>${service.Price.toLocaleString()}</td>
                                            <td>{service.PlanServices.quantity}</td>
                                            <td>
                                                ${(service.Price * service.PlanServices.quantity).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="total-label">Total Servicios:</td>
                                        <td className="total-amount">${plan.total.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>
                </div>
                <div className="plan-detail-modal-footer">
                    <button className="plan-detail-close-btn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ViewDetail;