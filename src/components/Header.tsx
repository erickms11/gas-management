import React from 'react';
import { Fuel, Plus, FileJson } from 'lucide-react';
import { Vehicle } from '../types/fuel';

interface HeaderProps {
  vehicles: Vehicle[];
  activeVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenAddModal,
  onOpenExportModal,
}) => {
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <Fuel size={22} color="#ffffff" />
        </div>
        <div>
          <h1 className="brand-title">GasControl</h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Gestão Veicular'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select
          className="vehicle-selector"
          value={activeVehicleId}
          onChange={(e) => onSelectVehicle(e.target.value)}
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              🚘 {v.name}
            </option>
          ))}
        </select>

        <button
          onClick={onOpenExportModal}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer',
          }}
          title="Exportar Dados (JSON)"
        >
          <FileJson size={18} />
        </button>

        <button
          onClick={onOpenAddModal}
          style={{
            background: 'var(--primary-gradient)',
            border: 'none',
            borderRadius: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
          }}
          title="Novo Abastecimento"
        >
          <Plus size={20} />
        </button>
      </div>
    </header>
  );
};
