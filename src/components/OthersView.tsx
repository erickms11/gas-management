import React, { useState } from 'react';
import { Settings, Scale, Calculator, SlidersHorizontal } from 'lucide-react';
import { SettingsView } from './SettingsView';
import { CarComparison } from './CarComparison';
import { FlexCalculator } from './FlexCalculator';
import { ConsumptionStats } from '../types/fuel';

interface OthersViewProps {
  onDataChanged: () => void;
  stats: ConsumptionStats;
  currentVehicleName?: string;
  defaultSection?: 'ajustes' | 'comparativo' | 'flex';
}

export const OthersView: React.FC<OthersViewProps> = ({
  onDataChanged,
  stats,
  currentVehicleName,
  defaultSection = 'ajustes',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ajustes' | 'comparativo' | 'flex'>(defaultSection);

  return (
    <div style={{ marginTop: '6px' }}>
      {/* Barra de Seleção Superior com Efeito Vidro Líquido */}
      <div className="liquid-segment" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className={`liquid-segment-btn ${activeSubTab === 'ajustes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ajustes')}
          style={{ gap: '6px' }}
        >
          <Settings size={15} />
          <span>Ajustes</span>
        </button>

        <button
          type="button"
          className={`liquid-segment-btn ${activeSubTab === 'comparativo' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('comparativo')}
          style={{ gap: '6px' }}
        >
          <Scale size={15} />
          <span>Comparativo</span>
        </button>

        <button
          type="button"
          className={`liquid-segment-btn ${activeSubTab === 'flex' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('flex')}
          style={{ gap: '6px' }}
        >
          <Calculator size={15} />
          <span>Calculadora</span>
        </button>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      {activeSubTab === 'ajustes' && (
        <SettingsView
          onDataChanged={onDataChanged}
          onNavigate={(sub) => {
            if (sub === 'comparativo' || sub === 'flex') {
              setActiveSubTab(sub);
            }
          }}
        />
      )}

      {activeSubTab === 'comparativo' && (
        <CarComparison
          userStats={stats}
          currentVehicleName={currentVehicleName}
        />
      )}

      {activeSubTab === 'flex' && (
        <div>
          <FlexCalculator />
        </div>
      )}
    </div>
  );
};

