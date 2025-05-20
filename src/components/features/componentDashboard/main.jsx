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
        <div className="gap-4 mb-6"> 
            <div className="title-container">
                <h2 className="table-title">Gestión de Dashboard</h2>
            </div>
            <div className="flex flex-col gap-4 mb-6"> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> 
                    <div className='lg:col-span-2 border-1 border-gray-800 bg-gray-900 rounded-lg shadow p-4'>
                        <BarsChart />
                    </div>
                    <div className="border-1 border-gray-800 bg-gray-900 rounded-lg shadow p-4">
                        <DoughnutsChart />
                    </div>
                </div>
                <div className="border-1 border-gray-800 bg-gray-900 rounded-lg shadow p-4">
                    <LinesChart />
                </div>
            </div>
        </div>
    );
}