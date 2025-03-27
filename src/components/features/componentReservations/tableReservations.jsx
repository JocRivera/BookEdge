import React, { useState } from "react";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import "./componentsReservations.css";
import { CiSearch } from "react-icons/ci";
import FormReservation from "./formReservations.jsx";
import { FaCalendarAlt, FaUser, FaBed, FaMoneyBillWave } from "react-icons/fa";

function TableReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [reservations, setReservations] = useState([
    {
      id: 1,
      client: "Juan Pérez",
      room: "Habitación 201",
      checkIn: "2023-11-15",
      checkOut: "2023-11-20",
      status: "Confirmada",
      total: 750.00
    },
    {
      id: 2,
      client: "María García",
      room: "Suite 305",
      checkIn: "2023-11-18",
      checkOut: "2023-11-22",
      status: "Pendiente",
      total: 1200.00
    },
    {
      id: 3,
      client: "Carlos López",
      room: "Habitación 102",
      checkIn: "2023-11-20",
      checkOut: "2023-11-25",
      status: "Cancelada",
      total: 600.00
    },
  ]);

  const filtrarDatos = reservations.filter((reservation) =>
    Object.values(reservation).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * itemsPerPage;
  const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleAdd = () => {
    setCurrentReservation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    const reservationToEdit = reservations.find((reservation) => reservation.id === id);
    setCurrentReservation(reservationToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    console.log("Reservación Eliminada exitosamente", id);
    setReservations(reservations.filter(reservation => reservation.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setReservations(reservations.map(reservation => 
      reservation.id === id ? {...reservation, status: newStatus} : reservation
    ));
  };

  return (
    <div className="reservations-table-container">
      <div className="reservations-title-container">
        <h2 className="reservations-table-title">
          Reservas
        </h2>
      </div>
      <div className="reservations-container-search">
        <div className="search-container">
          <CiSearch className="search-icon" />
          <input
            type="text"
            className="search"
            placeholder="Buscar reservación..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Nueva Reserva
        </CustomButton>
      </div>
      <div className="reservations-table-wrapper">
        <table className="reservations-table">
          <thead className="reservations-table-header">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th> Habitación</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Estado</th>
              <th> Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="reservations-table-body">
            {currentItems.length > 0 ? (
              currentItems.map((reservation, index) => (
                <tr
                  key={reservation.id}
                  className={
                    index % 2 === 0
                      ? "reservations-table-row-even"
                      : "reservations-table-row-odd"
                  }
                >
                  <td className="reservations-table-cell">{reservation.id}</td>
                  <td className="reservations-table-cell">{reservation.client}</td>
                  <td className="reservations-table-cell">{reservation.room}</td>
                  <td className="reservations-table-cell">{reservation.checkIn}</td>
                  <td className="reservations-table-cell">{reservation.checkOut}</td>
                  <td className="reservations-table-cell">
                    <select
                      value={reservation.status}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      className={`status-select ${
                        reservation.status.toLowerCase()
                      }`}
                    >
                      <option value="Confirmada">Confirmada</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Cancelada">Cancelada</option>
                      <option value="Completada">Completada</option>
                    </select>
                  </td>
                  <td className="reservations-table-cell">${reservation.total.toFixed(2)}</td>
                  <td className="reservations-table-cell">
                    <ActionButtons
                      onEdit={() => handleEdit(reservation.id)}
                      onDelete={() => handleDelete(reservation.id)}
                      additionalActions={[
                        {
                          icon: "receipt",
                          tooltip: "Generar factura",
                          action: () => console.log("Generar factura", reservation.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No se encontraron reservaciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />

        <FormReservation
          isOpen={isModalOpen}
          reservationData={currentReservation}
          onClose={() => setIsModalOpen(false)}
          onSave={(newReservation) => {
            if (currentReservation) {
              // Editar reservación existente
              setReservations(reservations.map(res => 
                res.id === currentReservation.id ? newReservation : res
              ));
            } else {
              // Agregar nueva reservación
              setReservations([...reservations, {
                ...newReservation,
                id: Math.max(...reservations.map(r => r.id)) + 1
              }]);
            }
            setIsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default TableReservations;