// src/features/componentClients/tableClients.jsx

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
import { useAuth } from "../../../context/authContext"; // user (usuario logueado) viene de aquí
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAlert } from "../../../context/AlertContext";

function TableUser() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Para el error de fetchUsers

  const { hasPermission, user: loggedInUser } = useAuth(); // Renombrar user a loggedInUser para claridad
  const { showAlert } = useAlert();

  // FiltrarDatos ahora usa userItem para la iteración
  const filtrarDatos = users.filter((userItem) => {
    const name = userItem?.name?.toLowerCase() || "";
    const identification = userItem?.identification?.toLowerCase() || "";
    // Convertir booleano a string para búsqueda, o manejar como quieras
    const status =
      typeof userItem?.status === "boolean"
        ? userItem.status
          ? "activo"
          : "inactivo"
        : "";
    const eps = userItem?.eps?.toLowerCase() || "";
    const roleName = userItem?.role?.name?.toLowerCase() || ""; // Asumiendo que quieres filtrar por rol

    // Quitamos userItem.Users, ya que no parece ser una propiedad directa del usuario individual
    return `${name} ${identification} ${status} ${eps} ${roleName}`
      .toLowerCase() // Aplicar toLowerCase una vez a la cadena completa
      .includes(searchTerm.toLowerCase());
  });

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
      setUsers(data || []); // Asegurar que sea un array
      setError(null);
    } catch (fetchError) {
      // Renombrar la variable de error del catch
      console.error("Error al obtener usuarios:", fetchError);
      const errorMessage = fetchError.message || "Error al cargar usuarios";
      setError(errorMessage);
      toast.error(`Error al cargar usuarios: ${errorMessage}`);
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

  const handleEdit = (userToEdit) => {
    // Recibe el objeto user completo
    showAlert({
      type: "confirm-edit",
      title: "Confirmar Modificación",
      message: `¿Desea modificar los datos del usuario "${userToEdit.name}"?`,
      confirmText: "Sí, Modificar",
      onConfirm: () => {
        setCurrentUser(userToEdit);
        setIsModalOpen(true);
      },
    });
  };

  const handleDelete = async (userToDelete) => {
    // Recibe el objeto user completo
    showAlert({
      type: "confirm-delete",
      title: "Confirmar Eliminación",
      message: `¿Está seguro que deseas eliminar al usuario "${userToDelete.name}"? Esta acción no se puede deshacer.`,
      confirmText: "Sí, Eliminar",
      onConfirm: async () => {
        try {
          await deleteUser(userToDelete.idUser);
          setUsers((prevUsers) =>
            prevUsers.filter((u) => u.idUser !== userToDelete.idUser)
          );
          toast.success(
            `Usuario "${userToDelete.name}" eliminado correctamente.`
          );
        } catch (deleteErr) {
          // Renombrar la variable de error del catch
          console.error("Error al eliminar usuario:", deleteErr);
          const errorMessage =
            deleteErr.response?.data?.message ||
            deleteErr.message ||
            "Error al eliminar el usuario.";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleSaveUser = async (userData) => {
    try {
      if (userData.idUser) {
        await updateUser(userData.idUser, userData);
        toast.success(`Usuario "${userData.name}" actualizado correctamente.`); // Mensaje más específico
      } else {
        await createUser(userData);
        toast.success(`Usuario "${userData.name}" creado correctamente.`); // Mensaje más específico
      }
      fetchUsers();
      setIsModalOpen(false);
      return true;
    } catch (saveErr) {
      // Renombrar la variable de error del catch
      console.error(
        "Error al guardar usuario:",
        saveErr.response?.data?.message || saveErr.message
      );
      // El toast de error específico (si es de validación) se maneja en FormUser
      // si el error es relanzado y atrapado allí.
      // Si no, este throw hará que se muestre un error en la consola.
      throw saveErr;
    }
  };

  const handleToggleE = async (id, currentStatus, name) => {
    const newStatus = !currentStatus;
    const actionText = newStatus ? "activar" : "desactivar";
    const newStatusText = newStatus ? "Activo" : "Inactivo";

    showAlert({
      type: "confirm-edit", // O un tipo específico como 'confirm-status'
      title: `Confirmar Cambio de Estado`,
      message: `¿Está seguro de que desea ${actionText} al usuario "${name}"? Su nuevo estado será "${newStatusText}".`,
      confirmText: `Sí, ${
        actionText.charAt(0).toUpperCase() + actionText.slice(1)
      }`,
      onConfirm: async () => {
        try {
          await toggleUserStatus(id, { status: newStatus });
          toast.success(
            `Estado del usuario "${name}" cambiado a "${newStatusText}" correctamente.`
          );
          fetchUsers();
        } catch (toggleErr) {
          // Renombrar la variable de error del catch
          console.error("Error al cambiar estado:", toggleErr);
          const errorMessage =
            toggleErr.response?.data?.message ||
            toggleErr.message ||
            "No se pudo cambiar el estado.";
          toast.error(errorMessage);
        }
      },
    });
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
        {loading && users.length === 0 ? ( // Mostrar loading solo si no hay datos aún
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : error && users.length === 0 ? ( // Mostrar error solo si no hay datos y falló la carga
          <div className="error-message">
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="comfort-cancel-btn"
              style={{ marginTop: "10px" }}
            >
              Reintentar
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
                    <td colSpan={11} className="no-data-row">
                      {" "}
                      {/* Ajusta colSpan al número de columnas */}
                      {searchTerm
                        ? `No se encontraron usuarios para "${searchTerm}"`
                        : "No hay usuarios registrados."}
                    </td>
                  </tr>
                ) : (
                  // AQUÍ ES EL CAMBIO PRINCIPAL: user a userItem
                  currentItems.map((userItem, index) => (
                    <tr
                      key={userItem.idUser} // Usar userItem
                      className={
                        index % 2 === 0
                          ? "user-table-row-even"
                          : "user-table-row-odd"
                      }
                    >
                      <td className="user-table-cell">{userItem.idUser}</td>
                      <td className="user-table-cell">{userItem.name}</td>
                      <td className="user-table-cell">
                        {userItem.identificationType}
                      </td>
                      <td className="user-table-cell">
                        {userItem.identification}
                      </td>
                      <td className="user-table-cell">{userItem.email}</td>
                      <td className="user-table-cell">{userItem.cellphone}</td>
                      <td className="user-table-cell">
                        {userItem.address || "-"}
                      </td>
                      <td className="user-table-cell">{userItem.eps || "-"}</td>
                      <td className="user-table-cell">
                        {userItem.role?.name || "Sin rol"}
                      </td>
                      <td className="user-table-cell">
                        <Switch
                          isOn={userItem.status === true}
                          handleToggle={
                            () =>
                              handleToggleE(
                                userItem.idUser,
                                userItem.status,
                                userItem.name
                              ) // Pasar userItem.name
                          }
                          id={`status-${userItem.idUser}`}
                        />
                      </td>
                      <td className="user-table-cell">
                        <div className="action-buttons-container">
                          <ActionButtons
                            onEdit={() => handleEdit(userItem)} // Pasar userItem
                            onDelete={() => handleDelete(userItem)} // Pasar userItem
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pageCount > 1 &&
              !loading && ( // No mostrar paginación si está cargando
                <Pagination
                  pageCount={pageCount}
                  onPageChange={handlePageClick}
                  forcePage={currentPage}
                />
              )}
          </>
        )}
      </div>
      {isModalOpen && ( // Renderizar condicionalmente
        <FormUser
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userData={currentUser}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

export default TableUser;
