import React, { useState, useEffect } from "react";
import "./createClientes.css";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../../../services/usersService";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import FormUser from "./formClients";
import Pagination from "../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import Switch from "../../common/Switch/Switch";
import { useAuth } from "../../../context/authContext";

function TableUser() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { hasPermission, user } = useAuth();

  const filtrarDatos = users.filter((user) =>
    Object.values(user).some((value) =>
      value && typeof value === 'object' 
        ? Object.values(value).some(v => v && v.toString().toLowerCase().includes(searchTerm.toLowerCase()))
        : value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * itemsPerPage;
  const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);
  useEffect(() => setCurrentPage(0), [searchTerm]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.log("Error al obtener usuarios, usando datos de prueba", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    const userToEdit = users.find((user) => user.idUser === id);
    setCurrentUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro que deseas eliminar este usuario?")) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user.idUser !== id));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.idUser) {
        await updateUser(userData.idUser, userData);
      } else {
        await createUser(userData);
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Error al guardar usuario:",
        error.response?.data?.message || error.message
      );
    }
  };

  const handleToggleE = async (id, currentStatus) => {
    try {
      // Ahora pasamos directamente el estado contrario al actual
      await toggleUserStatus(id, { status: !currentStatus });
      fetchUsers(); 
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo cambiar el estado");
    }
  };

  return (
    <div className="user-table-container">
      <div className="user-table-header-container">
        <h2 className="user-table-header-title">Tabla de Usuarios</h2>
      </div>
      <div className="user-search-container">
        <CiSearch className="user-search-icon" />
        <input
          type="text"
          className="user-search-input"
          value={searchTerm}
          placeholder="Buscar usuario..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {hasPermission("Usuarios", "post") && (
          <CustomButton variant="primary" icon="add" onClick={handleAdd}>
            Agregar Usuario
          </CustomButton>
        )}
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead className="user-table-head">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Tipo Identificación</th>
              <th>Identificación</th>
              <th>Correo Electrónico</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>EPS</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="user-table-body">
            {currentItems.map((user, index) => (
              <tr
                key={user.idUser}
                className={index % 2 === 0 ? "user-table-row-even" : "user-table-row-odd"}
              >
                <td className="user-table-cell">{user.idUser}</td>
                <td className="user-table-cell">{user.name}</td>
                <td className="user-table-cell">{user.identificationType}</td>
                <td className="user-table-cell">{user.identification}</td>
                <td className="user-table-cell">{user.email}</td>
                <td className="user-table-cell">{user.cellphone}</td>
                <td className="user-table-cell">{user.address}</td>
                <td className="user-table-cell">{user.eps}</td>
                <td className="user-table-cell">{user.role?.name || "Sin rol"}</td>
                <td className="user-table-cell">
                  <Switch
                    isOn={user.status === true}
                    handleToggle={() => handleToggleE(user.idUser, user.status)}
                    id={`status-${user.idUser}`}
                  />
                </td>
                <td className="user-table-cell">
                  <ActionButtons
                    onEdit={() => handleEdit(user.idUser)}
                    onDelete={() => handleDelete(user.idUser)}
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