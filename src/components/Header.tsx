import React from 'react';
import { Fuel, Plus, FileJson, Settings, Edit2, CarPlus } from 'lucide-react';
import { Vehicle } from '../types/fuel';

interface HeaderProps {
  vehicles: Vehicle[];
  activeVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenVehicleModal: (vehicleToEdit?: Vehicle | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenAddModal,
  onOpenExportModal,
  onOpenVehicleModal,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Gestão Veicular'}
            </span>
            {activeVehicle && (
              <button
                onClick={() => onOpenVehicleModal(activeVehicle)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Editar este carro"
              >
                <Edit2 size={11} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

        {/* Botão para cadastrar novo carro */}
        <button
          onClick={() => onOpenVehicleModal(null)}
          style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            cursor: 'pointer',
          }}
          title="Cadastrar Novo Carro"
        >
          <CarPlus size={18} />
        </button>

        {/* Botão de novo abastecimento */}
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
