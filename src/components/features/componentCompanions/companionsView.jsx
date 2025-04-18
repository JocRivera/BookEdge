import { useState, useEffect } from 'react';
import { getAllCompanions, deleteCompanion } from '../../../services/companionsService';
import './componentCompanions.css';

const CompanionsView = () => {
    // Inicializa los estados con valores por defecto adecuados
    const [companions, setCompanions] = useState([]);
    const [filteredCompanions, setFilteredCompanions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const companionsPerPage = 10;

    useEffect(() => {
        const fetchCompanions = async () => {
          try {
            setLoading(true);
            const data = await getAllCompanions();
            // Asegúrate de que siempre sea un array, incluso si la API retorna null
            setCompanions(Array.isArray(data) ? data : []);
            setFilteredCompanions(Array.isArray(data) ? data : []);
          } catch (err) {
            setError(err.message);
            setCompanions([]);
            setFilteredCompanions([]);
          } finally {
            setLoading(false);
          }
        };
    
        fetchCompanions();
      }, []);
      useEffect(() => {
        // Filtra solo si companions es un array
        if (Array.isArray(companions)) {
          const results = companions.filter(companion =>
            (companion.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            companion.documentNumber?.includes(searchTerm) ||
            companion.reservationId?.toString().includes(searchTerm))
          );
          setFilteredCompanions(results);
          setCurrentPage(1);
        }
      }, [searchTerm, companions]);
    
      // Paginación - asegúrate de que filteredCompanions sea un array
      const indexOfLastCompanion = currentPage * companionsPerPage;
      const indexOfFirstCompanion = indexOfLastCompanion - companionsPerPage;
      const currentCompanions = Array.isArray(filteredCompanions) 
        ? filteredCompanions.slice(indexOfFirstCompanion, indexOfLastCompanion)
        : [];
      const totalPages = Math.ceil((filteredCompanions?.length || 0) / companionsPerPage);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este acompañante?')) {
            try {
                await deleteCompanion(id);
                setCompanions(prev => prev.filter(c => c.idCompanions !== id));
            } catch (err) {
                alert('Error al eliminar: ' + err.message);
            }
        }
    };

    if (loading) return <div className="loading">Cargando acompañantes...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="companions-view-container">
            <div className="companions-header">
                <h2>Acompañantes</h2>
                <div className="companions-controls">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o reserva..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    <div className="total-count">
                        Total: {filteredCompanions.length} acompañantes
                    </div>
                </div>
            </div>

            <div className="companions-table-container">
                <table className="companions-table">
                    <thead>
                        <tr>
                            <th>Reserva ID</th>
                            <th>Nombre</th>
                            <th>Documento</th>
                            <th>Edad</th>
                            <th>EPS</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCompanions.length > 0 ? (
                            currentCompanions.map(companion => (
                                <tr key={companion.idCompanions}>
                                    <td>{companion.reservationId}</td>
                                    <td>{companion.name}</td>
                                    <td>{companion.documentType} {companion.documentNumber}</td>
                                    <td>{companion.age}</td>
                                    <td>{companion.eps}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(companion.idCompanions)}
                                            className="delete-companion-btn"
                                            title="Eliminar acompañante"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-results">
                                    {searchTerm ? 'No se encontraron resultados' : 'No hay acompañantes registrados'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &laquo; Anterior
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={currentPage === i + 1 ? 'active' : ''}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente &raquo;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanionsView;