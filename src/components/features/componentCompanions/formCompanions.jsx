import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import './componentCompanions.css';

const CompanionsForm = React.memo(({
  companionsData = [],
  onCompanionDataChange,
  onSaveCompanion,
  onDeleteCompanion
}) => {
  const calculateAge = useCallback((birthDate) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    return age;
  }, []);

  const handleBirthDateChange = useCallback((index, e) => {
    onCompanionDataChange(index, e);
    const age = calculateAge(e.target.value);
    
    onCompanionDataChange(index, {
      target: {
        name: 'age',
        value: age
      }
    });
  }, [onCompanionDataChange, calculateAge]);

  return (
    <div className="companion-forms-container">
      {companionsData.map((companion, index) => (
        <div key={`companion-${index}`} className="companion-form">
          <div className="companion-header">
            <h4>Acompañante {index + 1}</h4>
            
            <div className="companion-actions">
              <button
                type="button"
                className="save-companion-btn"
                onClick={() => onSaveCompanion(index)}
                aria-label="Guardar acompañante"
              >
                Guardar
              </button>
              
              <button
                type="button"
                className="delete-companion-btn"
                onClick={() => onDeleteCompanion(index)}
                aria-label="Eliminar acompañante"
              >
                Eliminar
              </button>
            </div>
          </div>

          <div className="companion-fields-grid">
            {/* Grupo Nombre */}
            <div className="form-group">
              <label htmlFor={`name-${index}`}>Nombre completo</label>
              <input
                id={`name-${index}`}
                type="text"
                name="name"
                value={companion.name || ''}
                onChange={(e) => onCompanionDataChange(index, e)}
                required
              />
            </div>

            {/* Grupo Fecha Nacimiento */}
            <div className="form-group">
              <label htmlFor={`birthDate-${index}`}>Fecha de nacimiento</label>
              <input
                id={`birthDate-${index}`}
                type="date"
                name="birthDate"
                value={companion.birthDate || ''}
                onChange={(e) => handleBirthDateChange(index, e)}
                required
              />
            </div>

            {/* Grupo Edad */}
            <div className="form-group">
              <label htmlFor={`age-${index}`}>Edad</label>
              <input
                id={`age-${index}`}
                type="number"
                name="age"
                value={companion.age || ''}
                readOnly
              />
            </div>

            {/* Grupo Tipo Documento */}
            <div className="form-group">
              <label htmlFor={`documentType-${index}`}>Tipo de documento</label>
              <select
                id={`documentType-${index}`}
                name="documentType"
                value={companion.documentType || ''}
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

            {/* Grupo Número Documento */}
            <div className="form-group">
              <label htmlFor={`documentNumber-${index}`}>Número de documento</label>
              <input
                id={`documentNumber-${index}`}
                type="text"
                name="documentNumber"
                value={companion.documentNumber || ''}
                onChange={(e) => onCompanionDataChange(index, e)}
                required
              />
            </div>

            {/* Grupo EPS */}
            <div className="form-group">
              <label htmlFor={`eps-${index}`}>EPS</label>
              <input
                id={`eps-${index}`}
                type="text"
                name="eps"
                value={companion.eps || ''}
                onChange={(e) => onCompanionDataChange(index, e)}
                required
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

CompanionsForm.displayName = 'CompanionsForm';

CompanionsForm.propTypes = {
  companionsData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      birthDate: PropTypes.string,
      age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      documentType: PropTypes.string,
      documentNumber: PropTypes.string,
      eps: PropTypes.string
    })
  ),
  onCompanionDataChange: PropTypes.func.isRequired,
  onSaveCompanion: PropTypes.func.isRequired,
  onDeleteCompanion: PropTypes.func.isRequired
};

export default CompanionsForm;