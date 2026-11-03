import React, { useState } from 'react';
import { Fuel, Calendar, MapPin, Trash2, Gauge, Filter, ExternalLink, Pencil } from 'lucide-react';
import { Refueling } from '../types/fuel';

interface RefuelListProps {
  refuelings: Refueling[];
  onDelete: (id: string) => void;
  onEdit: (item: Refueling) => void;
}

export const RefuelList: React.FC<RefuelListProps> = ({ refuelings, onDelete, onEdit }) => {
  const [filterFuel, setFilterFuel] = useState<string>('todos');

  const filtered = filterFuel === 'todos'
    ? refuelings
    : refuelings.filter((r) => r.fuelType === filterFuel);

  // Exibir do mais recente para o mais antigo
  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getBadgeStyle = (type: string) => {
    if (type.includes('Etanol')) return 'badge-etanol';
    if (type.includes('Diesel')) return 'badge-diesel';
    return 'badge-gasolina';
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Histórico de Abastecimentos</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ padding: '4px 8px', fontSize: '0.78rem', width: 'auto' }}
            value={filterFuel}
            onChange={(e) => setFilterFuel(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="Gasolina Comum">Gasolina Comum</option>
            <option value="Gasolina Aditivada">Gasolina Aditivada</option>
            <option value="Etanol">Etanol</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <Fuel size={36} color="var(--text-dim)" style={{ marginBottom: '10px' }} />
          <p style={{ fontWeight: 600 }}>Nenhum abastecimento registrado.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Clique no botão "+" para cadastrar o primeiro.</p>
        </div>
      ) : (
        sorted.map((item) => (
          <div key={item.id} className="refuel-item">
            <div className="refuel-main">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${getBadgeStyle(item.fuelType)}`}>
                  {item.fuelType}
                </span>
                <span className="refuel-date">
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                <div className="refuel-station">
                  {item.gasStation || 'Posto não informado'}
                </div>

                {item.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${item.location.latitude},${item.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.73rem',
                      color: 'var(--primary)',
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    title={item.location.address || `Lat: ${item.location.latitude}, Lng: ${item.location.longitude}`}
                  >
                    <MapPin size={12} color="var(--primary)" />
                    <span>{item.location.address ? item.location.address.split(',')[0] : 'Ver no Mapa'}</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="refuel-details">
                {item.liters.toFixed(2)} L × R$ {item.pricePerLiter.toFixed(2)} | Odômetro: {item.odometer.toLocaleString('pt-BR')} Km
              </div>

              {item.kmDriven && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  ⚡ +{item.kmDriven} Km rodados desde o último abastecimento
                </div>
              )}
            </div>

            <div className="refuel-cost">
              <div className="refuel-price-total">
                R$ {item.totalCost.toFixed(2)}
              </div>

              {item.consumptionKmL ? (
                <div className="refuel-kml">
                  <Gauge size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  {item.consumptionKmL.toFixed(2)} Km/L
                  {!item.isFullTank && (
                    <span style={{ fontSize: '0.68rem', opacity: 0.8, marginLeft: '3px', fontWeight: 500 }}>(parcial)</span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>1º Registro (base)</div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => onEdit(item)}
                  style={{
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Editar abastecimento"
                >
                  <Pencil size={12} />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

