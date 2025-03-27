import React, { useState } from "react";
import "./CabinCard.css";
import cabaña from "../../../assets/cabaña.jpg";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import { CiSearch } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import Pagination from "../../common/Paginator/Pagination";

function CardCabin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cabins, setCabins] = useState([
    {
      id: 1,
      name: "Cabaña Montaña Serena",
      description:
        "Hermosa cabaña rodeada de naturaleza con impresionantes vistas panorámicas. Un lugar perfecto para descansar y reconectar.",
      capacity: "4 personas",
      comforts: [
        "Wi-Fi",
        "Desayuno",
        "Aire Acondicionado",
        "Piscina",
        "TV",
        "Calefacción",
      ],
      status: "Fuera de Servicio",
      image: cabaña,
    },
    {
      id: 2,
      name: "Cabaña Valle Escondido",
      description:
        "Un refugio tranquilo en medio de la naturaleza. Ideal para escapadas en familia o con amigos.",
      capacity: "6 personas",
      comforts: ["Wi-Fi", "Desayuno", "Parrilla"],
      status: "En Servicio",
      image: cabaña,
    },
    {
      id: 3,
      name: "Cabaña Valle Escondido",
      description:
        "Un refugio tranquilo en medio de la naturaleza. Ideal para escapadas en familia o con amigos.",
      capacity: "6 personas",
      comforts: ["Wi-Fi", "Desayuno", "Parrilla"],
      status: "En Servicio",
      image: cabaña,
    },
    {
      id: 4,
      name: "Cabaña Valle Escondido",
      description:
        "Un refugio tranquilo en medio de la naturaleza. Ideal para escapadas en familia o con amigos.",
      capacity: "6 personas",
      comforts: ["Wi-Fi", "Desayuno", "Parrilla"],
      status: "En Servicio",
      image: cabaña,
    },
    {
      id: 5,
      name: "Cabaña Valle Escondido",
      description:
        "Un refugio tranquilo en medio de la naturaleza. Ideal para escapadas en familia o con amigos.",
      capacity: "6 personas",
      comforts: ["Wi-Fi", "Desayuno", "Parrilla"],
      status: "En Servicio",
      image: cabaña,
    },
  ]);

  const handleAdd = () => console.log("Agregar comodidad");
  const handleEdit = (id) => console.log("Editar cabaña", id);
  const handleDelete = (id) => console.log("Eliminar cabaña", id);
  const handleView = (id) => console.log("Ver detalles de la cabaña", id);

  // Filtrado de datos basado en el término de búsqueda
  const filteredCabins = cabins.filter((cabin) =>
    Object.values(cabin).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginación
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  console.log({
    totalCabins: cabins.length,
    currentPage,
    itemsPerPage,
  });

  const offset = currentPage * itemsPerPage;
  const currentItems = filteredCabins.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredCabins.length / itemsPerPage);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  return (
    <section className="container-cabins">
      <div className="title-container">
        <h1 className="title-cabin">Nuestras Cabañas</h1>
      </div>
      <div className="cabin-search">
        <CiSearch className="search-icon" />
        <input
          type="text"
          className="search"
          placeholder="Buscar ..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Agregar Comodidad
        </CustomButton>
      </div>

      <main className="cabin-list">
        {currentItems.map((cabin) => (
          <article key={cabin.id} className="cabin-card">
            <img src={cabin.image} alt={cabin.name} className="cabin-image" />

            <section className="cabins-details">
              <header className="cabin-header">
                <h2>{cabin.name}</h2>
                <span
                  className={`cabin-status status-${cabin.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {cabin.status}
                </span>
              </header>

              <p className="cabin-description">{cabin.description}</p>

              <div className="cabin-meta">
                <span className="capacity-info">
                  <MdPerson className="icon-person" />
                  <span className="label">Capacidad</span> {cabin.capacity}
                </span> 
                <div className="comforts-info">
                <MdPerson className="icon-person" />
                <span className="label">Comodidades:</span>
                </div>
                <div className="cabin-comforts">
                  {cabin.comforts.slice(0, 3).map((comfort, index) => (
                    <span key={index} className="comfort-badge">
                      {comfort}
                    </span>
                  ))}
                  {cabin.comforts.length > 3 && (
                    <span className="more-comforts">
                      +{cabin.comforts.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              <footer className="cabin-actions">
                <ActionButtons
                  onEdit={() => handleEdit(cabin.id)}
                  onDelete={() => handleDelete(cabin.id)}
                  onView={() => handleView(cabin.id)}
                />
              </footer>
            </section>
          </article>
        ))}
      </main>
      <Pagination
        pageCount={pageCount}
        onPageChange={handlePageClick}
        forcePage={currentPage}
      />
    </section>
  );
}

export default CardCabin;
