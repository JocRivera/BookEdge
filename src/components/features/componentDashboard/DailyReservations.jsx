import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { getDailyReservations } from '../../../services/DashboardService.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyReservations = () => {
    const [reservationData, setReservationData] = useState({
        date: '',
        count: 0,
        message: ''
    });
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getDailyReservations();
                const { message, date, count } = response;
                console.log("Datos de reservas diarias:", response);
                setReservationData({
                    date,
                    count,
                    message
                });

                // Como solo tenemos un valor, creamos una gráfica simple
                setChartData({
                    labels: ['Hoy'],
                    datasets: [{
                        label: 'Reservas del día',
                        data: [count],
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                });
            } catch (error) {
                console.error("Error al cargar los datos de reservas diarias", error);
            }
        };

        fetchData();
    }, []);

    // Función para formatear fecha en español
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    return (
        <div >
            <div className="barChart" style={{ height: "400px" }}>
                <Bar
                    data={chartData}
                    options={{
                        plugins: {
                            title: {
                                display: true,
                                text: 'Reservas del día',
                                padding: {
                                    top: 10,
                                    bottom: 30,
                                },
                            },
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    title: (context) => `Fecha: ${formatDate(reservationData.date)}`,
                                    label: (context) => `Total de reservas: ${context.raw}`,
                                }
                            }
                        },
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: '' },
                                ticks: { precision: 0 },
                                suggestedMax: Math.max(5, reservationData.count + 2) // Para escalar mejor el gráfico
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default DailyReservations;