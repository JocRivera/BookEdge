import React from 'react';
import BarsChart from './Bars.jsx';
import LinesChart from './Lines.jsx';
import DoughnutsChart from './Doughnut.jsx';

const DashboardManagement = () => {
    return (
        <div>
            <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
            <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2'>
                    <LinesChart />
                </div>
                <div className='col-span-2'>
                    <DoughnutsChart />
                </div>
                <div className='col-span-2'>
                    <BarsChart />
                </div>
            </div>
        </div>
    );
}

export default DashboardManagement;