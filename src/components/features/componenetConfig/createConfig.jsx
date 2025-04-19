import { useEffect, useState } from "react"
import "./createConfig.css"
import { CustomButton, ActionButtons } from "../../common/Button/customButton"
import { CiSearch } from "react-icons/ci"
import Switch from "../../common/Switch/Switch"
import Pagination from "../../common/Paginator/Pagination";
import FormConfig from "./formConfig";
import rolesService from "../../../services/RolesService"
import toast, { Toaster } from 'react-hot-toast';
import DetailsConfig from "./detailsConfig";
export default function CreateConfig() {
    const [currentConfig, setCurrentConfig] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [settings, setSettings] = useState([]);
    const [isView, setIsView] = useState(false)
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const roles = await rolesService.getRoles()
                setSettings(roles)
            } catch (error) {
                console.log(error)
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
                <h2 className="table-title">Tabla de Roles</h2>
            </div>
            <div className="container-search">
                <CiSearch className="absolute left-[10px] text-[16px] text-text-light" />

                <input
                    type="text"
                    className="search"
                    value={searchTerm}
                    placeholder="Buscar Rol..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <CustomButton variant="primary" icon="add" onClick={handleAdd}>
                    Agregar Rol
                </CustomButton>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead className="table-header">
                        <tr>
                            <th>Id</th>
                            <th>Nombre</th>
                            <th>Status</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {currentItems.map((config) => (
                            <tr key={config.idRol}>
                                <td className="table-cell">{config.idRol}</td>
                                <td className="table-cell">{config.name}</td>
                                <td className="table-cell">
                                    <Switch
                                        isOn={config.status === true}
                                        id={config.idRol}
                                        handleToggle={() => handleToggle(config.idRol)}
                                    />
                                </td>
                                <td className="table-cell">
                                    <ActionButtons
                                        onView={() => handleView(config.idRol)}
                                        onEdit={() => handleEdit(config.idRol)}
                                        onDelete={() => handleDelete(config.idRol)}
                                    />
                                </td>
                            </tr>
                        ))}

                        {currentItems.length === 0 && (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    No hay datos disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
            </div>
            <FormConfig
                setting={currentConfig}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
            <DetailsConfig
                currentConfig={currentConfig}
                isOpen={isView}
                onClose={() => setIsView(false)}
            />
            <Toaster />
        </div>

    )
}
