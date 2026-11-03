import React, { useState } from 'react';
import { Flame, ArrowRight, Zap, Info } from 'lucide-react';
import { calculateFlexAdvantage } from '../utils/calculations';

export const FlexCalculator: React.FC = () => {
  const [ethanolPrice, setEthanolPrice] = useState<string>('3.89');
  const [gasolinePrice, setGasolinePrice] = useState<string>('5.79');
  const [ratioThreshold, setRatioThreshold] = useState<number>(70); // 70% padrão

  const eth = parseFloat(ethanolPrice) || 0;
  const gas = parseFloat(gasolinePrice) || 0;

  const result = calculateFlexAdvantage(eth, gas, ratioThreshold / 100);

  return (
    <div className="glass-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '8px', borderRadius: '10px' }}>
          <Flame size={22} color="var(--accent-fuel)" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Calculadora Flex (Etanol vs Gasolina)</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Descubra qual combustível vale mais a pena no posto agora
          </p>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Preço Etanol (R$)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={ethanolPrice}
            onChange={(e) => setEthanolPrice(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Preço Gasolina (R$)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            value={gasolinePrice}
            onChange={(e) => setGasolinePrice(e.target.value)}
          />
        </div>
      </div>

      <div style={{ margin: '14px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>Fator de Rendimento Veicular:</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{ratioThreshold}%</span>
        </div>
        <input
          type="range"
          min="65"
          max="75"
          step="1"
          value={ratioThreshold}
          onChange={(e) => setRatioThreshold(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '2px' }}>
          Regra padrão nacional: 70%
        </div>
      </div>

      {eth > 0 && gas > 0 && (
        <div
          style={{
            background: result.recommended === 'Etanol' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${result.recommended === 'Etanol' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            borderRadius: '14px',
            padding: '16px',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Combustível Recomendado
          </span>
          <div
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: result.recommended === 'Etanol' ? '#34d399' : '#fbbf24',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Zap size={24} />
            Abasteça com {result.recommended.toUpperCase()}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px' }}>
            O Etanol custa <strong>{(result.ratioPercent ?? 0).toFixed(1)}%</strong> do preço da Gasolina.
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {result.recommended === 'Etanol'
              ? `Abaixo do limite de ${ratioThreshold}%. Vantagem econômica no abastecimento!`
              : `Acima do limite de ${ratioThreshold}%. A Gasolina oferece maior autonomia.`}
          </div>
        </div>
      )}
    </div>
  );
};
