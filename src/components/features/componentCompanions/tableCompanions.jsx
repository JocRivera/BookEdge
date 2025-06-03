
import { useState } from "react"
import PropTypes from "prop-types"
import { toast } from "react-toastify"
import { useAlert } from "../../../context/AlertContext"
import "./componentCompanions.css"

const TableCompanions = ({ companions = [], onDeleteCompanion = null, compact = false, isReadOnly = false }) => {
  const [expanded, setExpanded] = useState(false)

  // Usar el contexto de alertas
  const { showAlert } = useAlert()

  // ✅ VALIDACIÓN MEJORADA
  if (!companions || !Array.isArray(companions)) {
    console.warn("⚠️ TableCompanions: companions no es un array válido:", companions)
    return <div className="no-companions">Datos de acompañantes no válidos</div>
  }

  // ✅ FUNCIÓN DE DEBUG
  const debugCompanions = () => {
    console.log("🔍 === TABLE COMPANIONS DEBUG ===")
    console.log("Total companions:", companions.length)
    console.log(
      "Companions data:",
      companions.map((c) => ({
        name: c.name,
        document: c.documentNumber,
        id: c.idCompanions || c.id || c.tempId,
        isTemp: c.isTemporary || c.isTemp,
      })),
    )
  }

  // Debug en cada render
  debugCompanions()

  // ✅ MANEJO MEJORADO DE ELIMINACIÓN
  const handleDelete = (companionId, name) => {
    if (isReadOnly || !onDeleteCompanion) {
      console.log("⚠️ Eliminación no permitida - isReadOnly:", isReadOnly, "onDeleteCompanion:", !!onDeleteCompanion)
      return
    }

    console.log("🗑️ === ELIMINANDO DESDE TABLA ===")
    console.log("ID:", companionId)
    console.log("Nombre:", name)

    showAlert({
      type: "confirm-delete",
      title: "Confirmar Eliminación",
      message: `¿Está seguro de eliminar a ${name || "este acompañante"}?`,
      confirmText: "Sí, Eliminar",
      onConfirm: () => {
        try {
          onDeleteCompanion(companionId)
          toast.success("Acompañante eliminado correctamente")
        } catch (error) {
          toast.error(`Error al eliminar: ${error.message}`)
          console.error("Error al eliminar acompañante:", error)
        }
      },
    })
  }

  // Manejar la expansión en modo compacto
  const toggleExpanded = () => {
    setExpanded(!expanded)
    if (!expanded) {
      toast.info(`Mostrando ${companions.length} acompañantes`)
    }
  }

  if (compact && companions.length > 0) {
    return (
      <div className="compact-companions">
        <button className="toggle-companions-btn" onClick={toggleExpanded}>
          {companions.length} acompañante(s) {expanded ? "▲" : "▼"}
        </button>

        {expanded && (
          <div className="companions-popup">
            <table className="companions-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>N° Documento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {companions.map((companion, index) => {
                  // ✅ CLAVE ÚNICA MEJORADA
                  const companionKey =
                    companion.idCompanions || companion.id || companion.tempId || companion.documentNumber || index

                  return (
                    <tr key={companionKey}>
                      <td>{companion.name || "N/A"}</td>
                      <td>{companion.documentNumber || "N/A"}</td>
                      <td>
                        {companion.isTemporary || companion.isTemp ? (
                          <span style={{ color: "#17a2b8", fontSize: "12px" }}>Temporal</span>
                        ) : companion.idCompanions ? (
                          <span style={{ color: "#28a745", fontSize: "12px" }}>Guardado</span>
                        ) : (
                          <span style={{ color: "#6c757d", fontSize: "12px" }}>Pendiente</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="companions-table-wrapper">
      <table className="reservations-table">
        <thead className="reservations-table-header">
          <tr>
            <th>Nombre</th>
            <th>Fecha Nac.</th>
            <th>Edad</th>
            <th>Tipo Doc.</th>
            <th>N° Documento</th>
            <th>EPS</th>
            <th>Estado</th>
            {!isReadOnly && onDeleteCompanion && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody className="reservations-table-body">
          {companions.length > 0 ? (
            companions.map((companion, index) => {
              // ✅ CLAVE ÚNICA MEJORADA
              const companionKey =
                companion.idCompanions || companion.id || companion.tempId || companion.documentNumber || index
              const companionId = companion.idCompanions || companion.id || companion.tempId || companion.documentNumber

              return (
                <tr
                  key={companionKey}
                  className={index % 2 === 0 ? "reservations-table-row-even" : "reservations-table-row-odd"}
                  style={{
                    backgroundColor: companion.isTemporary || companion.isTemp ? "#f8f9fa" : "inherit",
                  }}
                >
                  <td className="reservations-table-cell">{companion.name || "N/A"}</td>
                  <td className="reservations-table-cell">{companion.birthdate || "N/A"}</td>
                  <td className="reservations-table-cell">{companion.age || "N/A"}</td>
                  <td className="reservations-table-cell">{companion.documentType || "N/A"}</td>
                  <td className="reservations-table-cell">{companion.documentNumber || "N/A"}</td>
                  <td className="reservations-table-cell">{companion.eps || "N/A"}</td>
                  <td className="reservations-table-cell">
                    {companion.isTemporary || companion.isTemp ? (
                      <span
                        style={{
                          color: "#17a2b8",
                          fontSize: "12px",
                          backgroundColor: "#e3f2fd",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        Temporal
                      </span>
                    ) : companion.idCompanions ? (
                      <span
                        style={{
                          color: "#28a745",
                          fontSize: "12px",
                          backgroundColor: "#d4edda",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        Guardado
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "#6c757d",
                          fontSize: "12px",
                          backgroundColor: "#f8f9fa",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        Pendiente
                      </span>
                    )}
                  </td>
                  {!isReadOnly && onDeleteCompanion && (
                    <td className="reservations-table-cell">
                      <button
                        onClick={() => handleDelete(companionId, companion.name)}
                        className="delete-companion-btn"
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={!isReadOnly && onDeleteCompanion ? 8 : 7} className="no-results">
                No hay acompañantes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

TableCompanions.propTypes = {
  companions: PropTypes.arrayOf(
    PropTypes.shape({
      idCompanions: PropTypes.number,
      id: PropTypes.string,
      tempId: PropTypes.string,
      name: PropTypes.string,
      birthdate: PropTypes.string,
      age: PropTypes.number,
      documentType: PropTypes.string,
      documentNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      eps: PropTypes.string,
      isTemporary: PropTypes.bool,
      isTemp: PropTypes.bool,
    }),
  ),
  onDeleteCompanion: PropTypes.func,
  compact: PropTypes.bool,
  isReadOnly: PropTypes.bool,
}

export default TableCompanions
