
import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { useAlert } from "../../../context/AlertContext"
import CompanionsForm from "../componentCompanions/formCompanions"
import "./componentsReservations.css"
import "../componentReservations/availability-step.css"
import PaymentForm from "../../features/componentPayments/formPayments"
import TablePayments from "../../features/componentPayments/tablePayments"

// Componente de búsqueda de clientes mejorado
function ClientSearchSelect({ users = [], value, onChange, disabled = false, error = false }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Encontrar el usuario seleccionado cuando cambia el value
  useEffect(() => {
    if (value && users.length > 0) {
      const user = users.find((u) => u.idUser === Number(value))
      if (user) {
        setSelectedUser(user)
        setSearchTerm(`${user.name} - ${user.identification}`)
      }
    } else if (!value) {
      setSelectedUser(null)
      setSearchTerm("")
    }
  }, [value, users])

  // Filtrar usuarios basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim() || selectedUser) {
      setFilteredUsers([])
      setHighlightedIndex(-1)
      return
    }

    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase()
      const nameMatch = user.name?.toLowerCase().includes(searchLower)
      const identificationMatch = user.identification?.toString().includes(searchTerm)
      return nameMatch || identificationMatch
    })

    setFilteredUsers(filtered.slice(0, 8))
    setHighlightedIndex(-1)
  }, [searchTerm, users, selectedUser])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)

    // Si hay un usuario seleccionado y se está editando, limpiar la selección
    if (selectedUser) {
      setSelectedUser(null)
      onChange({ target: { name: "idUser", value: "" } })
    }

    setIsOpen(true)

    // Si se borra completamente el input, limpiar todo
    if (!newValue.trim()) {
      setSelectedUser(null)
      setIsOpen(false)
      onChange({ target: { name: "idUser", value: "" } })
    }
  }

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setSearchTerm(`${user.name} - ${user.identification}`)
    setIsOpen(false)
    setHighlightedIndex(-1)
    onChange({ target: { name: "idUser", value: user.idUser } })

    // ✅ TOAST DE CONFIRMACIÓN AL SELECCIONAR CLIENTE
    toast.success(`Cliente seleccionado: ${user.name}`, {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const handleInputFocus = () => {
    if (searchTerm && !selectedUser) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = (e) => {
    // Delay para permitir clicks en la lista
    setTimeout(() => {
      setIsOpen(false)
      setHighlightedIndex(-1)

      // Si no hay usuario seleccionado y hay texto, limpiar
      if (!selectedUser && searchTerm) {
        setSearchTerm("")
        onChange({ target: { name: "idUser", value: "" } })
      }
    }, 200)
  }

  const handleKeyDown = (e) => {
    if (!isOpen || filteredUsers.length === 0) {
      if (e.key === "ArrowDown" && searchTerm && !selectedUser) {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < filteredUsers.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredUsers.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredUsers[highlightedIndex]) {
          handleUserSelect(filteredUsers[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case "Tab":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleClearSelection = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedUser(null)
    setSearchTerm("")
    setIsOpen(false)
    setHighlightedIndex(-1)
    onChange({ target: { name: "idUser", value: "" } })

    // ✅ TOAST INFORMATIVO AL LIMPIAR SELECCIÓN
    toast.info("Selección de cliente eliminada", {
      position: "top-right",
      autoClose: 1500,
    })
  }

  const handleResultClick = (user, e) => {
    e.preventDefault()
    e.stopPropagation()
    handleUserSelect(user)
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Buscar cliente por nombre o documento..."
          disabled={disabled}
          style={{
            width: "100%",
            padding: "8px 40px 8px 12px",
            border: `1px solid ${error ? "#dc3545" : "#ddd"}`,
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: disabled ? "#f8f9fa" : "white",
            color: disabled ? "#6c757d" : "inherit",
            outline: "none",
          }}
          autoComplete="off"
        />

        {selectedUser && !disabled && (
          <button
            type="button"
            onClick={handleClearSelection}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              position: "absolute",
              right: "30px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              fontSize: "16px",
              color: "#6c757d",
              cursor: "pointer",
              padding: "0",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
            title="Limpiar selección"
          >
            ×
          </button>
        )}

        <span
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6c757d",
            fontSize: "14px",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
      </div>

      {isOpen && filteredUsers.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            background: "white",
            border: "1px solid #ddd",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            margin: "0",
            padding: "0",
            listStyle: "none",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {filteredUsers.map((user, index) => (
            <li
              key={user.idUser}
              onMouseDown={(e) => handleResultClick(user, e)}
              onMouseEnter={() => setHighlightedIndex(index)}
              style={{
                padding: "12px",
                cursor: "pointer",
                borderBottom: index < filteredUsers.length - 1 ? "1px solid #f8f9fa" : "none",
                backgroundColor: index === highlightedIndex ? "#e3f2fd" : "white",
                transition: "background-color 0.2s ease",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "500",
                    color: "#212529",
                    fontSize: "14px",
                    marginBottom: "2px",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    marginBottom: "1px",
                  }}
                >
                  Documento: {user.identification}
                </div>
                {user.email && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6c757d",
                      fontStyle: "italic",
                    }}
                  >
                    {user.email}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && searchTerm && !selectedUser && filteredUsers.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            right: "0",
            background: "white",
            border: "1px solid #ddd",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            padding: "12px",
            textAlign: "center",
            color: "#6c757d",
            fontSize: "14px",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          No se encontraron clientes
        </div>
      )}
    </div>
  )
}

// Función para formatear a pesos
const formatCOP = (value) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function BasicInfoStep({
  formData,
  errors,
  users,
  planes,
  loading,
  isReadOnly,
  onChange,
  isClientMode = false,
  clientUser = null,
}) {
  // Función para formatear moneda
  const formatCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // ✅ VALIDACIÓN CON TOAST AL CAMBIAR FECHAS
  const handleDateChange = (e) => {
    const { name, value } = e.target

    // Validar que la fecha de fin no sea anterior a la de inicio
    if (name === "endDate" && formData.startDate && value < formData.startDate) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    // Validar que las fechas no sean en el pasado
    const today = new Date().toISOString().split("T")[0]
    if (value < today) {
      toast.warning("Se recomienda no seleccionar fechas pasadas", {
        position: "top-right",
        autoClose: 3000,
      })
    }

    onChange(e)

    // Si hay fecha de fin y es anterior a la nueva fecha de inicio, limpiarla
    if (name === "startDate" && formData.endDate && value > formData.endDate) {
      setTimeout(() => {
        onChange({ target: { name: "endDate", value: "" } })
        toast.info("Fecha de fin actualizada automáticamente", {
          position: "top-right",
          autoClose: 2000,
        })
      }, 0)
    }
  }

  return (
    <div className="basic-info-step-container">
      <h3 className="step-title">Información Básica de la Reserva</h3>

      <div className="basic-info-form">
        {/* Primera fila - Cliente y Plan */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="idUser" className="form-label">
              <span className="label-icon"></span>
              Cliente *
            </label>

            {isClientMode ? (
              // ✅ MODO CLIENTE: Mostrar información del cliente logueado
              <div className="client-info-display">
                <div className="client-card">
                  <div className="client-avatar">{clientUser?.name?.charAt(0)?.toUpperCase() || "C"}</div>
                  <div className="client-details">
                    <h4>{clientUser?.name || "Cliente"}</h4>
                    <p>{clientUser?.email || "Sin email"}</p>
                    <span className="client-id">ID: {clientUser?.idUser}</span>
                  </div>
                  <span className="client-mode-badge">Tú</span>
                </div>
              </div>
            ) : (
              // ✅ MODO ADMIN: Selector normal
              <ClientSearchSelect
                users={users}
                value={formData.idUser}
                onChange={onChange}
                disabled={loading || isReadOnly}
                error={!!errors.idUser}
              />
            )}

            {errors.idUser && (
              <span className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.idUser}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="idPlan" className="form-label">
              <span className="label-icon"></span>
              Plan *
            </label>
            <select
              id="idPlan"
              name="idPlan"
              value={formData.idPlan}
              onChange={(e) => {
                onChange(e)
                // ✅ TOAST AL SELECCIONAR PLAN
                if (e.target.value) {
                  const selectedPlan = planes.find((p) => p.idPlan === Number(e.target.value))
                  if (selectedPlan) {
                    toast.success(`Plan seleccionado: ${selectedPlan.name || selectedPlan.nombre}`, {
                      position: "top-right",
                      autoClose: 2000,
                    })
                  }
                }
              }}
              disabled={loading || isReadOnly}
              className={`form-input ${errors.idPlan ? "error" : ""}`}
            >
              <option value="">Seleccione un plan</option>
              {planes.map((plan) => (
                <option key={plan.idPlan} value={plan.idPlan}>
                  {plan.name || plan.nombre} - {formatCOP(plan.price || plan.precio || plan.salePrice)}
                </option>
              ))}
            </select>
            {errors.idPlan && (
              <span className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.idPlan}
              </span>
            )}
          </div>
        </div>

        {/* Segunda fila - Fechas */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              <span className="label-icon"></span>
              Fecha de Inicio *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split("T")[0]}
              disabled={loading || isReadOnly}
              className={`form-input ${errors.startDate ? "error" : ""}`}
            />
            {errors.startDate && (
              <span className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.startDate}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="endDate" className="form-label">
              <span className="label-icon"></span>
              Fecha de Fin *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleDateChange}
              min={formData.startDate || new Date().toISOString().split("T")[0]}
              disabled={loading || isReadOnly}
              className={`form-input ${errors.endDate ? "error" : ""}`}
            />
            {errors.endDate && (
              <span className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.endDate}
              </span>
            )}
          </div>
        </div>

        {/* Tercera fila - Configuración de Acompañantes */}
        <div className="form-row">
          <div className="form-group">
            <div className="checkbox-container">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  name="hasCompanions"
                  checked={formData.hasCompanions}
                  onChange={(e) => {
                    onChange(e)
                    // ✅ TOAST AL ACTIVAR/DESACTIVAR ACOMPAÑANTES
                    if (e.target.checked) {
                      toast.info("Acompañantes activados. Especifica la cantidad.", {
                        position: "top-right",
                        autoClose: 2500,
                      })
                    } else {
                      toast.info("Acompañantes desactivados", {
                        position: "top-right",
                        autoClose: 2000,
                      })
                    }
                  }}
                  disabled={loading || isReadOnly}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">¿Incluye acompañantes?</span>
              </label>
            </div>
          </div>

          {formData.hasCompanions && (
            <div className="form-group">
              <label htmlFor="companionCount" className="form-label">
                <span className="label-icon"></span>
                Número de Acompañantes *
              </label>
              <input
                type="number"
                id="companionCount"
                name="companionCount"
                min="1"
                max="6"
                value={formData.companionCount}
                onChange={(e) => {
                  const count = Number(e.target.value)
                  if (count > 6) {
                    toast.warning("Máximo 6 acompañantes permitidos", {
                      position: "top-right",
                      autoClose: 3000,
                    })
                    return
                  }
                  onChange(e)
                }}
                disabled={loading || isReadOnly}
                className={`form-input ${errors.companionCount ? "error" : ""}`}
                placeholder="Ej: 2"
              />
              {errors.companionCount && (
                <span className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errors.companionCount}
                </span>
              )}
              <div className="input-hint">Máximo 6 acompañantes por reserva</div>
            </div>
          )}
        </div>

        {/* Tarjeta informativa cuando se seleccionan acompañantes */}
        {formData.hasCompanions && formData.companionCount > 0 && (
          <div className="companions-info-card">
            <div className="info-header">
              <span className="info-icon">ℹ</span>
              <h4>Información sobre Acompañantes</h4>
            </div>
            <div className="info-content">
              <p>
                <strong>Total de huéspedes:</strong> {Number(formData.companionCount) + 1} personas (1 titular +{" "}
                {formData.companionCount} acompañante{formData.companionCount > 1 ? "s" : ""})
              </p>
              <p>
                <strong>Tipo de alojamiento requerido:</strong>{" "}
                {formData.companionCount > 1 ? "Cabañas (para grupos)" : "Habitaciones o cabañas"}
              </p>
              <div className="info-note">
                En el siguiente paso podrás registrar los datos personales de cada acompañante.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

BasicInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  planes: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  isClientMode: PropTypes.bool,
  clientUser: PropTypes.object,
}

// ✅ COMPONENTE CORREGIDO: CompanionsStep mejorado
export function CompanionsStep({ formData, errors, loading, isReadOnly, onSaveCompanion, onDeleteCompanion }) {
  const { showAlert } = useAlert()

  // ✅ FUNCIÓN DE DEBUG PARA ACOMPAÑANTES
  const debugCompanionsState = () => {
    console.log("🔍 === ESTADO COMPANIONS STEP ===")
    console.log("Expected count:", formData.companionCount)
    console.log("Current companions:", formData.companions?.length || 0)
    console.log(
      "Companions data:",
      formData.companions?.map((c) => ({
        name: c.name,
        document: c.documentNumber,
        id: c.id || c.idCompanions,
        isTemp: c.isTemporary || c.isTemp,
      })),
    )
  }

  // ✅ DEBUG EN CADA RENDER
  useEffect(() => {
    debugCompanionsState()
  }, [formData.companions, formData.companionCount])

  // ✅ CONFIRMACIÓN CON MODAL PERSONALIZADO
  const handleDeleteCompanion = (companionId, companionName) => {
    console.log("🗑️ === ELIMINANDO DESDE COMPANIONS STEP ===")
    console.log("ID:", companionId)
    console.log("Nombre:", companionName)

    showAlert({
      type: "warning",
      title: "Eliminar Acompañante",
      message: `¿Estás seguro de que deseas eliminar a "${companionName}" de la lista de acompañantes?`,
      showCancel: true,
      confirmText: "Sí, Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await onDeleteCompanion(companionId)
          toast.success(`Acompañante "${companionName}" eliminado correctamente`, {
            position: "top-right",
            autoClose: 3000,
          })
        } catch (error) {
          toast.error(`Error al eliminar acompañante: ${error.message}`, {
            position: "top-right",
            autoClose: 4000,
          })
        }
      },
    })
  }

  // ✅ CALLBACK PARA GUARDAR ACOMPAÑANTE CON TOAST
  const handleSaveCompanion = async (companionData) => {
    console.log("💾 === GUARDANDO DESDE COMPANIONS STEP ===")
    console.log("Datos recibidos:", companionData)

    try {
      await onSaveCompanion(companionData)
      console.log("✅ Acompañante guardado exitosamente")
    } catch (error) {
      console.error("❌ Error al guardar acompañante:", error)
      toast.error(`Error al agregar acompañante: ${error.message}`, {
        position: "top-right",
        autoClose: 4000,
      })
    }
  }

  const expectedCount = Number.parseInt(formData.companionCount) || 0
  const currentCount = formData.companions?.length || 0
  const remainingCount = Math.max(0, expectedCount - currentCount)

  return (
    <div className="step-content">
      <h3>
        Acompañantes ({currentCount} de {expectedCount})
      </h3>

      {/* ✅ INDICADOR DE PROGRESO MEJORADO */}
      <div
        className="companions-progress"
        style={{
          padding: "15px",
          backgroundColor: currentCount === expectedCount ? "#e8f5e8" : "#fff3cd",
          border: `1px solid ${currentCount === expectedCount ? "#28a745" : "#ffc107"}`,
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            <strong>Progreso:</strong> {currentCount} de {expectedCount} acompañantes registrados
          </span>
          {currentCount === expectedCount ? (
            <span style={{ color: "#28a745", fontWeight: "bold" }}>✅ Completo</span>
          ) : (
            <span style={{ color: "#856404", fontWeight: "bold" }}>⏳ Faltan {remainingCount}</span>
          )}
        </div>
      </div>

      {errors.companions && <div className="error-message">{errors.companions}</div>}

      {/* ✅ LISTA DE ACOMPAÑANTES MEJORADA */}
      <div className="companions-list">
        {formData.companions && formData.companions.length > 0 ? (
          formData.companions.map((companion, index) => {
            // ✅ IDENTIFICADOR ÚNICO MEJORADO
            const companionKey =
              companion.idCompanions || companion.id || companion.tempId || companion.documentNumber || index
            const companionId = companion.idCompanions || companion.id || companion.tempId || companion.documentNumber

            return (
              <div
                key={companionKey}
                className="companion-card"
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "10px",
                  backgroundColor: companion.isTemporary ? "#f8f9fa" : "white",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "16px" }}>{companion.name}</strong>
                      {companion.isTemporary && (
                        <span
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "3px",
                          }}
                        >
                          Temporal
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      <p style={{ margin: "4px 0" }}>
                        <strong>Documento:</strong> {companion.documentType || "N/A"} - {companion.documentNumber}
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        <strong>Edad:</strong> {companion.age} años
                      </p>
                      <p style={{ margin: "4px 0" }}>
                        <strong>EPS:</strong> {companion.eps}
                      </p>
                      {companion.birthdate && (
                        <p style={{ margin: "4px 0" }}>
                          <strong>Fecha de nacimiento:</strong> {companion.birthdate}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCompanion(companionId, companion.name)}
                      disabled={loading}
                      className="delete-btn"
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {loading ? "..." : "Eliminar"}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              border: "2px dashed #dee2e6",
              borderRadius: "8px",
              color: "#6c757d",
            }}
          >
            <p style={{ fontSize: "16px", margin: "0 0 10px 0" }}>👥 No hay acompañantes registrados</p>
            <p style={{ fontSize: "14px", margin: "0" }}>Usa el formulario de abajo para agregar acompañantes</p>
          </div>
        )}
      </div>

      {/* ✅ FORMULARIO DE ACOMPAÑANTES - Solo mostrar si faltan por agregar */}
      {!isReadOnly && remainingCount > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              padding: "15px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #2196f3",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            <p style={{ margin: "0", fontWeight: "bold", color: "#1976d2" }}>
              📝 Faltan {remainingCount} acompañante{remainingCount > 1 ? "s" : ""} por registrar
            </p>
          </div>
          <CompanionsForm onSaveCompanion={handleSaveCompanion} />
        </div>
      )}

      {/* ✅ MENSAJE DE COMPLETADO */}
      {currentCount === expectedCount && expectedCount > 0 && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#d4edda",
            border: "1px solid #c3e6cb",
            borderRadius: "4px",
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <h4 style={{ color: "#155724", margin: "0 0 10px 0" }}>✅ ¡Todos los acompañantes han sido registrados!</h4>
          <p style={{ color: "#155724", margin: "0", fontSize: "14px" }}>
            Puedes continuar al siguiente paso o agregar/eliminar acompañantes si es necesario.
          </p>
        </div>
      )}
    </div>
  )
}

CompanionsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool,
  onSaveCompanion: PropTypes.func.isRequired,
  onDeleteCompanion: PropTypes.func.isRequired,
}

// ✅ COMPONENTE DE SELECTOR DE CANTIDAD MINIMALISTA
function QuantitySelector({ value, onChange, min = 0, max = 99, disabled = false }) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e) => {
    const newValue = Number.parseInt(e.target.value) || 0
    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className="quantity-selector">
      <button
        type="button"
        className="quantity-btn decrease"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <input
        type="number"
        className="quantity-input"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Cantidad"
      />
      <button
        type="button"
        className="quantity-btn increase"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  )
}

export function AvailabilityStep({ formData, errors, onCabinSelect, onRoomSelect, onServiceQuantityChange }) {
  const companionCount = formData.companionCount || 0
  const totalGuests = companionCount + 1

  // Función para obtener la cantidad actual de un servicio
  const getServiceQuantity = (serviceId) => {
    const service = formData.selectedServices?.find((s) => s.serviceId === serviceId)
    return service ? service.quantity : 0
  }

  // ✅ FUNCIÓN MEJORADA CON TOASTS
  const handleQuantityChange = (serviceId, newQuantity) => {
    const service = formData.availableServices?.find((s) => s.Id_Service === serviceId)
    const serviceName = service?.name || "Servicio"

    if (newQuantity === 0) {
      toast.info(`${serviceName} eliminado de la selección`, {
        position: "top-right",
        autoClose: 2000,
      })
    } else if (getServiceQuantity(serviceId) === 0) {
      toast.success(`${serviceName} agregado (x${newQuantity})`, {
        position: "top-right",
        autoClose: 2000,
      })
    }

    onServiceQuantityChange(serviceId, newQuantity)
  }

  // ✅ FUNCIÓN PARA SELECCIONAR CABAÑA CON TOAST
  const handleCabinSelect = (cabinId) => {
    const cabin = formData.availableCabins?.find((c) => c.idCabin === cabinId)
    const cabinName = cabin?.name || `Cabaña ${cabinId}`

    if (formData.idCabin === cabinId) {
      toast.info(`${cabinName} deseleccionada`, {
        position: "top-right",
        autoClose: 2000,
      })
    } else {
      toast.success(`${cabinName} seleccionada`, {
        position: "top-right",
        autoClose: 2000,
      })
    }

    onCabinSelect(cabinId)
  }

  // ✅ FUNCIÓN PARA SELECCIONAR HABITACIÓN CON TOAST
  const handleRoomSelect = (roomId) => {
    const room = formData.availableBedrooms?.find((r) => r.idRoom === roomId)
    const roomName = room?.name || `Habitación ${roomId}`

    if (formData.idRoom === roomId) {
      toast.info(`${roomName} deseleccionada`, {
        position: "top-right",
        autoClose: 2000,
      })
    } else {
      toast.success(`${roomName} seleccionada`, {
        position: "top-right",
        autoClose: 2000,
      })
    }

    onRoomSelect(roomId)
  }

  return (
    <div className="availability-step">
      <h2 className="step-title">Selección de Alojamiento</h2>

      <div className="guest-info">
        <p>
          <strong>Huéspedes totales:</strong> {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
        </p>
        <p>
          <strong>Alojamiento disponible:</strong>
          {formData.availableCabins?.length > 0 && formData.availableBedrooms?.length > 0
            ? "Cabañas y habitaciones"
            : formData.availableCabins?.length > 0
              ? "Solo cabañas"
              : formData.availableBedrooms?.length > 0
                ? "Solo habitaciones"
                : "Sin disponibilidad"}
        </p>
      </div>

      {errors.accommodation && <div className="error-message">{errors.accommodation}</div>}

      {/* Sección de Cabañas - Mostrar si hay cabañas disponibles */}
      {formData.availableCabins?.length > 0 && (
        <div className="section-container">
          <h3 className="section-title">
            Cabañas Disponibles ({formData.availableCabins.length})
            {totalGuests > 4 && <span className="recommended-badge">Recomendado para {totalGuests} personas</span>}
          </h3>

          <div className="options-grid">
            {formData.availableCabins.map((cabin) => (
              <div
                key={cabin.idCabin}
                className={`option-item ${formData.idCabin === cabin.idCabin ? "selected" : ""}`}
                onClick={() => handleCabinSelect(cabin.idCabin)}
              >
                <div className="option-selector">
                  {formData.idCabin === cabin.idCabin ? (
                    <span className="selected-icon">✓</span>
                  ) : (
                    <span className="unselected-icon">○</span>
                  )}
                </div>
                <div className="option-content">
                  <h4 className="option-name">{cabin.name}</h4>
                  <p className="option-detail">
                    Capacidad: {cabin.capacity || 7} personas
                    {cabin.capacity >= totalGuests && <span className="capacity-ok"> ✓</span>}
                  </p>
                  <p className="option-description">{cabin.description}</p>
                  {cabin.image && (
                    <img src={cabin.image || "/placeholder.svg"} alt={cabin.name} className="option-image" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de Habitaciones - Mostrar si hay habitaciones disponibles */}
      {formData.availableBedrooms?.length > 0 && (
        <div className="section-container">
          <h3 className="section-title">
            Habitaciones Disponibles ({formData.availableBedrooms.length})
            {totalGuests <= 2 && (
              <span className="recommended-badge">
                Recomendado para {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
              </span>
            )}
          </h3>

          <div className="options-grid">
            {formData.availableBedrooms.map((bedroom) => (
              <div
                key={bedroom.idRoom}
                className={`option-item ${formData.idRoom === bedroom.idRoom ? "selected" : ""}`}
                onClick={() => handleRoomSelect(bedroom.idRoom)}
              >
                <div className="option-selector">
                  {formData.idRoom === bedroom.idRoom ? (
                    <span className="selected-icon">✓</span>
                  ) : (
                    <span className="unselected-icon">○</span>
                  )}
                </div>
                <div className="option-content">
                  <h4 className="option-name">Habitación {bedroom.name || bedroom.idRoom}</h4>
                  <p className="option-detail">
                    Capacidad: {bedroom.capacity || 2} personas
                    {(bedroom.capacity || 2) >= totalGuests && <span className="capacity-ok"> ✓</span>}
                  </p>
                  <p className="option-description">{bedroom.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay alojamiento disponible */}
      {(!formData.availableCabins || formData.availableCabins.length === 0) &&
        (!formData.availableBedrooms || formData.availableBedrooms.length === 0) && (
          <div className="no-accommodation-available">
            <h3>❌ No hay alojamiento disponible</h3>
            <p>
              No se encontraron cabañas ni habitaciones con capacidad para {totalGuests} persona
              {totalGuests !== 1 ? "s" : ""}.
            </p>
            <p>Por favor, reduce el número de acompañantes o contacta al administrador.</p>
          </div>
        )}

      {/* Servicios adicionales */}
      <div className="section-container">
        <h3 className="section-title">Servicios Adicionales</h3>

        {formData.availableServices?.length > 0 ? (
          <div className="services-grid-with-quantity">
            {formData.availableServices.map((service) => {
              const currentQuantity = getServiceQuantity(service.Id_Service)
              const isSelected = currentQuantity > 0

              return (
                <div key={service.Id_Service} className={`service-item-with-quantity ${isSelected ? "selected" : ""}`}>
                  <div className="service-info">
                    <div className="service-header">
                      <h4 className="service-name">{service.name}</h4>
                      <span className="service-price">{formatCOP(service.Price)}</span>
                    </div>
                    <p className="service-description">{service.Description}</p>
                  </div>

                  <div className="service-quantity-controls">
                    <QuantitySelector
                      value={currentQuantity}
                      onChange={(newQuantity) => handleQuantityChange(service.Id_Service, newQuantity)}
                      min={0}
                      max={20}
                    />
                    {currentQuantity > 0 && (
                      <div className="service-subtotal">Subtotal: {formatCOP(service.Price * currentQuantity)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="no-options">No hay servicios disponibles</p>
        )}

        {/* Resumen de servicios seleccionados */}
        {formData.selectedServices && formData.selectedServices.length > 0 && (
          <div className="services-summary">
            <h4>Servicios seleccionados:</h4>
            <div className="selected-services-list">
              {formData.selectedServices.map((serviceSelection) => {
                const service = formData.availableServices.find((s) => s.Id_Service === serviceSelection.serviceId)
                if (!service) return null

                return (
                  <div key={serviceSelection.serviceId} className="selected-service-item">
                    <span className="service-name">{service.name}</span>
                    <span className="service-quantity">x{serviceSelection.quantity}</span>
                    <span className="service-total">{formatCOP(service.Price * serviceSelection.quantity)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

AvailabilityStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onCabinSelect: PropTypes.func.isRequired,
  onRoomSelect: PropTypes.func.isRequired,
  onServiceQuantityChange: PropTypes.func.isRequired,
}

export const PaymentStep = ({
  totalAmount,
  reservationPayments,
  tempPayments,
  isReadOnly,
  loading,
  onPaymentSubmit,
}) => {
  useEffect(() => {
    return () => {}
  }, [])

  useEffect(() => {}, [tempPayments])

  useEffect(() => {}, [reservationPayments])

  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Combinar pagos de la reserva y temporales
  const allPayments = [...(reservationPayments || []), ...(tempPayments || [])]

  // Calcular totales
  const totalPaid = allPayments.reduce((sum, payment) => {
    return payment.status !== "Anulado" ? sum + (Number(payment.amount) || 0) : sum
  }, 0)

  const remainingBalance = Math.max(0, totalAmount - totalPaid)

  // ✅ MANEJO DE PAGO SIN CERRAR EL FORMULARIO
  const handlePaymentSubmit = async (formDataOrPayment) => {
    try {
      const savedPayment = await onPaymentSubmit(formDataOrPayment)

      // ✅ IMPORTANTE: Mensaje más claro sobre el estado del formulario
      toast.success("Pago registrado correctamente. El formulario permanece abierto para agregar más pagos.", {
        position: "top-right",
        autoClose: 3000,
      })

      return savedPayment // Retornar el pago guardado
    } catch (error) {
      console.error("💰 PaymentStep handlePaymentSubmit ERROR:", error)
      throw error
    }
  }

  const handleCancelPayment = () => {
    toast.info("Formulario de pago limpiado", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <div>
      {/* Resumen de pagos */}
      <div className="payment-summary-section">
        <h3>Resumen de Pagos</h3>
        <div className="payment-summary-grid">
          <div className="summary-item">
            <span>Total de la reserva:</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
          <div className="summary-item">
            <span>Total pagado:</span>
            <strong>{formatCurrency(totalPaid)}</strong>
          </div>
          <div className="summary-item">
            <span>Saldo pendiente:</span>
            <strong className={remainingBalance > 0 ? "text-warning" : "text-success"}>
              {formatCurrency(remainingBalance)}
            </strong>
          </div>
        </div>

        {/* Lista de pagos */}
        {allPayments.length > 0 && (
          <div className="payments-list">
            <h4>Pagos registrados:</h4>
            <TablePayments payments={allPayments} isLoading={loading} onView={null} onEdit={null} />
          </div>
        )}
      </div>

      {/* Formulario de pago o botón para mostrar */}
      {!isReadOnly && (
        <div
          className="payment-form-section"
          onClick={(e) => {
            // Detener la propagación de cualquier clic dentro de esta sección
            e.stopPropagation()
          }}
        >
          <PaymentForm
            totalAmount={remainingBalance > 0 ? remainingBalance : totalAmount}
            onPaymentSubmit={handlePaymentSubmit}
            onCancel={handleCancelPayment}
            keepFormOpen={true} // ✅ IMPORTANTE: Mantener el formulario abierto
            // ✅ IMPORTANTE: NO pasar onPaymentSuccess para evitar que cierre el modal
          />
        </div>
      )}

      {/* Mensaje de pago completo */}
      {remainingBalance <= 0 && totalPaid > 0 && (
        <div className="payment-complete-message">✅ La reserva está completamente pagada</div>
      )}
    </div>
  )
}

PaymentStep.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  reservationPayments: PropTypes.array.isRequired,
  tempPayments: PropTypes.array.isRequired,
  reservationData: PropTypes.object,
  isReadOnly: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onPaymentSubmit: PropTypes.func.isRequired,
}
