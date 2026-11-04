import React, { useState } from 'react';
import { Zap, Fuel, BatteryCharging, ArrowUpDown, Filter, Car, HelpCircle, CheckCircle2 } from 'lucide-react';
import { BRAZILIAN_BENCHMARK_CARS, BenchmarkCar } from '../types/benchmark';
import { ConsumptionStats } from '../types/fuel';

interface CarComparisonProps {
  userStats: ConsumptionStats;
  currentVehicleName?: string;
}

export const CarComparison: React.FC<CarComparisonProps> = ({ userStats, currentVehicleName }) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | 'Combustão' | 'Híbrido' | 'Elétrico'>('Todos');
  const [selectedSort, setSelectedSort] = useState<'efficiency' | 'cost' | 'name'>('efficiency');
  const [selectedCarForModal, setSelectedCarForModal] = useState<BenchmarkCar | null>(null);

  // Média de consumo do usuário em Km/L
  const userAvgKmL = userStats.averageKmL || 0;
  const userCostPer100Km = userStats.averageCostPerKm > 0
    ? userStats.averageCostPerKm * 100
    : (userStats.averagePricePerLiter > 0 && userAvgKmL > 0
      ? (100 / userAvgKmL) * userStats.averagePricePerLiter
      : 42.00); // padrão aproximado se não tiver dados

  const filteredCars = BRAZILIAN_BENCHMARK_CARS.filter(car => {
    if (selectedCategory === 'Todos') return true;
    return car.category === selectedCategory;
  }).sort((a, b) => {
    if (selectedSort === 'cost') {
      return a.estimatedCostPer100Km - b.estimatedCostPer100Km;
    }
    if (selectedSort === 'efficiency') {
      // Menor custo por 100km é mais eficiente globalmente
      return a.estimatedCostPer100Km - b.estimatedCostPer100Km;
    }
    return a.name.localeCompare(b.name);
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Elétrico':
        return <BatteryCharging size={16} color="#38bdf8" />;
      case 'Híbrido':
        return <Zap size={16} color="#10b981" />;
      default:
        return <Fuel size={16} color="#f59e0b" />;
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Elétrico':
        return 'rgba(56, 189, 248, 0.15)';
      case 'Híbrido':
        return 'rgba(16, 185, 129, 0.15)';
      default:
        return 'rgba(245, 158, 11, 0.15)';
    }
  };

  const getBadgeTextColor = (category: string) => {
    switch (category) {
      case 'Elétrico':
        return '#38bdf8';
      case 'Híbrido':
        return '#10b981';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Card Comparativo com o Veículo do Usuário */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={20} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
              Seu Veículo: {currentVehicleName || 'Meu Carro'}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
            Seus Dados Reais
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Seu Rendimento Médio</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {userAvgKmL > 0 ? userAvgKmL.toFixed(2) : '--'} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Km/L</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Custo p/ 100 Km</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-fuel)', marginTop: '2px' }}>
              R$ {userCostPer100Km.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={13} /> Compare abaixo como seu gasto se posiciona frente aos modelos mais populares do Brasil.
        </div>
      </div>

      {/* Filtros de Categoria (Liquid Glass Pills) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(['Todos', 'Combustão', 'Híbrido', 'Elétrico'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`liquid-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat === 'Todos' ? '🚗 Todos' : cat === 'Combustão' ? '⛽ Combustão' : cat === 'Híbrido' ? '⚡ Híbridos' : '🔋 Elétricos'}
          </button>
        ))}
      </div>

      {/* Ordenação */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {filteredCars.length} modelos analisados (Inmetro/PBEV)
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={13} color="var(--text-muted)" />
          <select
            className="form-select"
            style={{ padding: '4px 8px', fontSize: '0.76rem', width: 'auto' }}
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
          >
            <option value="efficiency">Mais Econômico (R$/100km)</option>
            <option value="cost">Menor Custo</option>
            <option value="name">Ordem Alfabética</option>
          </select>
        </div>
      </div>

      {/* Lista de Carros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredCars.map((car, idx) => {
          // Diferença percentual em relação ao custo do usuário
          const diffVsUser = userCostPer100Km > 0
            ? ((car.estimatedCostPer100Km - userCostPer100Km) / userCostPer100Km) * 100
            : 0;

          return (
            <div
              key={car.id}
              className="glass-card"
              style={{
                padding: '14px',
                marginBottom: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        background: getBadgeColor(car.category),
                        color: getBadgeTextColor(car.category),
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {getCategoryIcon(car.category)}
                      {car.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      • {car.fuelType}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                    #{idx + 1} {car.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    R$ {car.estimatedCostPer100Km.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    por 100 Km
                  </div>
                </div>
              </div>

              {/* Barra de Consumo Detalhado */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '6px',
                  background: 'var(--bg-surface)',
                  padding: '8px',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Cidade</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {car.cityKmL} {car.consumptionUnit}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Estrada</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {car.highwayKmL} {car.consumptionUnit}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Combinado</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {car.combinedKmL} {car.consumptionUnit}
                  </div>
                </div>
              </div>

              {/* Comparação com seu carro */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Comparado com o seu:</span>
                {diffVsUser < 0 ? (
                  <span style={{ color: 'var(--accent-etanol)', fontWeight: 700 }}>
                    Economiza {Math.abs(diffVsUser).toFixed(0)}% em relação ao seu
                  </span>
                ) : diffVsUser > 0 ? (
                  <span style={{ color: 'var(--accent-fuel)', fontWeight: 700 }}>
                    Gasta +{diffVsUser.toFixed(0)}% a mais que o seu
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                    Equivalente ao seu consumo
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '2px' }}>
                💡 {car.notes}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

