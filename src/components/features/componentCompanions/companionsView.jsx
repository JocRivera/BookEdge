import { useState, useEffect } from "react"
import { ActionButtons } from "../../common/Button/customButton"
import { getAllCompanions, deleteCompanion } from "../../../services/companionsService"
import { toast } from "react-toastify"
import { useAlert } from "../../../context/AlertContext"
import "./componentCompanions.css"

const CompanionsView = () => {
  const [companions, setCompanions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const companionsPerPage = 10

  // Usar el contexto de alertas
  const { showAlert } = useAlert()

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        setLoading(true)
        const data = await getAllCompanions()
        console.log("Datos de acompañantes:", data)
        setCompanions(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
        setCompanions([])
        toast.error(`Error al cargar acompañantes: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanions()
  }, [])

  // Paginación
  const indexOfLastCompanion = currentPage * companionsPerPage
  const indexOfFirstCompanion = indexOfLastCompanion - companionsPerPage
  const currentCompanions = Array.isArray(companions)
    ? companions.slice(indexOfFirstCompanion, indexOfLastCompanion)
    : []
  const totalPages = Math.ceil((companions?.length || 0) / companionsPerPage)

  const handleDelete = async (id) => {
    // Buscar el acompañante para mostrar su nombre en la alerta
    const companionToDelete = companions.find((c) => c.idCompanions === id)
    const companionName = companionToDelete?.name || "este acompañante"

    // Mostrar alerta de confirmación
    showAlert({
      type: "confirm-delete",
      title: "Confirmar Eliminación",
      message: `¿Está seguro de eliminar a ${companionName}?`,
      confirmText: "Sí, Eliminar",
      onConfirm: async () => {
        try {
          await deleteCompanion(id)
          setCompanions((prev) => prev.filter((c) => c.idCompanions !== id))
          toast.success(`Acompañante eliminado correctamente`)
        } catch (err) {
          toast.error(`Error al eliminar: ${err.message}`)
          console.error("Error al eliminar acompañante:", err)
        }
      },
    })
  }

  // Función para manejar el cambio de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  if (loading)
    return (
      <div className="loading-indicator">
        <div className="loading-spinner"></div>
        <p>Cargando acompañantes...</p>
      </div>
    )

  if (error)
    return (
      <div className="error-message">
        Error: {error}
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    )

  return (
    <div className="companions-view-container">
      <div className="companions-header">
        <h2> Lista de Acompañantes</h2>
        <div className="companions-controls">
          <div className="total-count">Total: {companions.length} acompañantes</div>
        </div>
      </div>

      <div className="companions-table-container">
        <table className="companions-table">
          <thead>
            <tr>
              <th>Reserva ID</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Numero de documento</th>
              <th>Edad</th>
              <th>EPS</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentCompanions.length > 0 ? (
              currentCompanions.map((companion) => (
                <tr key={companion.idCompanions}>
                  <td>{companion.idCompanions || companion.reservationId}</td>
                  <td>{companion.name}</td>
                  <td>{companion.documentType}</td>
                  <td>{companion.documentNumber}</td>
                  <td>{companion.age}</td>
                  <td>{companion.eps}</td>
                  <td className="config-actions-cell">
                    {/* Usar el mismo componente ActionButtons que en servicios */}
                    <ActionButtons
                      onDelete={() => handleDelete(companion.idCompanions)}
                      // Solo pasamos onDelete ya que no necesitamos editar en acompañantes
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-results">
                  No hay acompañantes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
              &laquo; Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanionsView
