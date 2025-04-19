import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);
const BarsChart = () => {
    return (
        <div className='barChart'>
            <Bar
                data={{

                    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
                    datasets: [
                        {
                            label: 'Ventas Romantico',
                            data: [3, 2, 2, 1, 5, 6, 7],
                            backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: 'Ventas Día de sol',
                            data: [1, 3, 2, 2, 6, 3, 4],
                            backgroundColor: 'rgba(255, 206, 86, 0.6)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 1
                        }
                    ]
                }}
                height={400}
                width={600}
                options={{
                    plugins: {
                        title: {
                            display: true,
                            text: 'Planes más vendidos',
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
    )
}

export default BarsChart;