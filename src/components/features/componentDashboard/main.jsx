"use client"

import React from 'react';
import BarsChart from './Bars.jsx';
import LinesChart from './Lines.jsx';
import DoughnutsChart from './Doughnut.jsx';

// Stats Card Component
const StatsCard = ({ title, value, change, isPositive }) => (
    <div className="bg-gray-900 rounded-lg shadow p-6 border border-gray-800">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-xl font-bold mt-2 text-white">{value}</p>
        <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} mt-1`}>
            {isPositive ? '↑' : '↓'} {change}
        </p>
    </div>
);

// Chart Container Component
const ChartContainer = ({ title, children, colSpan = 1, subtitle = null }) => (
    <div className={`${colSpan > 1 ? `lg:col-span-${colSpan}` : ''} `}>
        <div className="">
            {children}
        </div>
    </div>
);

export default function DashboardManagement() {
    // Stats data
    const statsData = [
        { title: "Total Revenue", value: "$24,345", change: "12% from last month", isPositive: true },
        { title: "New Users", value: "2,345", change: "8% from last month", isPositive: true },
        { title: "Active Sessions", value: "1,432", change: "3% from last month", isPositive: false },
        { title: "Conversion Rate", value: "3.2%", change: "1.2% from last month", isPositive: true }
    ];

    return (
        <div className="gap-4 mb-6"> {/* Este div padre principal */}

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Usamos mb-6 para separar de los charts de abajo */}
                {statsData.map((stat, index) => (
                    <StatsCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        change={stat.change}
                        isPositive={stat.isPositive}
                    />
                ))}
            </div>

            {/* Contenedor principal para los charts, ahora con un margin-bottom para separarse de lo de abajo si hubiera */}
            <div className="flex flex-col gap-4 mb-6"> {/* Usamos flex-col y gap-4 para apilar las secciones de charts */}

                {/* Primera fila de charts: BarsChart y DoughnutsChart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> {/* Este grid para la fila superior */}
                    {/* BarsChart ocupa 2 de 3 columnas */}
                    <div className='lg:col-span-2 border-1 border-gray-800 bg-gray-900 rounded-lg shadow p-4'>
                        <BarsChart />
                    </div>
                    {/* DoughnutsChart ocupa 1 de 3 columnas */}
                    <div className="border-1 border-gray-800 bg-gray-900 rounded-lg shadow p-4">
                        <DoughnutsChart />
                    </div>
                </div>

                {/* Segunda "fila" de charts: LinesChart ocupa todo el ancho */}
                {/* Aquí LinesChart está en su propio div, que por defecto ocupa el 100% del ancho del padre (flex-col) */}
                <div className="border-1 border-gray-800 bg-gray-900 rounded-lg shadow p-4">
                    <LinesChart />
                </div>

            </div>

            {/* Cualquier otro contenido iría aquí, separado por el mb-6 del contenedor de charts */}

        </div>
    );
}