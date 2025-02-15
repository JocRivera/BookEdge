import React, { useState } from "react";
import {CustomButton, ActionButtons} from "../../common/Button/customButton";
import "./createClientes.css";

export default function CreateClientes() {
  const [clients, setClients] = useState([
    {
      id: 1,
      fullName: "John Doe",
      documentType: "DNI",
      documentNumber: "12345678",
      phoneNumber: "1234567890",
      birthDate: "1990-01-01",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      fullName: "Jane Doe",
      documentType: "DNI",
      documentNumber: "87654321",
      phoneNumber: "9876543210",
      birthDate: "1995-05-05",
      email: "jane.doe@example.com",
    },
  ]);

  const handleView = (id) => {
    console.log('Ver cliente:', id);
  };

  const handleEdit = (id) => {
    console.log('Editar cliente:', id);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  return (
    <div className="container-clients">
      <header className="clients-header">
        <h1>Listado de clientes</h1>
      <CustomButton
          variant="primary"
          icon="add"
          onClick={() => alert("Agregando cliente")}
          className="add-client-button"
        >
          Agregar cliente
        </CustomButton>
       
      </header>

      <table className="clients-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nombre Completo</th>
            <th>Tipo de documento</th>
            <th>Número de documento</th>
            <th>Número de celular</th>
            <th>Fecha de nacimiento</th>
            <th>Correo electrónico</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.fullName}</td>
              <td>{client.documentType}</td>
              <td>{client.documentNumber}</td>
              <td>{client.phoneNumber}</td>
              <td>{new Date(client.birthDate).toLocaleDateString()}</td>
              <td>{client.email}</td>
              <td>
                 
              <ActionButtons
                  onView={() => handleView(client.id)}
                  onEdit={() => handleEdit(client.id)}
                  onDelete={() => handleDelete(client.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
