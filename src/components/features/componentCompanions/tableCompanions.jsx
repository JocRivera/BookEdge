import { useState } from 'react';
import PropTypes from 'prop-types';
import './componentCompanions.css';

const TableCompanions = ({ companions = [], onDeleteCompanion = null, compact = false, isReadOnly = false }) => {
  const [expanded, setExpanded] = useState(false);

  // Verificación segura de los acompañantes
  if (!companions || !Array.isArray(companions)) {
    return (
      <div className="no-companions">
        Datos de acompañantes no válidos
      </div>
    );
  }

  if (compact && companions.length > 0) {
    return (
      <div className="compact-companions">
        <button
          className="toggle-companions-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {companions.length} acompañante(s) {expanded ? '▲' : '▼'}
        </button>

        {expanded && (
          <div className="companions-popup">
            <table className="companions-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Edad</th>
                  {!isReadOnly && onDeleteCompanion && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {companions.map((companion) => (
                  <tr key={`companion-${companion?.id || companion?.documentNumber || Math.random()}`}>
                    <td>{companion?.name || 'N/A'}</td>
                    <td>{companion?.age || 'N/A'}</td>
                    {!isReadOnly && onDeleteCompanion && (
                      <td>
                        <button onClick={() => onDeleteCompanion(companion.id)}>
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="companions-table-wrapper">
      <table className="reservations-table">
        <thead className="reservations-table-header">
          <tr>
            <th>Nombre</th>
            <th>Fecha Nac.</th>
            <th>Edad</th>
            <th>Tipo Doc.</th>
            <th>N° Documento</th>
            <th>EPS</th>
            {!isReadOnly && onDeleteCompanion && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody className="reservations-table-body">
          {companions.length > 0 ? (
            companions.map((companion, index) => (
              <tr
                key={`companion-${companion?.id || companion?.documentNumber || Math.random()}`}
                className={
                  index % 2 === 0
                    ? "reservations-table-row-even"
                    : "reservations-table-row-odd"
                }
              >
                <td className="reservations-table-cell">{companion?.name || 'N/A'}</td>
                <td className="reservations-table-cell">{companion?.birthdate || 'N/A'}</td>
                <td className="reservations-table-cell">{companion?.age || 'N/A'}</td>
                <td className="reservations-table-cell">{companion?.documentType || 'N/A'}</td>
                <td className="reservations-table-cell">{companion?.documentNumber || 'N/A'}</td>
                <td className="reservations-table-cell">{companion?.eps || 'N/A'}</td>
                {!isReadOnly && onDeleteCompanion && (
                  <td className="reservations-table-cell">
                    <button
                      onClick={() => onDeleteCompanion(companion.id)}
                      className="delete-companion-btn"
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={!isReadOnly && onDeleteCompanion ? 7 : 6} className="no-results">
                No hay acompañantes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

TableCompanions.propTypes = {
  companions: PropTypes.arrayOf(
    PropTypes.shape({
      idCompanions: PropTypes.number,
      name: PropTypes.string,
      birthdate: PropTypes.string,
      age: PropTypes.number,
      documentType: PropTypes.string,
      documentNumber: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      eps: PropTypes.string
    })
  ),
  onDeleteCompanion: PropTypes.func,
  compact: PropTypes.bool,
  isReadOnly: PropTypes.bool
};

export default TableCompanions;