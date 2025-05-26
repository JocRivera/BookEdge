
import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import CompanionsForm from "../componentCompanions/formCompanions"
import "./componentsReservations.css"
import "../componentReservations/availability-step.css"

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

export function BasicInfoStep({ formData, errors, users, planes, loading, isReadOnly, onChange }) {
  const isDiaDeSol = planes.find(p => p.idPlan === Number(formData.idPlan))?.name === "Día de sol"
  return (
    <div className="step-content">
      <div className="form-group">
        <label htmlFor="idUser">Cliente *</label>
        <ClientSearchSelect
          users={users}
          value={formData.idUser}
          onChange={onChange}
          disabled={loading || isReadOnly}
          error={!!errors.idUser}
        />
        {errors.idUser && <span className="error-message">{errors.idUser}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="idPlan">Plan *</label>
        <select
          id="idPlan"
          name="idPlan"
          value={formData.idPlan}
          onChange={onChange}
          disabled={loading || isReadOnly}
          className={errors.idPlan ? "error" : ""}
        >
          <option value="">Seleccione un plan</option>
          {planes.map((plan) => (
            <option key={plan.idPlan} value={plan.idPlan}>
              {plan.name || plan.nombre} - {formatCOP(plan.price || plan.precio || plan.salePrice)}
            </option>
          ))}
        </select>
        {errors.idPlan && <span className="error-message">{errors.idPlan}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">Fecha de inicio *</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={(e) => {
              onChange(e)
              // Si hay fecha de fin y es anterior a la nueva fecha de inicio, limpiarla
              if (formData.endDate && e.target.value > formData.endDate) {
                setTimeout(() => {
                  onChange({ target: { name: "endDate", value: "" } })
                }, 0)
              }
            }}
            min={new Date().toISOString().split("T")[0]}
            disabled={loading || isReadOnly}
            className={errors.startDate ? "error" : ""}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">Fecha de fin *</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={onChange}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            disabled={loading || isReadOnly || isDiaDeSol}
            className={errors.endDate ? "error" : ""}
          />

          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="hasCompanions"
            checked={formData.hasCompanions}
            onChange={onChange}
            disabled={loading || isReadOnly}
          />
          ¿Incluye acompañantes?
        </label>
      </div>

      {formData.hasCompanions && (
        <div className="form-group">
          <label htmlFor="companionCount">Número de acompañantes *</label>
          <input
            type="number"
            id="companionCount"
            name="companionCount"
            min="1"
            value={formData.companionCount}
            onChange={onChange}
            disabled={loading || isReadOnly}
            className={errors.companionCount ? "error" : ""}
          />
          {errors.companionCount && <span className="error-message">{errors.companionCount}</span>}
        </div>
      )}
    </div>
  )
}

BasicInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  planes: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isReadOnly,
  onChange: PropTypes.func.isRequired,
}

