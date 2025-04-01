import React from 'react';
import './componentCompanions.css';

const CompanionsForm = ({
    companionsData = [],
    onCompanionDataChange
}) => {
    const calculateAge = (birthDate) => {
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        return age;
    };

    return (

        <div className="companion-forms-container">
            {companionsData.map((companion, index) => (
                <div key={index} className="companion-form">
                    <h4>Acompañante {index + 1}</h4>

                    <div className="companion-fields-grid">
                        {/* Nombre */}
                        <div className="form-group">
                            <label>Nombre completo</label>
                            <input
                                type="text"
                                name="name"
                                value={companion.name}
                                onChange={(e) => onCompanionDataChange(index, e)}
                                required
                            />
                        </div>

                        {/* Fecha de nacimiento */}
                        <div className="form-group">
                            <label>Fecha de nacimiento</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={companion.birthDate}
                                onChange={(e) => {
                                    onCompanionDataChange(index, e);
                                    const age = calculateAge(e.target.value);
                                    onCompanionDataChange(index, {
                                        target: {
                                            name: "age",
                                            value: age
                                        }
                                    });
                                }}
                                required
                            />
                        </div>

                        {/* Edad */}
                        <div className="form-group">
                            <label>Edad</label>
                            <input
                                type="number"
                                name="age"
                                value={companion.age || ''}
                                readOnly
                            />
                        </div>

                        {/* Tipo de documento */}
                        <div className="form-group">
                            <label>Tipo de documento</label>
                            <select
                                name="documentType"
                                value={companion.documentType}
                                onChange={(e) => onCompanionDataChange(index, e)}
                                required
                            >
                                <option value="">Seleccione...</option>
                                <option value="Tarjeta de identidad">Tarjeta de identidad</option>
                                <option value="Cédula de ciudadanía">Cédula de ciudadanía</option>
                                <option value="Pasaporte">Pasaporte</option>
                                <option value="Cédula de extranjería">Cédula de extranjería</option>
                            </select>
                        </div>

                        {/* Número de documento */}
                        <div className="form-group">
                            <label>Número de documento</label>
                            <input
                                type="text"
                                name="documentNumber"
                                value={companion.documentNumber}
                                onChange={(e) => onCompanionDataChange(index, e)}
                                required
                            />
                        </div>

                        {/* EPS */}
                        <div className="form-group">
                            <label>EPS</label>
                            <input
                                type="text"
                                name="eps"
                                value={companion.eps}
                                onChange={(e) => onCompanionDataChange(index, e)}
                                required
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CompanionsForm;