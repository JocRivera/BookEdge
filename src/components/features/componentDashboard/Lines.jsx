import React, { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { getLeastBusyMonths } from '../../../services/DashboardService.jsx';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const LinesChart = () => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalVisitors, setTotalVisitors] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getLeastBusyMonths();
                const data = response.data;

                const total = data.reduce((sum, item) => sum + item.visitorCount, 0);
                setTotalVisitors(total);

                const sortedData = data.sort((a, b) => a.monthNumber - b.monthNumber);

                const months = sortedData.map(item => item.month);
                const visitorCounts = sortedData.map(item => item.visitorCount);
                const maxCount = Math.max(...visitorCounts);
                const minCount = Math.min(...visitorCounts);

                const backgroundColors = visitorCounts.map(count => {
                    const intensity = (count - minCount) / (maxCount - minCount);
                    // Rojo suave para valores bajos, verde pastel para valores altos
                    const red = Math.round(255 - intensity * 85);    // De 255 a 170
                    const green = Math.round(180 + intensity * 55);  // De 180 a 235
                    const blue = Math.round(180 + intensity * 35);   // De 180 a 215
                    return `rgba(${red}, ${green}, ${blue}, 0.8)`;
                });

                const borderColors = visitorCounts.map(count => {
                    const intensity = (count - minCount) / (maxCount - minCount);
                    const red = Math.round(255 - intensity * 85);
                    const green = Math.round(180 + intensity * 55);
                    const blue = Math.round(180 + intensity * 35);
                    return `rgba(${red}, ${green}, ${blue}, 1)`;
                });


                setChartData({
                    labels: months,
                    datasets: [
                        {
                            label: 'Visitantes',
                            data: visitorCounts,
                            backgroundColor: backgroundColors,
                            borderColor: borderColors,
                            borderWidth: 2
                        }
                    ]
                });
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos de visitantes');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Meses Menos Concurridos - 2025',
                padding: {
                    top: 10,
                    bottom: 30,
                },
            },
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function (context) {
                        return `${context[0].label} 2025`;
                    },
                    label: function (context) {
                        const percentage = ((context.parsed.y / totalVisitors) * 100).toFixed(1);
                        return `${context.parsed.y} visitantes (${percentage}%)`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString();
                    }
                }
            }
        }
    };

    if (loading) {
        return <div>Cargando datos...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* <div>
                <h2>Análisis de Temporada Baja</h2>
                <div>
                    <p>Total de visitantes: {totalVisitors.toLocaleString()}</p>
                    <p>Meses analizados: {chartData?.labels.length || 0}</p>
                </div>
            </div> */}
            <div style={{ position: 'relative', height: '400px' }}>
                {chartData && <Bar data={chartData} options={options} />}
            </div>
        </div>
    );
};

export default LinesChart;