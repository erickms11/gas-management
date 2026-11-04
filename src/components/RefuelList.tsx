import React, { useState } from 'react';
import { Fuel, Calendar, MapPin, Gauge, Filter, ExternalLink } from 'lucide-react';
import { Refueling } from '../types/fuel';
import { formatDisplayDate, getDateTimestamp } from '../utils/calculations';

interface RefuelListProps {
  refuelings: Refueling[];
  onDelete?: (id: string) => void;
  onEdit: (item: Refueling) => void;
}

export const RefuelList: React.FC<RefuelListProps> = ({ refuelings, onEdit }) => {
  const [filterFuel, setFilterFuel] = useState<string>('todos');

  const filtered = filterFuel === 'todos'
    ? refuelings
    : refuelings.filter((r) => r.fuelType === filterFuel);

  // Exibir do mais recente para o mais antigo sem desvio de fuso horário
  const sorted = [...filtered].sort((a, b) => getDateTimestamp(b.date) - getDateTimestamp(a.date));

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
          <div
            key={item.id}
            className="refuel-item clickable-card"
            onClick={() => onEdit(item)}
            title="Toque para editar ou excluir este abastecimento"
          >
            <div className="refuel-main">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span className={`badge ${getBadgeStyle(item.fuelType)}`} style={{ flexShrink: 0 }}>
                  {item.fuelType}
                </span>
                <span className="refuel-date" style={{ whiteSpace: 'nowrap' }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {formatDisplayDate(item.date)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, marginTop: '4px' }}>
                <div
                  className="refuel-station"
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    flex: 1,
                  }}
                  title={item.gasStation || 'Posto não informado'}
                >
                  {item.gasStation || 'Posto não informado'}
                </div>

                {item.location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${item.location.latitude},${item.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      color: 'var(--primary)',
                      background: 'rgba(59, 130, 246, 0.12)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                    title={item.location.address || `Lat: ${item.location.latitude}, Lng: ${item.location.longitude}`}
                  >
                    <MapPin size={11} color="var(--primary)" />
                    <span>{item.location.address ? item.location.address.split(',')[0] : 'Mapa'}</span>
                    <ExternalLink size={9} />
                  </a>
                )}
              </div>

              <div
                className="refuel-details"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                  marginTop: '2px',
                }}
              >
                {item.liters.toFixed(2)} L × R$ {item.pricePerLiter.toFixed(2)} • {item.odometer.toLocaleString('pt-BR')} Km
              </div>

              {item.kmDriven ? (
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-dim)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                  }}
                >
                  ⚡ Rodou {item.kmDriven.toLocaleString('pt-BR')} Km neste tanque
                </div>
              ) : null}
            </div>

            <div className="refuel-cost" style={{ flexShrink: 0, textAlign: 'right', minWidth: '95px' }}>
              <div className="refuel-price-total" style={{ whiteSpace: 'nowrap' }}>
                R$ {item.totalCost.toFixed(2)}
              </div>

              {item.consumptionKmL ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    borderRadius: '8px',
                    padding: '2px 7px',
                    marginTop: '4px',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.isFullTank ? 'Consumo médio calculado com tanque cheio' : 'Consumo médio do trecho'}
                >
                  <Gauge size={12} color="var(--accent-green)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-green)', whiteSpace: 'nowrap' }}>
                    {item.consumptionKmL.toFixed(2)} Km/L
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>
                  1º abastecimento
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

