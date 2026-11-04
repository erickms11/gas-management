import React, { useState } from 'react';
import { Fuel, Plus, ChevronDown, Check, Car, Settings2, Trash2 } from 'lucide-react';
import { Vehicle } from '../types/fuel';

interface HeaderProps {
  vehicles: Vehicle[];
  activeVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onOpenVehicleModal: (vehicleToEdit?: Vehicle | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onOpenVehicleModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-color)',
          position: 'relative',
        }}
      >
        {/* Esquerda: Logo GasControl */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
            }}
          >
            <Fuel size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              GasControl
            </span>
          </div>
        </div>

        {/* Direita: Botão do Carro Ativo (Clicar abre a lista de carros para trocar, editar ou cadastrar novo) */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(21, 30, 50, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isDropdownOpen ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.16)',
            borderTop: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '16px',
            padding: '7px 12px',
            color: 'var(--text-main)',
            cursor: 'pointer',
            maxWidth: '220px',
            textAlign: 'left',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255, 255, 255, 0.22)',
            transition: 'all 0.2s',
          }}
          title="Clique para trocar ou gerenciar veículos"
        >
          <Car size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'var(--text-main)',
              }}
            >
              {activeVehicle ? activeVehicle.name : 'Meu Carro'}
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeVehicle ? `${activeVehicle.brand} ${activeVehicle.model}` : 'Selecione'}
            </div>
          </div>
          <ChevronDown size={15} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '2px' }} />
        </button>
      </header>

      {/* Menu Dropdown de Seleção / Edição do Carro */}
      {isDropdownOpen && (
        <div
          onClick={() => setIsDropdownOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(4, 7, 14, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 150,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '65px',
              right: '16px',
              width: 'calc(100vw - 32px)',
              maxWidth: '340px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(14, 20, 36, 0.94)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderTop: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '20px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              zIndex: 151,
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 6px', textTransform: 'uppercase' }}>
              Selecione ou Edite o Veículo
            </div>

            {/* Lista dos veículos já cadastrados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto' }}>
              {vehicles.map((v) => {
                const isSelected = v.id === activeVehicleId;
                return (
                  <div
                    key={v.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    }}
                  >
                    {/* Clique para selecionar o carro ativo */}
                    <div
                      onClick={() => {
                        onSelectVehicle(v.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Car size={16} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                          {v.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {v.brand} {v.model} • {v.currentOdometer.toLocaleString('pt-BR')} Km
                        </div>
                      </div>
                    </div>

                    {/* Botão de Editar este carro específico */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenVehicleModal(v);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: 'var(--text-main)',
                        padding: '6px 8px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Editar dados deste carro"
                    >
                      <Settings2 size={13} />
                      <span>Editar</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Linha divisória e Botão para cadastrar novo veículo */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenVehicleModal(null);
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '9px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} /> Cadastrar Novo Carro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
