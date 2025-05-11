import { useEffect, useState } from "react"
import "./createConfig.css"
import { CustomButton, ActionButtons } from "../../common/Button/customButton"
import { CiSearch } from "react-icons/ci"
import Switch from "../../common/Switch/Switch"
import Pagination from "../../common/Paginator/Pagination";
import FormConfig from "./formConfig";
import rolesService from "../../../services/RolesService"
import toast, { Toaster } from 'react-hot-toast';
import { FaEdit, FaTrash, FaTimes, FaEye } from "react-icons/fa";
import DetailsConfig from "./detailsConfig";
export default function CreateConfig() {
    const [currentConfig, setCurrentConfig] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [settings, setSettings] = useState([]);
    const [isView, setIsView] = useState(false)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true)
            try {
                const roles = await rolesService.getRoles()
                setSettings(roles)
            } catch (error) {
                console.log(error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [])
    const [searchTerm, setSearchTerm] = useState("");
    const filtrarDatos = settings.filter((config) =>
        Object.values(config).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const itemsPerPage = 6;
    const [currentPage, setCurrentPage] = useState(0);
    const offset = currentPage * itemsPerPage;
    const currentItems = filtrarDatos.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filtrarDatos.length / itemsPerPage);
    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    const handleClearSearch = () => {
        setSearchTerm("");
    };
    const handleAdd = async () => {
        setCurrentConfig(null);
        setIsModalOpen(true);
    };
    const handleView = (idRol) => {
        const config = settings.find((config) => config.idRol === idRol);
        setCurrentConfig(config);
        setIsView(true);
    }
    const handleEdit = (idRol) => {
        const config = settings.find((config) => config.idRol === idRol);
        setCurrentConfig(config);
        setIsModalOpen(true);
        console.log(config)
    }
    const handleDelete = (idRol) => {
        const notify = () => toast.success('Rol eliminado corretamente');
        const notifyError = () => toast.error('Error al eliminar el rol');
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este rol?");
        if (confirmDelete) {
            rolesService.deleteRole(idRol).then(() => {
                setSettings(settings.filter((config) => config.idRol !== idRol))
                notify()
            }).catch((error) => {
                console.log(error)
                notifyError()
            })
        }
    }
    const handleSave = (setting) => {

        if (currentConfig) {
            console.log(currentConfig)
            const notify = () => toast.success('Rol Actualizado correctamente');
            rolesService.updateRole(currentConfig.idRol, setting).then((res) => {
                setSettings(settings.map((config) => config.idRol === currentConfig.idRol ? { ...config, ...setting } : config))
                // setCurrentConfig(null)
                // setIsModalOpen(false)
                notify()
            }).catch((error) => {
                console.log(error)
                toast.error(`Error al actualizar
                     ${error}`)
            }
            )
        }
        else {
            const notify = () => toast.success('Rol creado correctamente');
            rolesService.createRole(setting).then((res) => {
                setSettings([...settings, res])
                notify()
            }).catch((error) => {
                toast.error(`Error al crear,
                     ${error}`)
            })
        }
        console.log(setting);
    }
    const handleToggle = async (idRol) => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas cambiar el estado de este rol?");
        if (!confirmDelete) {
            return;
        }
        try {
            // Encontrar el rol actual
            const currentRole = settings.find(config => config.idRol === idRol);
            // Enviar actualización al backend
            await rolesService.changeStatus(idRol, !currentRole.status);

            // Actualizar estado local después de confirmación del backend
            setSettings(
                settings.map((config) =>
                    config.idRol === idRol ? { ...config, status: !config.status } : config
                )
            );
            toast.success('Estado actualizado correctamente');
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            toast.error('Error al actualizar el estado');
        }
    };
    return (
        <div className="table-container">
            <div className="title-container">
                <h2 className="table-title">Gestión de Roles</h2>
            </div>
            <div className="container-search">
                <div className="search-wrapper-comfort">
                    <CiSearch className="config-search-icon" />
                    <input
                        type="text"
                        className="comfort-search"
                        placeholder="Buscar rol..."
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
                    Agregar Rol
                </CustomButton>
            </div>

            <div className="comfort-table-wrapper">
                {loading ? (
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <p>Cargando roles...</p>
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
                        <table className="comfort-table">
                            <thead>
                                <tr className="comfort-table-header">
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="comfort-table-body">
                                {currentItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="no-data-row">
                                            No se encontraron roles
                                        </td>
                                    </tr>
                                ) : (
                                    currentItems.map((config) => (
                                        <tr key={config.idRol} className="comfort-table-row">
                                            <td>{config.idRol}</td>
                                            <td>{config.name}</td>
                                            <td>
                                                <Switch
                                                    isOn={config.status === true}
                                                    id={config.idRol}
                                                    handleToggle={() => handleToggle(config.idRol)}
                                                />
                                            </td>
                                            <td className="config-actions-cell">
                                                <button
                                                    onClick={() => handleView(config.idRol)}
                                                    className="config-action-btn config-view-btn"
                                                    title="Ver detalles"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(config.idRol)}
                                                    className="config-ction-btn config-edit-btn"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(config.idRol)}
                                                    className="config-action-btn config-delete-btn"
                                                    title="Eliminar"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {pageCount > 1 && (
                            <div className="pagination-container">
                                <Pagination
                                    pageCount={pageCount}
                                    onPageChange={handlePageClick}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <FormConfig
                    setting={currentConfig}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}

            <DetailsConfig
                currentConfig={currentConfig}
                isOpen={isView}
                onClose={() => setIsView(false)}
            />

            <Toaster />
        </div>

    )
}
