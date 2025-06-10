import axios from "axios"

const API_URL_PAYMENTS = "http://localhost:3000/payments"
const API_URL_RESERVATIONS = "http://localhost:3000/reservations"

// Configuración común de axios para todas las solicitudes
const api = axios.create({
  baseURL: API_URL_PAYMENTS,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  },
})

export const getAllPayments = async (params = {}) => {
  try {
    const response = await api.get("/", {
      params: {
        // Parámetros opcionales para filtrado, paginación, etc.
        ...params,
      },
    })

    // Validar que la respuesta sea un array
    if (!Array.isArray(response.data)) {
      throw new Error("La respuesta del servidor no es un arreglo válido")
    }

    return response.data
  } catch (error) {
    console.error("Error fetching payments:", error)

    // Personalizar mensajes de error según el tipo de error
    if (error.response) {
      // Error de respuesta del servidor (4xx, 5xx)
      throw new Error(error.response.data.message || `Error del servidor: ${error.response.status}`)
    } else if (error.request) {
      // Error de conexión (no se recibió respuesta)
      throw new Error("No se pudo conectar al servidor. Verifique su conexión.")
    } else {
      // Error en la configuración de la solicitud
      throw new Error("Error al configurar la solicitud de pagos")
    }
  }
}

export const getPaymentById = async (id) => {
  try {
    // Validación básica del ID
    if (!id) {
      throw new Error("Se requiere un ID de pago válido")
    }

    const response = await api.get(`/${id}`)

    // Validar que la respuesta tenga datos
    if (!response.data) {
      throw new Error("No se encontraron datos para este pago")
    }

    return response.data
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error)

    // Manejo específico para error 404 (No encontrado)
    if (error.response?.status === 404) {
      throw new Error("El pago solicitado no fue encontrado")
    }

    // Propagamos otros errores
    throw error
  }
}

// ✅ NUEVA FUNCIÓN PARA BUSCAR RESERVA ASOCIADA A UN PAGO
export const findReservationByPaymentId = async (paymentId) => {
  try {
    console.log("🔍 === BUSCANDO RESERVA PARA PAGO ===")
    console.log("💳 Payment ID:", paymentId)

    // Estrategia 1: Buscar en todas las reservas
    const allReservations = await axios.get(API_URL_RESERVATIONS)

    if (Array.isArray(allReservations.data)) {
      for (const reservation of allReservations.data) {
        try {
          // Obtener pagos de cada reserva
          const reservationPayments = await getReservationPayments(reservation.idReservation)

          // Verificar si este pago está en esta reserva
          const hasPayment = reservationPayments.some(
            (p) =>
              p.idPayments === paymentId ||
              p.id === paymentId ||
              String(p.idPayments) === String(paymentId) ||
              String(p.id) === String(paymentId),
          )

          if (hasPayment) {
            console.log("✅ Reserva encontrada:", reservation.idReservation)
            return reservation.idReservation
          }
        } catch (error) {
          console.error(`❌ Error buscando pagos para reserva ${reservation.idReservation}:`, error)
          // Continuar con la siguiente reserva si hay error
          continue
        }
      }
    }

    console.log("❌ No se encontró reserva asociada al pago")
    return null
  } catch (error) {
    console.error("❌ Error buscando reserva:", error)
    return null
  }
}

