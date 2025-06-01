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
    const generateColors = (count) => {
        const baseColors = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
            'rgba(99, 255, 132, 0.6)',
        ];

        const borderColors = baseColors.map(c => c.replace('0.6', '1'));

        return {
            backgroundColor: Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]),
            borderColor: Array.from({ length: count }, (_, i) => borderColors[i % borderColors.length])
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const plans = await getTopPlans();

                const labels = plans.map(p => p.name);
                const data = plans.map(p => p.clientCount);
                const colors = generateColors(plans.length);

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: 'Reservas por plan',
                            data,
                            backgroundColor: colors.backgroundColor,
                            borderColor: colors.borderColor,
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
                        legend: {
                            display: false, // Oculta la leyenda
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
