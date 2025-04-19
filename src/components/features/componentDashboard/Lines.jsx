import React from "react";
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const LinesChart = () => {
    const data = {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
        datasets: [
            {
                label: 'Ventas 2020 (M)',
                data: [3, 2, 2, 1, 5, 6, 7],
                fill: false,
                borderColor: 'rgba(54, 162, 235, 0.6)',
                tension: 0.1
            },
            {
                label: 'Ventas 2021 (M)',
                data: [1, 3, 2, 2, 6, 3, 4],
                fill: false,
                borderColor: 'rgba(255, 206, 86, 0.6)',
                tension: 0.1
            }
        ]
    };

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Ingresos mensuales',
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
    };

    return (
        <div className='lineChart'>
            <Line data={data} options={options} />
        </div>
    )
}

export default LinesChart;