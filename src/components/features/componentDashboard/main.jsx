"use client"

import React from 'react';
import BarsChart from './TopPlans.jsx';
import LinesChart from './Lines.jsx';
import DoughnutsChart from './DailyReservations.jsx';

// Stats Card Component
const StatsCard = ({ title, value, change, isPositive }) => (
    <div className="bg-gray-100 rounded-lg shadow-2xl p-6 shadow-indigo-300 hover:shadow-lg transition-shadow duration-300 ">
        <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-900 ">{title}</h3>
            <p className="text-xl font-bold mt-2 text-gray-600">{value}</p>
            <p className={`text-xs ${isPositive ? 'text-green-700' : 'text-rose-500'} mt-1`}>
                {isPositive ? '↑' : '↓'} {change}
            </p>
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
                    <div className='lg:col-span-2 bg-gray-100  shadow-indigo-300 rounded-lg p-4 shadow-2xl  hover:shadow-lg transition-shadow duration-300'>
                        <BarsChart />
                    </div>
                    <div className=" bg-gray-100 rounded-lg p-4  shadow-indigo-300 shadow-2xl  hover:shadow-lg transition-shadow duration-300 ">
                        <DoughnutsChart />
                    </div>
                </div>
                <div className=" bg-gray-100 rounded-lg shadow-2xl p-4  shadow-indigo-300  hover:shadow-lg transition-shadow duration-300 ">
                    <LinesChart />
                </div>
            </div>
        </div>
    );
}