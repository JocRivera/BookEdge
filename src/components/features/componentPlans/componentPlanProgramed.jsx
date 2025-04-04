import React, { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import './PlanProgramed.css';

const PlanProgramed = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month');
    const [isAnimating, setIsAnimating] = useState(false);

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (now.getDate() !== selectedDate.getDate() ||
                now.getMonth() !== selectedDate.getMonth() ||
                now.getFullYear() !== selectedDate.getFullYear()) {
                setSelectedDate(now);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [selectedDate]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const navigate = (direction) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(currentDate.getMonth() + direction);
        } else {
            newDate.setFullYear(currentDate.getFullYear() + direction);
        }
        setCurrentDate(newDate);
    };

    const selectMonth = (monthIndex) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(monthIndex);
        setCurrentDate(newDate);
        setViewMode('month');
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
        setViewMode('month');
    };

    const selectDate = (day) => {
        const newDate = new Date(currentDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
    };

    const toggleViewMode = () => {
        setViewMode(viewMode === 'month' ? 'year' : 'month');
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const today = new Date();
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

            days.push(
                <div
                    key={`day-${day}`}
                    className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectDate(day)}
                >
                    <div className="day-number">{day}</div>
                    <div className="day-content">
                        {/* Eventos o contenido adicional iría aquí */}
                    </div>
                </div>
            );
        }

        return (
            <div className={`calendar-grid ${isAnimating ? 'fade' : ''}`}>
                {dayNames.map(day => (
                    <div key={day} className="calendar-header-cell">
                        {day}
                    </div>
                ))}
                {days}
            </div>
        );
    };

    const renderYearView = () => {
        return (
            <div className={`year-grid ${isAnimating ? 'fade' : ''}`}>
                {monthNames.map((month, index) => {
                    const isCurrentMonth = index === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                    return (
                        <div
                            key={month}
                            onClick={() => selectMonth(index)}
                            className={`month-cell ${isCurrentMonth ? 'current-month' : ''}`}
                        >
                            {month}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="programed-container">
            <div className="programed-header">
                <h2 className="programed-title">Programación de Planes</h2>
                <button
                    className="add-schedule-btn"
                    onClick={() => {
                        // Lógica para abrir modal de agregar programación
                        console.log("Agregar nueva programación");
                    }}
                >
                    <FiPlus />
                    Agregar Programación
                </button>
            </div>

            <div className="calendar-container">
                <div className="calendar-header">
                    <button
                        className="nav-button"
                        onClick={viewMode === 'month' ? () => navigateMonth(-1) : () => navigateYear(-1)}
                    >
                        <span className="arrow-icon">←</span>
                    </button>

                    <div
                        className="current-period"
                        onClick={toggleViewMode}
                    >
                        {viewMode === 'month'
                            ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                            : currentDate.getFullYear()}
                    </div>

                    <button
                        className="nav-button"
                        onClick={viewMode === 'month' ? () => navigateMonth(1) : () => navigateYear(1)}
                    >
                        <span className="arrow-icon">→</span>
                    </button>
                </div>

                <div className="calendar-body">
                    {viewMode === 'month' ? renderMonthView() : renderYearView()}
                </div>

                <div className="calendar-footer">
                    <button
                        className="today-button"
                        onClick={goToToday}
                    >
                        Hoy
                    </button>

                    <div className="view-toggles">
                        <button
                            className={`view-toggle ${viewMode === 'month' ? 'active' : ''}`}
                            onClick={() => setViewMode('month')}
                        >
                            Mes
                        </button>
                        <button
                            className={`view-toggle ${viewMode === 'year' ? 'active' : ''}`}
                            onClick={() => setViewMode('year')}
                        >
                            Año
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanProgramed;