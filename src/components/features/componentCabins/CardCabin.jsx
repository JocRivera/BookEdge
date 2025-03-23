import React, { useState } from "react";
import { ActionButtons } from "../../common/Button/customButton";
import "./CabinCard.css";
import cabaña from "../../../assets/cabaña.jpg";

function CardCabin() {
  const [cabins, setCabins] = useState([
    {
      id: 1,
      name: "Cabaña Montaña Serena",
      description:
        "Hermosa cabaña rodeada de naturaleza con vistas espectaculares. Perfecta para descansar y desconectar del bullicio de la ciudad.",
      capacity: "4",
      Comforts: [
        { idComfort: 1, name: "Wi-Fi" },
        { idComfort: 2, name: "Desayuno" },
      ],
      status: "En Servicio",
      image: cabaña,
    },
    {
      id: 2,
      name: "Cabaña Bosque Encantado",
      description:
        "Acogedora cabaña en medio del bosque, ideal para amantes de la naturaleza.",
      capacity: "6",
      Comforts: [
        { idComfort: 1, name: "Wi-Fi" },
        { idComfort: 2, name: "Chimenea" },
      ],
      status: "Fuera de Servicio",
      image: cabaña,
    },
    {
      id: 3,
      name: "Cabaña Lago Azul",
      description:
        "Cabaña con vista al lago, perfecta para relajarse y disfrutar del paisaje.",
      capacity: "8",
      Comforts: [
        { idComfort: 1, name: "Wi-Fi" },
        { idComfort: 2, name: "Jacuzzi" },
      ],
      status: "Mantenimiento",
      image: cabaña,
    },
  ]);

  const handleEdit = (id) => {
    console.log("Editando cabaña", id);
  };

  const handleDelete = (id) => {
    console.log("Eliminando cabaña", id);
  };

  const handleView = (id) => {
    console.log("Mirando cabaña", id);
  };

  return (
    <section className="cabin-container">
      <div className="cabin-title-of">
        <h2>Lista de cabañas</h2>
      </div>

      {cabins.map((cabin) => (
        <article key={cabin.id} className="cabin-card">
          <figure className="cabin-figure">
            <img src={cabin.image} alt={cabin.name} className="cabin-image" />
          </figure>

          <main className="cabin-content">
            <header>
              <h3 className="cabin-title">{cabin.name}</h3>
            </header>

            <p className="cabin-description">{cabin.description}</p>

            <ul className="cabin-amenities">
              <li className="amenity-item">👥 {cabin.capacity} personas</li>
              {cabin.Comforts?.map((comfort) => (
                <li key={comfort.idComfort} className="amenity-item">
                  {comfort.name}
                  {comfort.name}
                </li>
              ))}
            </ul>

            <span
              className={`status status-${cabin.status.replace(/\s+/g, "-")}`}
            >
              {cabin.status}
            </span>
          </main>

          <footer className="cabin-footer">
            <ActionButtons
              onEdit={() => handleEdit(cabin.id)}
              onDelete={() => handleDelete(cabin.id)}
              onView={() => handleView(cabin.id)}
            />
          </footer>
        </article>
      ))}
    </section>
  );
}

export default CardCabin;
