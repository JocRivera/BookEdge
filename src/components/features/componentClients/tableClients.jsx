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
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";

function TableUser() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { hasPermission, user } = useAuth();

  const filtrarDatos = users.filter((user) =>
    `${user.name} ${user.identification} ${user.status} ${user.eps} 
     ${user.Users?.map((c) => c.name).join(" ") || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * itemsPerPage;
  const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);
  useEffect(() => setCurrentPage(0), [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setError(error.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
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
      return true;
    } catch (error) {
      console.error(
        "Error al guardar usuario:",
        error.response?.data?.message || error.message
      );

      throw error;
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

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="user-table-container">
      <div className="user-table-header-container">
        <h2 className="user-table-header-title">Gestión de Usuarios</h2>
      </div>
      <div className="user-search-container">
        <div className="search-wrapper-user">
          <CiSearch className="search-icon-user" />
          <input
            type="text"
            className="search-input-user"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={handleClearSearch}
              aria-label="Limpiar búsqueda"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Agregar Usuario
        </CustomButton>
      </div>

      <div className="user-table-wrapper">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Cargando comodidades...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>
              <FaTimes />
            </button>
          </div>
        ) : (
          <>
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
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="no-data-row">
                      No se encontraron comodidades
                    </td>
                  </tr>
                ) : (
                  currentItems.map((user, index) => (
                    <tr
                      key={user.idUser}
                      className={
                        index % 2 === 0
                          ? "user-table-row-even"
                          : "user-table-row-odd"
                      }
                    >
                      <td className="user-table-cell">{user.idUser}</td>
                      <td className="user-table-cell">{user.name}</td>
                      <td className="user-table-cell">
                        {user.identificationType}
                      </td>
                      <td className="user-table-cell">{user.identification}</td>
                      <td className="user-table-cell">{user.email}</td>
                      <td className="user-table-cell">{user.cellphone}</td>
                      <td className="user-table-cell">{user.address}</td>
                      <td className="user-table-cell">{user.eps}</td>
                      <td className="user-table-cell">
                        {user.role?.name || "Sin rol"}
                      </td>
                      <td className="user-table-cell">
                        <Switch
                          isOn={user.status === true}
                          handleToggle={() =>
                            handleToggleE(user.idUser, user.status)
                          }
                          id={`status-${user.idUser}`}
                        />
                      </td>
                      <td className="user-table-cell">
                        <div className="action-buttons-container">
                          {" "}
                          {/* Nuevo contenedor */}
                          <button
                            onClick={() => handleEdit(user.idUser)}
                            className="action-btn edit-btn"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.idUser)}
                            className="action-btn delete-btn"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
          </>
        )}
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