export function CompanionsStep({ formData, errors, loading, isReadOnly, onSaveCompanion, onDeleteCompanion }) {
  return (
    <div className="step-content">
      <h3>
        Acompañantes ({formData.companions.length} de {formData.companionCount})
      </h3>

      {errors.companions && <div className="error-message">{errors.companions}</div>}

      <div className="companions-list">
        {formData.companions.map((companion, index) => (
          <div key={companion.idCompanions || index} className="companion-card">
            <div>
              <strong>
                {companion.name} {companion.lastName}
              </strong>
              <p>Documento: {companion.documentNumber}</p>
              {companion.email && <p>Email: {companion.email}</p>}
              {companion.phone && <p>Teléfono: {companion.phone}</p>}
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => onDeleteCompanion(companion.idCompanions)}
                disabled={loading}
                className="delete-btn"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>

      {!isReadOnly && formData.companions.length < formData.companionCount && (
        <CompanionsForm onSaveCompanion={onSaveCompanion} />
      )}
    </div>
  )
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
    const newValue = parseInt(e.target.value) || 0
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
  const showCabins = companionCount > 1
  const showRooms = companionCount <= 1

  // Función para obtener la cantidad actual de un servicio
  const getServiceQuantity = (serviceId) => {
    const service = formData.selectedServices?.find(s => s.serviceId === serviceId)
    return service ? service.quantity : 0
  }

  // Función para manejar cambio de cantidad
  const handleQuantityChange = (serviceId, newQuantity) => {
    onServiceQuantityChange(serviceId, newQuantity)
  }

  return (
    <div className="availability-step">
      <h2 className="step-title">Selección de Alojamiento</h2>

      <div className="guest-info">
        <p>
          <strong>Huéspedes totales:</strong> {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
        </p>
        <p>
          <strong>Tipo de alojamiento requerido:</strong> {showCabins ? "Cabañas" : "Habitaciones"}
        </p>
      </div>

      {errors.accommodation && <div className="error-message">{errors.accommodation}</div>}

      {/* Sección de Cabañas - Solo si hay más de 1 acompañante */}
      {showCabins && (
        <div className="section-container">
          <h3 className="section-title">Cabañas (Para {totalGuests} personas)</h3>

          {formData.availableCabins.length > 0 ? (
            <div className="options-grid">
              {formData.availableCabins.map((cabin) => (
                <div
                  key={cabin.idCabin}
                  className={`option-item ${formData.idCabin === cabin.idCabin ? "selected" : ""}`}
                  onClick={() => onCabinSelect(cabin.idCabin)}
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
                    <p className="option-detail">Capacidad: {cabin.capacity} personas</p>
                    <p className="option-description">{cabin.description}</p>
                    {cabin.image && (
                      <img src={cabin.image || "/placeholder.svg"} alt={cabin.name} className="option-image" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-options">No hay cabañas disponibles para {totalGuests} personas</p>
          )}
        </div>
      )}

      {/* Sección de Habitaciones - Solo si hay 1 acompañante o menos */}
      {showRooms && (
        <div className="section-container">
          <h3 className="section-title">
            Habitaciones (Para {totalGuests} persona{totalGuests !== 1 ? "s" : ""})
          </h3>

          {formData.availableBedrooms.length > 0 ? (
            <div className="options-grid">
              {formData.availableBedrooms.map((bedroom) => (
                <div
                  key={bedroom.idRoom}
                  className={`option-item ${formData.idRoom === bedroom.idRoom ? "selected" : ""}`}
                  onClick={() => onRoomSelect(bedroom.idRoom)}
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
                    {bedroom.capacity && <p className="option-detail">Capacidad: {bedroom.capacity} personas</p>}
                    <p className="option-description">{bedroom.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-options">No hay habitaciones disponibles</p>
          )}
        </div>
      )}

      {/* ✅ SECCIÓN DE SERVICIOS CON CANTIDADES */}
      <div className="section-container">
        <h3 className="section-title">Servicios Adicionales</h3>

        {formData.availableServices.length > 0 ? (
          <div className="services-grid-with-quantity">
            {formData.availableServices.map((service) => {
              const currentQuantity = getServiceQuantity(service.Id_Service)
              const isSelected = currentQuantity > 0

              return (
                <div
                  key={service.Id_Service}
                  className={`service-item-with-quantity ${isSelected ? "selected" : ""}`}
                >
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
                      <div className="service-subtotal">
                        Subtotal: {formatCOP(service.Price * currentQuantity)}
                      </div>
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
                const service = formData.availableServices.find(s => s.Id_Service === serviceSelection.serviceId)
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

export function PaymentStep({
  totalAmount = 0,
  reservationPayments = [],
  tempPayments = [],
  isReadOnly,
  loading,
  onPaymentSubmit,
}) {
  // Asegurar que los arrays existan y manejar valores undefined
  const allPayments = [...(reservationPayments || []), ...(tempPayments || [])]

  // Calcular el total pagado con seguridad
  const paidAmount = allPayments.reduce((sum, payment) => {
    return sum + (payment?.amount || 0)
  }, 0)

  // Asegurar que totalAmount sea un número
  const safeTotalAmount = Number(totalAmount) || 0
  const remainingAmount = Math.max(0, safeTotalAmount - paidAmount)

  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "Efectivo",
    status: "Pendiente",
  })

  const handlePaymentChange = (e) => {
    const { name, value } = e.target
    setPaymentData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    try {
      await onPaymentSubmit(paymentData)
      setPaymentData({
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "Efectivo",
        status: "Pendiente",
      })
    } catch (error) {
      console.error("Error al procesar pago:", error)
    }
  }

  return (
    <div className="step-content">
      <div className="payment-summary">
        <h3>Resumen del Pago</h3>
        <div className="summary-row">
          <span>Total Reserva:</span>
          <span>{formatCOP(safeTotalAmount)}</span>
        </div>
        <div className="summary-row">
          <span>Pagado:</span>
          <span>{formatCOP(paidAmount)}</span>
        </div>
        <div className="summary-row total">
          <span>Saldo Pendiente:</span>
          <span>{formatCOP(remainingAmount)}</span>
        </div>
      </div>



      {!isReadOnly && remainingAmount > 0 && (
        <div className="add-payment-form">
          <h4>Agregar Pago</h4>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Monto *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                min="0.01"
                max={remainingAmount}
                step="0.01"
                value={paymentData.amount}
                onChange={handlePaymentChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentDate">Fecha *</label>
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={paymentData.paymentDate}
                onChange={handlePaymentChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="paymentMethod">Método de Pago *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={handlePaymentChange}
                disabled={loading}
                required
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado *</label>
              <select
                id="status"
                name="status"
                value={paymentData.status}
                onChange={handlePaymentChange}
                disabled={loading}
                required
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Completado">Completado</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePaymentSubmit}
            disabled={loading}
            className="submit-btn"
          >
            {loading ? "Procesando..." : "Registrar Pago"}
          </button>
        </div>
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
