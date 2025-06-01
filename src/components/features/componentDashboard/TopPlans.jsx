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
import { getTopPlans } from '../../../services/DashboardService.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopPlans = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const plans = await getTopPlans();

                const labels = plans.map(p => p.name);
                const data = plans.map(p => p.clientCount);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Reservas por plan',
                            data,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }
                    ]
                });
            } catch (error) {
                console.error("Error al cargar los datos del gráfico", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="barChart" style={{ height: "400px" }}>
            <Bar
                data={chartData}
                options={{
                    plugins: {
                        title: {
                            display: true,
                            text: 'Top 5 planes más reservados',
                            padding: {
                                top: 10,
                                bottom: 30,
                            },
                        },
                    },
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }}
            />
        </div>
    );
};

export default TopPlans;
