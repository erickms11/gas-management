import React, { useState } from 'react';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Plus } from 'lucide-react';
import { MaintenanceItem } from '../types/fuel';

interface MaintenanceRemindersProps {
  items: MaintenanceItem[];
  currentOdometer: number;
  onToggleComplete: (id: string) => void;
  onAdd: (item: Omit<MaintenanceItem, 'id'>) => void;
}

export const MaintenanceReminders: React.FC<MaintenanceRemindersProps> = ({
  items,
  currentOdometer,
  onToggleComplete,
  onAdd,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceItem['category']>('Óleo & Filtro');
  const [nextOdometer, setNextOdometer] = useState(currentOdometer ? (currentOdometer + 10000).toString() : '40000');
  const [nextDate, setNextDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      vehicleId: 'v1',
      title: title.trim(),
      category,
      lastServiceDate: new Date().toISOString().split('T')[0],
      lastServiceOdometer: currentOdometer,
      nextServiceOdometer: parseInt(nextOdometer, 10) || undefined,
      nextServiceDate: nextDate || undefined,
      completed: false,
    });

    setTitle('');
    setShowAddForm(false);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Manutenções & Lembretes</h3>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--primary)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Plus size={14} /> Novo Lembrete
        </button>
      </div>

      {showAddForm && (
        <form className="glass-card" onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Cadastrar Novo Lembrete</h4>
          <div className="form-group">
            <label className="form-label">Título da Manutenção</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Troca de Óleo 10.000 Km"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceItem['category'])}
              >
                <option value="Óleo & Filtro">Óleo & Filtro</option>
                <option value="Pneus">Pneus</option>
                <option value="Freios">Freios</option>
                <option value="Revisão Geral">Revisão Geral</option>
                <option value="IPVA/Seguro">IPVA/Seguro</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Próxima KM Alvo</label>
              <input
                type="number"
                className="form-input"
                value={nextOdometer}
                onChange={(e) => setNextOdometer(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '10px' }}>
            Salvar Lembrete
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          Sem manutenções cadastradas.
        </div>
      ) : (
        items.map((item) => {
          const remainingKm = item.nextServiceOdometer ? item.nextServiceOdometer - currentOdometer : null;
          const isWarning = remainingKm !== null && remainingKm <= 1000 && !item.completed;

          return (
            <div
              key={item.id}
              className="glass-card"
              style={{
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: isWarning ? '4px solid #ef4444' : item.completed ? '4px solid var(--accent-green)' : '4px solid var(--primary)',
                opacity: item.completed ? 0.6 : 1,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', textDecoration: item.completed ? 'line-through' : 'none' }}>
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {item.nextServiceOdometer && (
                    <span>Próxima revisão: {item.nextServiceOdometer.toLocaleString('pt-BR')} Km</span>
                  )}
                  {remainingKm !== null && !item.completed && (
                    <span
                      style={{
                        marginLeft: '8px',
                        color: remainingKm <= 1000 ? '#f87171' : 'var(--accent-green)',
                        fontWeight: 700,
                      }}
                    >
                      ({remainingKm > 0 ? `Faltam ${remainingKm} Km` : 'Vencida!'})
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onToggleComplete(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: item.completed ? 'var(--accent-green)' : 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <CheckCircle2 size={24} />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};
