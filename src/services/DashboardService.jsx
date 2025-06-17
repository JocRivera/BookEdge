import api from "./api";

export const getTopPlans = async () => {
    try {
        const response = await api.get("/dashboard/topPlans");
        return response.data.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw new Error('Error al obtener los datos del dashboard');
    }
}

export const getDailyReservations = async () => {
    try {
        const response = await api.get("/dashboard/dailyReservations");
        return response.data;
    } catch (error) {
        console.error('Error fetching daily reservations:', error);
        throw new Error('Error al obtener las reservas diarias');
    }
}

export const getLeastBusyMonths = async () => {
    try {
        const response = await api.get("/dashboard/leastBusyMonths");
        return response.data;
    } catch (error) {
        console.error('Error fetching least busy months:', error);
        throw new Error('Error al obtener los meses menos concurridos');
    }
}