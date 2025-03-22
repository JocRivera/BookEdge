import React, { useState } from "react";
import {CustomButton, ActionButtons} from "../../common/Button/customButton";
import FormConfort from "./formConfort"
import "./componentConfort.css"

export default function ComponentConfort() {
    const [confort, setConfort] = useState([
        {id:1, code: "CC0522", name:"Cama matrimonial",entry_date:"2023-01-01",description:"Cama matrimonial",status:"Disponible" },
        {id:2, code: "CC0523", name:"Cama matrimonial",entry_date:"2023-01-01", description:"Cama matrimonial",status:"Disponible" },
        {id:3, code: "CC0524", name:"Cama matrimonial",entry_date:"2023-01-01", description:"Cama matrimonial",status:"Disponible" },

    ]);

    const [openFormModal, setOpenFormModal] = useState(false);

    const handleAddConfort = (newConfort) => {
        const newId = confort.length + 1;
        setConfort([...confort, { ...newConfort, id: newId }]);
        console.log(newConfort);
        
        
    }
    const handleView = (id) => {
        console.log("Viendo inmobiliaria",id);
    }
    const handleDelete=(id) =>{
        console.log("Eliminar Inmobiliaria",id);
    }
    const handleEdit=(id) =>{
        console.log("Editar Inmobiliaria",id);
        }
  return (
    <div className="container-confort">
        <header className="header-confort">
            <h1 className="tittle-confort">Listado de Inmoboliria</h1>
        <CustomButton variant="primary" icon="add" onClick={() => setOpenFormModal(true)}   >Agregar</CustomButton>
        </header>
        
        <table className="confort-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Fecha de Ingreso</th>
                    <th>Descripcion</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {confort.map((confort) =>(
                    <tr key= {confort.id}>
                        <td>{confort.id}</td>
                        <td>{confort.code}</td>
                        <td>{confort.name}</td>
                        <td>{confort.entry_date}</td>
                        <td>{confort.description}</td>
                        <td>{confort.status}</td>
                        <td>
                        <ActionButtons
                            onView={() => handleView(confort.id)}
                            onDelete={() => handleDelete(confort.id)}
                            onEdit={() => handleEdit(confort.id)}
                        />
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>
        <FormConfort
         isOpen={openFormModal}
         onClose={() => setOpenFormModal(false)}
         onSave={handleAddConfort}
        />
    </div>
  )
}
