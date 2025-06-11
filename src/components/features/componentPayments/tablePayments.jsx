import { useState } from "react"
import PropTypes from "prop-types"
import { FaDownload, FaTimes, FaExclamationTriangle } from "react-icons/fa"
import { ActionButtons } from "../../common/Button/customButton"
import "./componentPayments.css"
import { toast } from "react-toastify"

const TablePayments = ({ payments, onDetailPayment, onStatusChange, isLoading }) => {
  const [previewImage, setPreviewImage] = useState(null)
  const [imageLoadError, setImageLoadError] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-CO", options)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const handleStatusChange = (paymentId, e) => {
    if (onStatusChange) {
      onStatusChange(paymentId, e.target.value)
    }
  }

  const handleViewDetails = (paymentId, payment) => {
    if (onDetailPayment) {
      onDetailPayment(paymentId, payment)
    }
  }

  // Función simplificada que siempre abre el modal
  const handlePreviewVoucher = (voucherUrl, e) => {
    e.preventDefault()
    console.log("🖼️ Intentando mostrar comprobante:", voucherUrl)

    // Validar que la URL existe
    if (!voucherUrl) {
      console.error("URL del comprobante vacía o inválida")
      toast.error("No hay comprobante disponible para mostrar")
      return
    }

    // Resetear estado de error y abrir modal directamente
    setImageLoadError(false)
    setPreviewImage(voucherUrl)
    console.log("✅ Modal abierto, cargando comprobante...")
  }

  // Función para cerrar el modal
  const closePreview = () => {
    setPreviewImage(null)
    setImageLoadError(false)
  }

  // Función para manejar errores de carga de imagen
  const handleImageError = () => {
    console.error("❌ Error al cargar imagen en modal:", previewImage)
    setImageLoadError(true)
    toast.error("Error al cargar el comprobante")
  }

  // Función para manejar carga exitosa de imagen
  const handleImageLoad = () => {
    console.log("✅ Imagen cargada exitosamente en modal")
    setImageLoadError(false)
  }

  const renderVoucherCell = (payment) => {
    if (!payment.voucher) {
      return <span className="no-voucher">Sin comprobante</span>
    }

    return (
      <button
        onClick={(e) => handlePreviewVoucher(payment.voucher, e)}
        className="ver-comprobante-btn"
        title="Ver comprobante"
      >
        Ver Comprobante
      </button>
    )
  }

  return (
    <div className="payments-table-container">
      {/* Modal de vista previa mejorado */}
      {previewImage && (
        <div className="voucher-preview-modal" onClick={closePreview}>
          <div className="voucher-preview-content" onClick={(e) => e.stopPropagation()} style={{
            width: '85%',
            maxWidth: '800px',
            maxHeight: '95vh',
            overflow: 'hidden'
          }}>
            {/* Aquí está el cambio: h3 contiene tanto el título como el botón de cerrar */}
            <h3>
              Comprobante de Pago
              <button
                className="close-preview-btn"
                onClick={closePreview}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </h3>

            <div className="voucher-image-container" style={{
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {previewImage.toLowerCase().endsWith(".pdf") ? (
                // Manejo de PDFs
                <iframe
                  src={previewImage}
                  width="100%"
                  height="500px"
                  title="Comprobante PDF"
                  className="pdf-preview"
                  onError={() => {
                    console.error("Error al cargar PDF:", previewImage)
                    setImageLoadError(true)
                    toast.error("Error al cargar el PDF")
                  }}
                />
              ) : (
                // Manejo de imágenes con fallback
                <>
                  {!imageLoadError ? (
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Comprobante de pago"
                      className="voucher-preview-img"
                      crossOrigin="anonymous"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                      style={{
                        maxWidth: "55%",
                        maxHeight: "500vh",
                        objectFit: "contain",
                        display: imageLoadError ? "none" : "block",
                      }}
                    />
                  ) : null}

                  {imageLoadError && (
                    <div className="error-fallback">
                      <FaExclamationTriangle size={48} color="#dc3545" />
                      <h4>No se pudo cargar el comprobante</h4>
                      <p>La imagen puede estar dañada o no ser accesible</p>
                      <div className="error-actions">
                        <button
                          onClick={() => {
                            setImageLoadError(false)
                            // Forzar recarga de la imagen
                            const img = document.querySelector(".voucher-preview-img")
                            if (img) {
                              img.src = previewImage + "?t=" + Date.now()
                            }
                          }}
                          className="retry-btn"
                        >
                          Reintentar
                        </button>
                        <button
                          onClick={() => {
                            // Copiar URL al portapapeles
                            navigator.clipboard
                              .writeText(previewImage)
                              .then(() => {
                                toast.success("URL copiada al portapapeles")
                              })
                              .catch(() => {
                                toast.error("No se pudo copiar la URL")
                              })
                          }}
                          className="copy-url-btn"
                        >
                          Copiar URL
                        </button>
                      </div>
                      <div className="url-display">
                        <small>URL: {previewImage}</small>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="voucher-preview-actions">
              <a href={previewImage} download target="_blank" rel="noopener noreferrer" className="download-btn">
                <FaDownload /> Descargar
              </a>
            </div>
          </div>
        </div>
      )}

      <table className="payments-table">
        <thead>
          <tr>
            <th>Método</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Comprobante</th>
            {onDetailPayment && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr key="loading-row">
              <td colSpan={6} className="loading-row">
                Cargando pagos...
              </td>
            </tr>
          ) : !payments || payments.length === 0 ? (
            <tr key="no-data-row">
              <td colSpan={6} className="no-data-row">
                No se encontraron pagos
              </td>
            </tr>
          ) : (
            payments.map((payment, index) => (
              <tr key={payment.idPayments || payment.tempId || `payment-${index}`}>
                <td>{payment.paymentMethod}</td>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>
                  {onStatusChange ? (
                    <select
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment.idPayments || payment.tempId, e)}
                      className={`status-select ${(payment.status || "Pendiente").toLowerCase()}`}
                      disabled={isLoading || payment.isTemp}
                    >
                      <option value="Confirmado">Confirmado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Anulado">Anulado</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${(payment.status || "Pendiente").toLowerCase()}`}>
                      {payment.status || "Pendiente"}
                    </span>
                  )}
                </td>
                <td>{renderVoucherCell(payment)}</td>

                {onDetailPayment && (
                  <td className="config-actions-cell">
                    <ActionButtons onView={() => handleViewDetails(payment.idPayments || payment.tempId, payment)} />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

TablePayments.propTypes = {
  payments: PropTypes.array.isRequired,
  onDetailPayment: PropTypes.func,
  onStatusChange: PropTypes.func,
  isLoading: PropTypes.bool,
}

export default TablePayments