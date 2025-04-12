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
import { useAuth } from "../../../context/AuthContext";
import{MODULES} from "../../../utils/modules"

function TableUser() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // permisos por módulo
  const { hasPermission } = useAuth();
  const MODULE = MODULES.USERS;


  const filtrarDatos = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleToggleE = async (id, estado) => {
    try {
      await toggleUserStatus(id, estado);
      fetchUsers();
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
        {hasPermission(MODULE, "create") && (
          <CustomButton variant="primary" icon="add" onClick={handleAdd}>
            Agregar Usuario
          </CustomButton>
        )}
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
              {(hasPermission(MODULE, "view") ||
                hasPermission(MODULE, "edit") ||
                hasPermission(MODULE, "delete")) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody className="table-body">
            {currentItems.map((user, index) => (
              <tr
                key={user.idUser}
                className={index % 2 === 0 ? "table-row-even" : "table-row-odd"}
              >
                <td className="table-cell">{user.idUser}</td>
                <td className="table-cell">{user.name}</td>
                <td className="table-cell">{user.identificationType}</td>
                <td className="table-cell">{user.identification}</td>
                <td className="table-cell">{user.email}</td>
                <td className="table-cell">{user.cellphone}</td>
                <td className="table-cell">{user.address}</td>
                <td className="table-cell">{user.role.name}</td>
                <td className="table-cell">
                  <Switch
                    isOn={user.status === true}
                    handleToggle={() =>
                      handleToggleE(user.idUser, { status: !user.status })
                    }
                    id={user.idUser}
                  />
                </td>
                {(hasPermission(MODULE, "view") ||
                  hasPermission(MODULE, "edit") ||
                  hasPermission(MODULE, "delete")) && (
                  <td className="table-cell">
                    <ActionButtons
                      onEdit={() => handleEdit(user.idUser)}
                      onDelete={() => handleDelete(user.idUser)}
                      canEdit={hasPermission(MODULE, "edit")}
                      canDelete={hasPermission(MODULE, "delete")}
                    />
                  </td>
                )}
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
