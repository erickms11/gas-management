import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { TrendingUp, BarChart2, Gauge, Zap } from 'lucide-react';
import { Refueling } from '../types/fuel';

interface ChartsViewProps {
  refuelings: Refueling[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ refuelings }) => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'kml' | 'preco' | 'gasto'>('all');

  // Ordenar abastecimentos por data crescente para os gráficos
  const chartData = [...refuelings]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      data: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      preco: r.pricePerLiter,
      kml: r.consumptionKmL ? Number(r.consumptionKmL.toFixed(2)) : null,
      mediaKml: r.runningAverageKmL ? Number(r.runningAverageKmL.toFixed(2)) : (r.consumptionKmL ? Number(r.consumptionKmL.toFixed(2)) : null),
      gasto: r.totalCost,
      combustivel: r.fuelType,
      isFullTank: r.isFullTank,
      kmDriven: r.kmDriven || 0,
      liters: r.liters,
    }));

  if (chartData.length === 0) return null;

  // Filtrar apenas abastecimentos que possuem cálculo de Km/L ou Média
  const kmlData = chartData.filter((d) => d.kml !== null || d.mediaKml !== null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
      {/* Botões de alternância rápida de gráficos */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setSelectedMetric('all')}
          style={{
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            background: selectedMetric === 'all' ? 'var(--primary)' : 'var(--bg-surface)',
            color: selectedMetric === 'all' ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          Todos
        </button>
        <button
          onClick={() => setSelectedMetric('kml')}
          style={{
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            background: selectedMetric === 'kml' ? 'var(--accent-green)' : 'var(--bg-surface)',
            color: selectedMetric === 'kml' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
          }}
        >
          <Gauge size={13} /> Consumo (Km/L)
        </button>
        <button
          onClick={() => setSelectedMetric('preco')}
          style={{
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            background: selectedMetric === 'preco' ? 'var(--primary)' : 'var(--bg-surface)',
            color: selectedMetric === 'preco' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
          }}
        >
          <TrendingUp size={13} /> Preço (R$/L)
        </button>
        <button
          onClick={() => setSelectedMetric('gasto')}
          style={{
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            background: selectedMetric === 'gasto' ? 'var(--accent-fuel)' : 'var(--bg-surface)',
            color: selectedMetric === 'gasto' ? '#fff' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
          }}
        >
          <BarChart2 size={13} /> Gastos (R$)
        </button>
      </div>

      {/* Gráfico de Consumo (Km/L) - Funciona com Tanque Parcial */}
      {(selectedMetric === 'all' || selectedMetric === 'kml') && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge size={18} color="var(--accent-green)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Rendimento / Consumo (Km/L)</h4>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--accent-green)',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Zap size={11} /> Suporta abastecimento parcial
            </span>
          </div>

          {kmlData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Cadastre pelo menos 2 abastecimentos com odômetro diferente para calcular o Km/L do trecho.
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ width: '100%', height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kmlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="data" stroke="#64748b" fontSize={11} />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} unit=" Km/L" />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value: any, name: any, item: any) => {
                        if (name === 'mediaKml' || name === 'Média Acumulada') {
                          return [`${Number(value).toFixed(2)} Km/L`, 'Média Acumulada (Km/L)'];
                        }
                        return [
                          `${Number(value).toFixed(2)} Km/L ${item.payload.isFullTank ? '(Tanque Cheio)' : '(Parcial)'}`,
                          `Consumo do Trecho (+${item.payload.kmDriven} Km / ${item.payload.liters} L)`,
                        ];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mediaKml"
                      name="Média Acumulada"
                      stroke="var(--accent-green)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: 'var(--accent-green)' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="kml"
                      name="Consumo do Trecho"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#38bdf8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', background: 'var(--accent-green)', borderRadius: '2px', display: 'inline-block' }}></span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Média Acumulada (Km/L)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #38bdf8', display: 'inline-block' }}></span>
                  <span>Consumo do Trecho</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gráfico: Evolução do Preço do Combustível */}
      {(selectedMetric === 'all' || selectedMetric === 'preco') && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Evolução do Preço (R$/L)</h4>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" stroke="#64748b" fontSize={11} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} unit=" R$" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Preço/L']}
                />
                <Line type="monotone" dataKey="preco" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gráfico: Gastos Totais por Abastecimento */}
      {(selectedMetric === 'all' || selectedMetric === 'gasto') && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BarChart2 size={18} color="var(--accent-fuel)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Gastos por Abastecimento (R$)</h4>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" R$" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Valor Abastecido']}
                />
                <Bar dataKey="gasto" fill="var(--accent-fuel)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

