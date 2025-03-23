import React, { useState, useEffect } from "react";
import "./createClientes.css";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../services/usersService";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import FormUser from "./formClients";
import Pagination from "../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import Switch from "../../common/Switch/Switch";

function TableUser() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Juan Pérez",
      identificationType: "DNI",
      identification: "12345678",
      email: "juan@example.com",
      cellphone: "987654321",
      address: "Calle Falsa 123",
      rol: "Cliente",
      status: "Activo",
    },
    {
      id: 2,
      name: "María López",
      identificationType: "Pasaporte",
      identification: "A987654",
      email: "maria@example.com",
      cellphone: "123456789",
      address: "Av. Principal 456",
      rol: "Empleado",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Juan Pérez",
      identificationType: "DNI",
      identification: "12345678",
      email: "juan@example.com",
      cellphone: "987654321",
      address: "Calle Falsa 123",
      rol: "Cliente",
      status: "Activo",
    },
    {
      id: 4,
      name: "María López",
      identificationType: "Pasaporte",
      identification: "A987654",
      email: "maria@example.com",
      cellphone: "123456789",
      address: "Av. Principal 456",
      rol: "Empleado",
      status: "Inactivo",
    },
    {
      id: 5,
      name: "Juan Pérez",
      identificationType: "DNI",
      identification: "12345678",
      email: "juan@example.com",
      cellphone: "987654321",
      address: "Calle Falsa 123",
      rol: "Cliente",
      status: "Activo",
    },
    {
      id: 6,
      name: "María López",
      identificationType: "Pasaporte",
      identification: "A987654",
      email: "maria@example.com",
      cellphone: "123456789",
      address: "Av. Principal 456",
      rol: "Empleado",
      status: "Inactivo",
    },
    {
      id: 7,
      name: "Juan Pérez",
      identificationType: "DNI",
      identification: "12345678",
      email: "juan@example.com",
      cellphone: "987654321",
      address: "Calle Falsa 123",
      rol: "Cliente",
      status: "Activo",
    },
    {
      id: 8,
      name: "María López",
      identificationType: "Pasaporte",
      identification: "A987654",
      email: "maria@example.com",
      cellphone: "123456789",
      address: "Av. Principal 456",
      rol: "Empleado",
      status: "Inactivo",
    },
    {
      id: 9,
      name: "Juan Pérez",
      identificationType: "DNI",
      identification: "12345678",
      email: "juan@example.com",
      cellphone: "987654321",
      address: "Calle Falsa 123",
      rol: "Cliente",
      status: "Activo",
    },
    {
      id: 10,
      name: "María López",
      identificationType: "Pasaporte",
      identification: "A987654",
      email: "maria@example.com",
      cellphone: "123456789",
      address: "Av. Principal 456",
      rol: "Empleado",
      status: "Inactivo",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar primero
  const filtrarDatos = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación después de filtrar
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * itemsPerPage;
  const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  // Resetear paginación al buscar
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.log("Error al obtener usuarios, usando datos de prueba", error);
      }
    };
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    const userToEdit = users.find((user) => user.id === id);
    setCurrentUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este usuario?")) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.id) {
        await updateUser(userData.id, userData);
      } else {
        await createUser(userData);
      }
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const userToUpdate = users.find((user) => user.id === id);
      const newStatus =
        userToUpdate.status === "Activo" ? "Inactivo" : "Activo";
      await updateUser(id, { ...userToUpdate, status: newStatus });
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error al cambiar el estado del usuario:", error);
    }
  };

  return (
    <div className="table-container">
      <div className="title-container">
        <h2 className="table-title">Tabla de Usuarios</h2>
      </div>
      <div className="container-search">
        <CiSearch className="search-icon" />

        <input
          type="text"
          className="search"
          value={searchTerm}
          placeholder="Buscar usuario..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Agregar Usuario
        </CustomButton>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo Identificación</th>
              <th>Identificación</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {currentItems.map((user, index) => (
              <tr
                key={user.id}
                className={index % 2 === 0 ? "table-row-even" : "table-row-odd"}
              >
                <td className="table-cell">{user.id}</td>
                <td className="table-cell">{user.name}</td>
                <td className="table-cell">{user.identificationType}</td>
                <td className="table-cell">{user.identification}</td>
                <td className="table-cell">{user.email}</td>
                <td className="table-cell">{user.cellphone}</td>
                <td className="table-cell">{user.address}</td>
                <td className="table-cell">{user.rol}</td>
                <td className="table-cell">
                  <Switch
                    isOn={user.status === "Activo"}
                    handleToggle={(id) => {
                      console.log(`Cambiar estado del usuario ${id}`);
                      setUsers(
                        users.map((user) =>
                          user.id === id
                            ? {
                                ...user,
                                status:
                                  user.status === "Activo"
                                    ? "Inactivo"
                                    : "Activo",
                              }
                            : user
                        )
                      );
                    }}
                    id={user.id}
                  />
                </td>

                <td className="table-cell">
                  <ActionButtons
                    onEdit={() => handleEdit(user.id)}
                    onDelete={() => handleDelete(user.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
      </div>

      <FormUser
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={currentUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}

export default TableUser;
