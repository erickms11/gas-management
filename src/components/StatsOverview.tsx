import React from 'react';
import { Gauge, DollarSign, Fuel, Navigation } from 'lucide-react';
import { ConsumptionStats } from '../types/fuel';

interface StatsOverviewProps {
  stats: ConsumptionStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="glass-card stat-card">
        <div className="stat-header">
          <span>Média Consumo</span>
          <Gauge size={18} color="var(--accent-green)" />
        </div>
        <div className="stat-value">
          {stats.averageKmL > 0 ? stats.averageKmL.toFixed(2) : '--'}
          <span className="stat-unit">Km/L</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          Média real calculada
        </span>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-header">
          <span>Custo por Km</span>
          <DollarSign size={18} color="var(--primary)" />
        </div>
        <div className="stat-value">
          R$ {stats.averageCostPerKm > 0 ? stats.averageCostPerKm.toFixed(2) : '0,00'}
          <span className="stat-unit">/Km</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          Gasto médio por distância
        </span>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-header">
          <span>Total Gasto</span>
          <Fuel size={18} color="var(--accent-fuel)" />
        </div>
        <div className="stat-value">
          R$ {stats.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {stats.totalLiters.toFixed(1)} Litros acumulados
        </span>
      </div>

      <div className="glass-card stat-card">
        <div className="stat-header">
          <span>Distância Total</span>
          <Navigation size={18} color="var(--accent-purple)" />
        </div>
        <div className="stat-value">
          {stats.totalKmDriven > 0 ? stats.totalKmDriven.toLocaleString('pt-BR') : 0}
          <span className="stat-unit">Km</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          Odômetro atual: {stats.lastOdometer.toLocaleString('pt-BR')} Km
        </span>
      </div>
    </div>
  );
};
