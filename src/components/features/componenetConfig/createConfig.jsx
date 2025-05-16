import { useEffect, useState } from "react"
import "./createConfig.css"
import { CustomButton, ActionButtons } from "../../common/Button/customButton"
import { CiSearch } from "react-icons/ci"
import Switch from "../../common/Switch/Switch"
import Pagination from "../../common/Paginator/Pagination";
import FormConfig from "./formConfig";
import rolesService from "../../../services/RolesService"
import { FaEdit, FaTrash, FaTimes, FaEye } from "react-icons/fa";
import DetailsConfig from "./detailsConfig";
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
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
        //usar iziToast para mostrar el mensaje de confirmación
        iziToast.question({
            timeout: 20000,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            class: 'custom-alert',
            backgroundColor: '#ffffff',
            zindex: 999,
            title: 'Confirmación',
            message: `¿Está seguro de actualizar al rol ${idRol}?`,
            position: 'topRight',
            buttons: [
                ['<button><b>Eliminar</b></button>', function (instance, toast) {
                    // Aquí va la lógica para eliminar el rol
                    rolesService.deleteRole(idRol).then((res) => {
                        setSettings(settings.filter((config) => config.idRol !== idRol))
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        iziToast.success({
                            class: 'custom-alert',
                            title: 'Éxito',
                            message: 'Rol eliminado correctamente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    }).catch((error) => {
                        console.log(error)
                        iziToast.error({
                            class: 'custom-alert',
                            title: 'Error',
                            message: 'No se pudo eliminar el Rol',
                            position: 'topRight',
                            timeout: 5000
                        });
                    })
                }, true],
                ['<button>Cancelar</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
        });
    }
    const handleSave = (setting) => {

        if (currentConfig) {
            console.log(currentConfig)
            rolesService.updateRole(currentConfig.idRol, setting).then((res) => {
                setSettings(settings.map((config) => config.idRol === currentConfig.idRol ? { ...config, ...setting } : config))
                // setCurrentConfig(null)
                // setIsModalOpen(false)
                iziToast.success({
                    class: 'custom-alert',
                    title: 'Éxito',
                    message: 'Rol actualizado correctamente',
                    position: 'topRight',
                    timeout: 5000
                });
            }).catch((error) => {
                console.log(error)
                iziToast.error({
                    class: 'custom-alert',
                    title: 'Error',
                    message: 'No se pudo actualizar el Rol',
                    position: 'topRight',
                    timeout: 5000
                });
            }
            )
        }
        else {
            rolesService.createRole(setting).then((res) => {
                setSettings([...settings, res])
                setCurrentConfig(null)
                setIsModalOpen(false)
                iziToast.success({
                    class: 'custom-alert',
                    title: 'Éxito',
                    message: 'Rol creado correctamente',
                    position: 'topRight',
                    timeout: 5000
                });
            }).catch((error) => {
                console.log(error)
                iziToast.error({
                    class: 'custom-alert',
                    title: 'Error',
                    message: 'No se pudo crear el Rol',
                    position: 'topRight',
                    timeout: 5000
                });

            })
        }
        console.log(setting);
    }
    const handleToggle = async (idRol) => {
        const config = settings.find((config) => config.idRol === idRol);
        const updatedConfig = { ...config, status: !config.status };
        iziToast.question({
            timeout: 20000,
            close: false,
            overlay: true,
            displayMode: 'once',
            id: 'question',
            class: 'custom-alert',
            backgroundColor: '#ffffff',
            zindex: 999,
            title: 'Confirmación',
            message: `¿Está seguro de actualizar el rol ${idRol}?`,
            position: 'topRight',
            buttons: [
                ['<button><b>Actualizar</b></button>', function (instance, toast) {
                    rolesService.updateRole(idRol, updatedConfig).then((res) => {
                        setSettings(settings.map((config) => config.idRol === idRol ? { ...config, status: !config.status } : config))
                        instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                        iziToast.success({
                            class: 'custom-alert',
                            title: 'Éxito',
                            message: 'Rol actualizado correctamente',
                            position: 'topRight',
                            timeout: 5000
                        });
                    }).catch((error) => {
                        console.log(error)
                        iziToast.error({
                            class: 'custom-alert',
                            title: 'Error',
                            message: 'No se pudo actualizar el Rol',
                            position: 'topRight',
                            timeout: 5000
                        });
                    })
                }, true],
                ['<button>Cancelar</button>', function (instance, toast) {
                    instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
                }],
            ],
        });
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
                                                <ActionButtons
                                                    onEdit={() => handleEdit(config.idRol)}
                                                    onDelete={() => handleDelete(config.idRol)}
                                                    onView={() => handleView(config.idRol)}
                                                />
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

        </div>

    )
}
