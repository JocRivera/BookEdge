import axios from 'axios';

const API_URL_DASHBOARD = 'http://localhost:3000/dashboard';

export const getTopPlans = async () => {
    try {
        const response = await axios.get(`${API_URL_DASHBOARD}/topPlans`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw new Error('Error al obtener los datos del dashboard');
    }
}
