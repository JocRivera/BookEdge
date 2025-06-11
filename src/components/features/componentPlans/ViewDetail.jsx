import React from 'react';
import './ViewDetail.css';

const ViewDetail = ({ plan, isOpen, onClose }) => {
    if (!isOpen || !plan) return null;

    return (
        <div className="bookEdge-planDetail-modalOverlay">
            <div className="bookEdge-planDetail-modal">
                <div className="bookEdge-planDetail-modalHeader">
                    <h2 className="bookEdge-planDetail-title">Detalle del Plan</h2>
                    <button className="bookEdge-planDetail-closeButton" onClick={onClose}>×</button>
                </div>
                <div className="bookEdge-planDetail-content">
                    {/* Sección de información básica */}
                    <section className="bookEdge-planDetail-section">
                        <h3 className="bookEdge-planDetail-sectionTitle">Información Básica</h3>
                        <div className="bookEdge-planDetail-basicInfo">
                            <div className="bookEdge-planDetail-imageContainer">
                                {plan.image ? (
                                    <img
                                        src={`https://backendbookedge-1.onrender.com${plan.image}`}
                                        alt={plan.name}
                                        onError={e => {
                                            e.target.style.objectFit = "contain";
                                            e.target.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <div className="bookEdge-planDetail-imagePlaceholder">
                                        <span>Sin imagen</span>
                                    </div>
                                )}
                            </div>
                            <div className="bookEdge-planDetail-info">
                                <h4 className="bookEdge-planDetail-name">{plan.name}</h4>
                                <p className="bookEdge-planDetail-description">{plan.description}</p>
                                <div className="bookEdge-planDetail-metaInfo">
                                    <span className="bookEdge-planDetail-capacity">
                                        <i className="far fa-user"></i> {plan.capacity} personas
                                    </span>
                                    <span className="bookEdge-planDetail-price">
                                        <i className="fas fa-tag"></i> ${plan.salePrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección de cabañas */}
                    <section className="bookEdge-planDetail-section">
                        <h3 className="bookEdge-planDetail-sectionTitle">Cabañas Disponibles</h3>
                        <div className="bookEdge-planDetail-tableContainer">
                            <table className="bookEdge-planDetail-table">
                                <thead>
                                    <tr>
                                        <th>Capacidad</th>
                                        <th>Cantidad Solicitada</th>
                                        <th>Cabañas Disponibles</th>
                                        <th>Capacidad Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.cabinDistribution?.map((dist, index) => (
                                        <tr key={index}>
                                            <td>{dist.capacity} personas</td>
                                            <td>{dist.requestedQuantity}</td>
                                            <td>
                                                <ul className="bookEdge-planDetail-assignedList">
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
                    <section className="bookEdge-planDetail-section">
                        <h3 className="bookEdge-planDetail-sectionTitle">Habitaciones Disponibles</h3>
                        <div className="bookEdge-planDetail-tableContainer">
                            <table className="bookEdge-planDetail-table">
                                <thead>
                                    <tr>
                                        <th>Capacidad</th>
                                        <th>Cantidad Solicitada</th>
                                        <th>Habitaciones Disponibles</th>
                                        <th>Capacidad Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plan.bedroomDistribution?.map((dist, index) => (
                                        <tr key={index}>
                                            <td>{dist.capacity} personas</td>
                                            <td>{dist.requestedQuantity}</td>
                                            <td>
                                                <ul className="bookEdge-planDetail-assignedList">
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
                    <section className="bookEdge-planDetail-section">
                        <h3 className="bookEdge-planDetail-sectionTitle">Servicios Incluidos</h3>
                        <div className="bookEdge-planDetail-tableContainer">
                            <table className="bookEdge-planDetail-table">
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
                                        <td colSpan="3" className="bookEdge-planDetail-totalLabel">Total Servicios:</td>
                                        <td className="bookEdge-planDetail-totalAmount">${plan.total.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>
                </div>
                <div className="bookEdge-planDetail-modalFooter">
                    <button className="bookEdge-planDetail-closeBtn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default ViewDetail;