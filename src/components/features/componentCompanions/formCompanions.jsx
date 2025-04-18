import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './componentCompanions.css';

function CompanionsForm({ onSaveCompanion = [] }) {
  const [currentCompanion, setCurrentCompanion] = useState({
    name: '',
    birthdate: '',
    age: '',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '',
    eps: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentCompanion.birthdate) {
      const birthdate = new Date(currentCompanion.birthdate);
      const ageDiff = Date.now() - birthdate.getTime();
      const ageDate = new Date(ageDiff);
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

      setCurrentCompanion(prev => ({
        ...prev,
        age: calculatedAge.toString()
      }));
    }
  }, [currentCompanion.birthdate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCompanion(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentCompanion.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!currentCompanion.birthdate) {
      newErrors.birthdate = 'La fecha de nacimiento es obligatoria';
    }

    if (!currentCompanion.documentType) {
      newErrors.documentType = 'El tipo de documento es obligatorio';
    }

    if (!currentCompanion.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es obligatorio';
    }

    if (!currentCompanion.eps.trim()) {
      newErrors.eps = 'La EPS es obligatoria';
    }

    return newErrors;
  };

  // Asegurar que el objeto companion tenga la estructura correcta
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const companionToAdd = {
      name: currentCompanion.name.trim(),
      birthdate: currentCompanion.birthdate,
      age: Number(currentCompanion.age),
      documentType: currentCompanion.documentType,
      documentNumber: currentCompanion.documentNumber.trim(),
      eps: currentCompanion.eps.trim(),
    };

    if (typeof onSaveCompanion === 'function') {
      // Ahora solo agregamos a la lista, no guardamos directamente
      onSaveCompanion(companionToAdd);
    }

    // Resetear formulario
    setCurrentCompanion({
      name: '',
      birthdate: '',
      age: '',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '',
      eps: ''
    });


  setErrors({});
};
  return (
    <div className="companion-form">
      <h3>Registrar Acompañante</h3>
      <div>
        <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
          <label htmlFor="name">Nombre completo:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={currentCompanion.name}
            onChange={handleInputChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <span className="error-message" id="name-error">{errors.name}</span>}
        </div>

        <div className={`form-group ${errors.birthdate ? 'has-error' : ''}`}>
          <label htmlFor="birthdate">Fecha de nacimiento:</label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={currentCompanion.birthdate}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.birthdate}
            aria-describedby={errors.birthdate ? "birthdate-error" : undefined}
          />
          {errors.birthdate && <span className="error-message" id="birthdate-error">{errors.birthdate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Edad:</label>
          <input
            type="text"
            id="age"
            name="age"
            value={currentCompanion.age}
            readOnly
          />
        </div>

        <div className={`form-group ${errors.documentType ? 'has-error' : ''}`}>
          <label htmlFor="documentType">Tipo de documento:</label>
          <select
            id="documentType"
            name="documentType"
            value={currentCompanion.documentType}
            onChange={handleInputChange}
            aria-invalid={!!errors.documentType}
            aria-describedby={errors.documentType ? "documentType-error" : undefined}
          >
            <option value="Cédula de ciudadanía">Cédula de Ciudadanía</option>
            <option value="Tarjeta de identidad">Tarjeta de Identidad</option>
            <option value="Cédula de extranjería">Cédula de Extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          {errors.documentType && <span className="error-message" id="documentType-error">{errors.documentType}</span>}
        </div>

        <div className={`form-group ${errors.documentNumber ? 'has-error' : ''}`}>
          <label htmlFor="documentNumber">Número de documento:</label>
          <input
            type="text"
            id="documentNumber"
            name="documentNumber"
            value={currentCompanion.documentNumber}
            onChange={handleInputChange}
            aria-invalid={!!errors.documentNumber}
            aria-describedby={errors.documentNumber ? "documentNumber-error" : undefined}
          />
          {errors.documentNumber && <span className="error-message" id="documentNumber-error">{errors.documentNumber}</span>}
        </div>

        <div className={`form-group ${errors.eps ? 'has-error' : ''}`}>
          <label htmlFor="eps">EPS:</label>
          <input
            type="text"
            id="eps"
            name="eps"
            value={currentCompanion.eps}
            onChange={handleInputChange}
            aria-invalid={!!errors.eps}
            aria-describedby={errors.eps ? "eps-error" : undefined}
          />
          {errors.eps && <span className="error-message" id="eps-error">{errors.eps}</span>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
          >
            Guardar Acompañante
          </button>
        </div>
      </div>
    </div>
  );
}

CompanionsForm.propTypes = {
  onSaveCompanion: PropTypes.func.isRequired,
  currentCompanions: PropTypes.array
};

export default CompanionsForm;