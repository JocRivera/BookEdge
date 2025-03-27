import { useEffect, useState } from "react"
import "./createConfig.css"
import { CustomButton, ActionButtons } from "../../common/Button/customButton"
import { CiSearch } from "react-icons/ci"
import Switch from "../../common/Switch/Switch"
import Pagination from "../../common/Paginator/Pagination";
import {getRoles, postRoles} from "../../../services/RolesService"

export default function CreateConfig() {
    const [currentConfig, setCurrentConfig] = useState(null);
    const[isModalOpen,setIsModalOpen]= useState(false)
    const [settings, setSettings] = useState([
        // {
        //     id: 1,
        //     name: 'Admin',
        //     description: 'Rol con acceso a todos los modulos',
        //     status: 'Activo',
        // },
        // {
        //     id: 2,
        //     name: 'User',
        //     description: 'Rol con acceso a todos los modulos',
        //     status: 'Activo',
        // }
    ]);
    useEffect(()=>{
        const fectchConfig = async () => {
            try{
                const roles = await getRoles()
                setSettings(roles)
            }catch(error){
                console.log(error)
            }
        }
        fectchConfig()
    },[])
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
    const handleView = (id) => {
        console.log('Ver', id);
    }
    const handleEdit = (id) => {
        console.log('Editar', id);
    }
    const handleDelete = (id) => {
        console.log('Eliminar', id);
    }
    return (
        <div className="table-container">
            <div className="title-container">
                <h2 className="table-title">Tabla de Roles</h2>
            </div>
            <div className="container-search">
                <CiSearch className="search-icon" />

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
                            <th>Nombre Completo</th>
                            <th>Descripcion</th>
                            <th>Status</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {settings.map((config) => (
                            <tr key={config.idRol}>
                                <td className="table-cell">{config.idRol}</td>
                                <td className="table-cell">{config.name}</td>
                                <td className="table-cell">{config.description}</td>
                                <td className="table-cell">
                                    <Switch
                                        isOn={config.status === true}
                                        id={config.idRol}
                                        handleToggle={(id) => {
                                            setSettings(
                                                settings.map((config) =>
                                                    config.idRol === id
                                                        ? {
                                                            ...config,
                                                            status: !config.status,
                                                        }
                                                        : config
                                                )
                                            );
                                        }
                                        }
                                    />
                                </td >
                                <td className="table-cell">
                                    <ActionButtons
                                        onView={() => handleView(config.id)}
                                        onEdit={() => handleEdit(config.id)}
                                        onDelete={() => handleDelete(config.id)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
            </div>
        </div>

    )
}
