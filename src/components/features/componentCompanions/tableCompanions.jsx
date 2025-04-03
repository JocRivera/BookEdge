import React from 'react';
import PropTypes from 'prop-types';
import './componentCompanions.css';

const TableCompanions = ({ companions = [], clients = [], onDeleteCompanion }) => {
  const [selectedCompanion, setSelectedCompanion] = React.useState(null);

  const findClientForCompanion = (companionId) => {
    return clients.find(client => 
      client.companions?.some(comp => comp.documentNumber === companionId)
    );
  };

  // Verificación adicional para seguridad
  if (!Array.isArray(companions)) {
    console.error('companions no es un array:', companions);
    return <div className="error-message">No hay datos de acompañantes disponibles</div>;
  }

  return (
    <div className="companions-table-container">
      <h2>Acompañantes Registrados</h2>
      
      {companions.length === 0 ? (
        <p className="no-companions-message">No hay acompañantes registrados</p>
      ) : (
        <table className="companions-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Edad</th>
              <th>Tipo Documento</th>
              <th>Número Documento</th>
              <th>EPS</th>
              <th>Cliente Principal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companions.map((companion, index) => {
              const client = findClientForCompanion(companion.documentNumber);
              return (
                <tr key={`companion-row-${index}`}>
                  <td>{companion.name || '-'}</td>
                  <td>{companion.age || '-'}</td>
                  <td>{companion.documentType || '-'}</td>
                  <td>{companion.documentNumber || '-'}</td>
                  <td>{companion.eps || '-'}</td>
                  <td>{client ? client.name : 'No asignado'}</td>
                  <td>
                    <button 
                      className="view-detail-btn"
                      onClick={() => setSelectedCompanion(companion)}
                    >
                      Ver detalle
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => onDeleteCompanion(companion.documentNumber)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Modal de detalle */}
      {selectedCompanion && (
        <div className="companion-detail-modal">
          {/* ... (mantén tu modal existente) */}
        </div>
      )}
    </div>
  );
};

TableCompanions.propTypes = {
  companions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      birthDate: PropTypes.string,
      age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      documentType: PropTypes.string,
      documentNumber: PropTypes.string,
      eps: PropTypes.string
    })
  ),
  clients: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      companions: PropTypes.array
    })
  ),
  onDeleteCompanion: PropTypes.func.isRequired
};


export default TableCompanions;