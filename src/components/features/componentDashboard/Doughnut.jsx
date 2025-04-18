import React from "react";
import Chart from 'chart.js/auto';
import { Doughnut } from 'react-chartjs-2';

const DoughnutsChart = () => {
    return (
        <div className='doughnutChart'>
            <Doughnut
                data={{
                    labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domindo'],
                    datasets: [
                        {
                            label: 'Ventas',
                            data: [3, 2, 2, 1, 5, 6, 7],
                            backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 69, 12, 0.6)'],
                            borderColor: 'rgba(54, 162, 235, 1)',
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
                            text: 'Reservas del día',
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

export default DoughnutsChart;