export const createPayment = async (paymentData) => {
  try {
    const formData = new FormData()

    // Campos obligatorios
    formData.append("paymentMethod", paymentData.paymentMethod)
    formData.append("paymentDate", paymentData.paymentDate)
    formData.append("amount", paymentData.amount)

    // Campos opcionales
    if (paymentData.status) formData.append("status", paymentData.status)
    if (paymentData.confirmationDate) formData.append("confirmationDate", paymentData.confirmationDate)
    if (paymentData.voucher) formData.append("voucher", paymentData.voucher)
    if (paymentData.idReservation) formData.append("idReservation", paymentData.idReservation)

    const response = await axios.post(API_URL_PAYMENTS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    console.error("Error creating payment:", error.response?.data || error.message)
    throw error
  }
}

export const updatePayment = async (id, paymentData) => {
  try {
    const formData = new FormData()

    // Campos actualizables
    if (paymentData.paymentMethod) formData.append("paymentMethod", paymentData.paymentMethod)
    if (paymentData.paymentDate) formData.append("paymentDate", paymentData.paymentDate)
    if (paymentData.amount) formData.append("amount", paymentData.amount)
    if (paymentData.status) formData.append("status", paymentData.status)
    if (paymentData.confirmationDate) formData.append("confirmationDate", paymentData.confirmationDate)
    if (paymentData.voucher) formData.append("voucher", paymentData.voucher)

    const response = await axios.put(`${API_URL_PAYMENTS}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error)
    throw error
  }
}

export const deletePayment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL_PAYMENTS}/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting payment with ID ${id}:`, error)
    throw error
  }
}

// ✅ FUNCIÓN MEJORADA PARA CAMBIAR ESTADO CON BÚSQUEDA DE RESERVA
export const changePaymentStatus = async (id, status) => {
  try {
    console.log("💳 === CAMBIANDO ESTADO DE PAGO ===")
    console.log("🆔 Payment ID:", id)
    console.log("📊 New Status:", status)

    // Validar el estado según el modelo
    const validStatuses = ["Confirmado", "Pendiente", "Anulado"]
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`)
    }

    // 1. BUSCAR LA RESERVA ASOCIADA ANTES DE ACTUALIZAR
    console.log("🔍 Buscando reserva asociada al pago...")
    const associatedReservationId = await findReservationByPaymentId(id)

    // 2. Actualizar el estado del pago
    const response = await axios.patch(`${API_URL_PAYMENTS}/${id}/status`, { status })
    const updatedPayment = response.data

    console.log("✅ Estado de pago actualizado:", updatedPayment)

    // 3. Si encontramos una reserva asociada, sincronizar su estado
    if (associatedReservationId) {
      try {
        console.log("🔄 Sincronizando estado de reserva asociada...")
        console.log("🏨 Reservation ID encontrado:", associatedReservationId)

        // Crear un objeto de pago con la información necesaria para la sincronización
        const paymentForSync = {
          ...updatedPayment,
          idReservation: associatedReservationId,
          idPayments: id,
          status: status,
        }

        await syncReservationStatus(associatedReservationId, paymentForSync)
      } catch (syncError) {
        console.error("⚠️ Error al sincronizar reserva, pero pago actualizado:", syncError)
        // No lanzamos el error para no fallar la actualización del pago
      }
    } else {
      console.log("ℹ️ No se encontró reserva asociada al pago")
    }

    // 4. Devolver el pago actualizado con el ID de reserva si se encontró
    return {
      ...updatedPayment,
      idReservation: associatedReservationId,
      idPayments: id,
    }
  } catch (error) {
    console.error(`Error changing status for payment ${id}:`, error)
    throw error
  }
}

// Servicio para operaciones relacionadas con reservas
export const getReservationPayments = async (idReservation) => {
  try {
    const response = await axios.get(`${API_URL_PAYMENTS}/reservations/${idReservation}/payments`)
    // Asegurar que siempre devuelva un array
    return Array.isArray(response?.data) ? response.data : []
  } catch (error) {
    console.error(`Error getting payments for reservation ${idReservation}:`, error)
    return [] // Devuelve array vacío en caso de error
  }
}

// ✅ FUNCIÓN MEJORADA PARA AGREGAR PAGO CON SINCRONIZACIÓN AUTOMÁTICA
export const addPaymentToReservation = async (paymentData) => {
  try {
    console.log("💳 === INICIO addPaymentToReservation ===")
    console.log("📥 Datos de pago recibidos:", paymentData)
    console.log("📊 Tipo de datos:", paymentData.constructor.name)

    let processedData
    let reservationId

    // ✅ MANEJAR FORMDATA Y OBJETO NORMAL
    if (paymentData instanceof FormData) {
      console.log("📋 Procesando FormData...")

      // ✅ EXTRAER ID DE RESERVA DEL FORMDATA O CONTEXTO
      reservationId = paymentData.get("idReservation")

      // Si no está en FormData, necesitamos pasarlo por separado
      if (!reservationId || reservationId === "undefined") {
        throw new Error("ID de reserva no encontrado en FormData. Debe pasarse por separado.")
      }

      // ✅ EXTRAER Y PROCESAR DATOS DEL FORMDATA
      const rawAmount = paymentData.get("amount")
      console.log("💰 Monto raw:", rawAmount, typeof rawAmount)

      if (!rawAmount || rawAmount === "" || rawAmount === "null") {
        throw new Error("El monto del pago es requerido")
      }

      // ✅ CONVERTIR STRING A NÚMERO CORRECTAMENTE
      let cleanAmount = rawAmount
      if (typeof cleanAmount === "string") {
        cleanAmount = cleanAmount.replace(/,/g, "").replace(/\s/g, "").trim()
      }

      const amount = Number.parseFloat(cleanAmount)
      console.log("🔢 Monto convertido a número:", amount, typeof amount)

      if (isNaN(amount) || amount <= 0) {
        throw new Error("El monto del pago no es válido")
      }

      // ✅ CREAR OBJETO CON LA ESTRUCTURA EXACTA QUE ESPERA EL BACKEND
      processedData = {
        amount: amount,
        date: paymentData.get("paymentDate") || new Date().toISOString().split("T")[0],
        paymentMethod: paymentData.get("paymentMethod") || "efectivo",
        status: paymentData.get("status") || "Pendiente",
      }

      console.log("✅ Datos procesados (con nombres correctos):", processedData)

      // ✅ MANEJAR ARCHIVO SI EXISTE
      const voucherFile = paymentData.get("voucher")
      if (voucherFile && voucherFile instanceof File) {
        console.log("📁 Archivo de comprobante encontrado:", voucherFile.name)

        // ✅ CREAR FORMDATA CON LOS NOMBRES CORRECTOS DE CAMPOS
        const formDataToSend = new FormData()
        formDataToSend.append("amount", amount)
        formDataToSend.append("date", processedData.date)
        formDataToSend.append("paymentMethod", processedData.paymentMethod)
        formDataToSend.append("status", processedData.status)
        formDataToSend.append("voucher", voucherFile)

        console.log("📤 Enviando FormData con archivo a:", `${API_URL_RESERVATIONS}/${reservationId}/payments`)

        const response = await axios.post(`${API_URL_RESERVATIONS}/${reservationId}/payments`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        const savedPayment = response.data

        // ✅ SINCRONIZAR ESTADO DE RESERVA DESPUÉS DE AGREGAR PAGO CON COMPROBANTE
        if (savedPayment && voucherFile) {
          try {
            console.log("🔄 Sincronizando estado de reserva después de subir comprobante...")
            await syncReservationStatus(reservationId, savedPayment)
          } catch (syncError) {
            console.error("⚠️ Error al sincronizar reserva:", syncError)
          }
        }

        return savedPayment
      } else {
        // ✅ SIN ARCHIVO: ENVIAR COMO JSON
        console.log("📤 Enviando JSON sin archivo a:", `${API_URL_RESERVATIONS}/${reservationId}/payments`)
        console.log("📊 Datos JSON a enviar:", processedData)

        const response = await axios.post(`${API_URL_RESERVATIONS}/${reservationId}/payments`, processedData, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        return response.data
      }
    } else {
      console.log("📋 Procesando objeto normal...")

      // ✅ EXTRAER ID DE RESERVA DEL OBJETO
      reservationId = paymentData.idReservation

      if (!reservationId || reservationId === "undefined") {
        throw new Error("ID de reserva no válido")
      }

      // ✅ PROCESAR DATOS DEL OBJETO
      const rawAmount = paymentData.amount
      console.log("💰 Monto raw desde objeto:", rawAmount, typeof rawAmount)

      let amount
      if (typeof rawAmount === "string") {
        const cleanAmount = rawAmount.replace(/,/g, "").replace(/\s/g, "").trim()
        amount = Number.parseFloat(cleanAmount)
      } else {
        amount = Number.parseFloat(rawAmount)
      }

      console.log("🔢 Monto convertido a número:", amount, typeof amount)

      if (!rawAmount && rawAmount !== 0) {
        throw new Error("El monto del pago es requerido")
      }

      if (isNaN(amount) || amount <= 0) {
        throw new Error("El monto del pago no es válido")
      }

      processedData = {
        amount: amount,
        date: paymentData.paymentDate || paymentData.date || new Date().toISOString().split("T")[0],
        paymentMethod: paymentData.paymentMethod || "efectivo",
        status: paymentData.status || "Pendiente",
      }
    }

    console.log("✅ Datos procesados finales:", processedData)
    console.log("🆔 ID de reserva:", reservationId)
    console.log("🌐 URL de envío:", `${API_URL_RESERVATIONS}/${reservationId}/payments`)

    // ✅ ENVIAR DATOS PROCESADOS COMO JSON
    const response = await axios.post(`${API_URL_RESERVATIONS}/${reservationId}/payments`, processedData, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("✅ Respuesta exitosa:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ === ERROR EN addPaymentToReservation ===")
    console.error("Error completo:", error)

    if (error.response && error.response.data) {
      console.error("Datos de respuesta del servidor:", error.response.data)
      console.error("Status:", error.response.status)
      console.error("Headers:", error.response.headers)

      if (error.response.data.required) {
        console.error("Campos requeridos:", error.response.data.required)
      }
      if (error.response.data.received) {
        console.error("Campos recibidos:", error.response.data.received)
      }
    }

    throw error
  }
}

// ✅ FUNCIÓN AUXILIAR PARA AGREGAR PAGO CON ID DE RESERVA SEPARADO
export const addPaymentToReservationWithId = async (reservationId, paymentData) => {
  try {
    console.log("💳 === addPaymentToReservationWithId ===")
    console.log("🆔 ReservationId:", reservationId)
    console.log("📥 PaymentData:", paymentData)

    // ✅ VALIDAR ID DE RESERVA
    if (!reservationId || reservationId === "undefined") {
      throw new Error("ID de reserva no válido")
    }

    // ✅ SI ES FORMDATA, AGREGAR EL ID DE RESERVA
    if (paymentData instanceof FormData) {
      paymentData.append("idReservation", reservationId)
      return await addPaymentToReservation(paymentData)
    } else {
      // ✅ SI ES OBJETO, AGREGAR EL ID DE RESERVA
      const dataWithId = {
        ...paymentData,
        idReservation: reservationId,
      }
      return await addPaymentToReservation(dataWithId)
    }
  } catch (error) {
    console.error("❌ Error en addPaymentToReservationWithId:", error)
    throw error
  }
}


export const syncReservationStatus = async (reservationId) => {
  try {
    console.log("🔄 === SINCRONIZANDO ESTADO DE RESERVA ===")
    console.log("🆔 Reservation ID:", reservationId)

    if (!reservationId) {
      throw new Error("ID de reserva requerido para sincronización")
    }

    // Obtener todos los pagos de la reserva
    const payments = await getReservationPayments(reservationId)
    console.log("💰 Pagos de la reserva:", payments)

    if (!payments || payments.length === 0) {
      console.log("⚠️ No hay pagos para esta reserva, manteniendo estado actual")
      return null
    }

    // Determinar el nuevo estado de la reserva basado en las reglas de negocio
    let newReservationStatus = "Reservado" // Estado por defecto

    // Regla 1: Si hay algún pago anulado, la reserva se anula
    const hasAnulado = payments.some((p) => p.status === "Anulado")
    if (hasAnulado) {
      newReservationStatus = "Anulado"
      console.log("❌ Pago anulado encontrado, reserva será anulada")
    }
    // Regla 2: Si hay algún pago confirmado, la reserva se confirma
    else if (payments.some((p) => p.status === "Confirmado")) {
      newReservationStatus = "Confirmado"
      console.log("✅ Pago confirmado encontrado, reserva será confirmada")
    }
    // Regla 3: Si hay algún pago con comprobante (voucher), la reserva pasa a pendiente
    else if (payments.some((p) => p.voucher && p.status === "Pendiente")) {
      newReservationStatus = "Pendiente"
      console.log("📄 Comprobante encontrado, reserva será pendiente")
    }

    console.log("🎯 Nuevo estado calculado:", newReservationStatus)

    // Actualizar el estado de la reserva usando el servicio existente
    const { changeReservationStatus } = await import("./reservationsService")
    const updatedReservation = await changeReservationStatus(reservationId, newReservationStatus)

    console.log("✅ Estado de reserva actualizado exitosamente")
    return updatedReservation
  } catch (error) {
    console.error("❌ Error en syncReservationStatus:", error)
    throw error
  }
}

// ✅ FUNCIÓN PARA VERIFICAR PAGOS PENDIENTES DE MÁS DE 48 HORAS
export const checkExpiredPayments = async () => {
  try {
    console.log("⏰ === VERIFICANDO PAGOS EXPIRADOS ===")

    const response = await axios.post(`${API_URL_PAYMENTS}/check-expired`)

    console.log("✅ Verificación de pagos expirados completada:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al verificar pagos expirados:", error)
    throw error
  }
}
