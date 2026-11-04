import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Calendar,
  MapPin,
  Gauge,
  DollarSign,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  AlertTriangle,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { MaintenanceItem } from '../types/fuel';
import { formatDisplayDate, getDateTimestamp } from '../utils/calculations';
import { MaintenanceModal } from './MaintenanceModal';

interface MaintenanceViewProps {
  items: MaintenanceItem[];
  currentOdometer: number;
  onToggleComplete: (id: string) => void;
  onSaveItem: (item: Omit<MaintenanceItem, 'id' | 'vehicleId'>, editId?: string) => void;
  onDeleteItem: (id: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  items,
  currentOdometer,
  onToggleComplete,
  onSaveItem,
  onDeleteItem,
}) => {
  const [filter, setFilter] = useState<'todos' | 'preventiva' | 'pontual' | 'agendado' | 'concluido'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null);

  // Filtros
  const filtered = items.filter((item) => {
    const itemType = item.type || 'preventiva';
    const itemStatus = item.status || (item.completed ? 'concluido' : 'agendado');

    if (filter === 'todos') return true;
    if (filter === 'preventiva') return itemType === 'preventiva';
    if (filter === 'pontual') return itemType === 'pontual';
    if (filter === 'agendado') return itemStatus === 'agendado';
    if (filter === 'concluido') return itemStatus === 'concluido';
    return true;
  });

  // Ordenação: Itens agendados mais próximos primeiro, seguidos dos mais recentes
  const sorted = [...filtered].sort((a, b) => {
    const statusA = a.status || (a.completed ? 'concluido' : 'agendado');
    const statusB = b.status || (b.completed ? 'concluido' : 'agendado');
    if (statusA === 'agendado' && statusB !== 'agendado') return -1;
    if (statusA !== 'agendado' && statusB === 'agendado') return 1;
    return getDateTimestamp(b.date) - getDateTimestamp(a.date);
  });

  // Métricas
  const pendingCount = items.filter((i) => (i.status || (i.completed ? 'concluido' : 'agendado')) === 'agendado').length;
  const completedCount = items.filter((i) => (i.status || (i.completed ? 'concluido' : 'agendado')) === 'concluido').length;
  const totalSpent = items.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MaintenanceItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Top Header com Botão + Nova Manutenção */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.35) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wrench size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Oficina & Manutenções</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Preventivas agendadas e reparos pontuais
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="btn-primary"
          style={{
            width: 'auto',
            padding: '7px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Plus size={15} />
          <span>Cadastrar</span>
        </button>
      </div>

      {/* Cards de Métricas em Liquid Glass */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '16px' }}>
        <div className="glass-card stat-card" style={{ padding: '12px 10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Agendadas</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
            {pendingCount}
          </div>
        </div>

        <div className="glass-card stat-card" style={{ padding: '12px 10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Concluídas</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '2px' }}>
            {completedCount}
          </div>
        </div>

        <div className="glass-card stat-card" style={{ padding: '12px 10px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Gasto</span>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Barra de Filtros com Estilo Liquid Segment / Pills */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '8px',
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={() => setFilter('todos')}
          className="liquid-pill-btn"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            background: filter === 'todos' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            border: filter === 'todos' ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: filter === 'todos' ? '#fff' : 'var(--text-muted)',
          }}
        >
          Todas ({items.length})
        </button>

        <button
          onClick={() => setFilter('preventiva')}
          className="liquid-pill-btn"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            background: filter === 'preventiva' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            border: filter === 'preventiva' ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: filter === 'preventiva' ? '#fff' : 'var(--text-muted)',
          }}
        >
          🛡️ Preventivas
        </button>

        <button
          onClick={() => setFilter('pontual')}
          className="liquid-pill-btn"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            background: filter === 'pontual' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            border: filter === 'pontual' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
            color: filter === 'pontual' ? '#fff' : 'var(--text-muted)',
          }}
        >
          ⚠️ Pontuais (Imprevistos)
        </button>

        <button
          onClick={() => setFilter('agendado')}
          className="liquid-pill-btn"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            background: filter === 'agendado' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            border: filter === 'agendado' ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: filter === 'agendado' ? '#fff' : 'var(--text-muted)',
          }}
        >
          ⏳ Agendadas ({pendingCount})
        </button>

        <button
          onClick={() => setFilter('concluido')}
          className="liquid-pill-btn"
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.76rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            background: filter === 'concluido' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.05)',
            border: filter === 'concluido' ? '1px solid var(--accent-green)' : '1px solid rgba(255, 255, 255, 0.12)',
            color: filter === 'concluido' ? '#fff' : 'var(--text-muted)',
          }}
        >
          ✅ Concluídas ({completedCount})
        </button>
      </div>

      {/* Lista de Manutenções */}
      {sorted.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
          <Wrench size={40} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
            Nenhuma manutenção encontrada
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            Agende serviços futuros (óleo, correia, câmbio) ou registre consertos pontuais (pneu furado, para-choque).
          </p>
          <button
            onClick={handleOpenNew}
            className="btn-primary"
            style={{ width: 'auto', margin: '14px auto 0', padding: '8px 18px', fontSize: '0.82rem' }}
          >
            <Plus size={16} /> Cadastrar Manutenção
          </button>
        </div>
      ) : (
        sorted.map((item) => {
          const itemType = item.type || 'preventiva';
          const itemStatus = item.status || (item.completed ? 'concluido' : 'agendado');
          const isDone = itemStatus === 'concluido';

          return (
            <div
              key={item.id}
              className="refuel-item clickable-card"
              onClick={() => handleOpenEdit(item)}
              style={{
                display: 'block',
                padding: '14px 15px',
                marginBottom: '12px',
                borderLeft: isDone ? '4px solid var(--accent-green)' : '4px solid #f59e0b',
                opacity: isDone ? 0.88 : 1,
              }}
              title="Toque para ver detalhes, editar ou excluir"
            >
              {/* Linha Superior: Badges e Data */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {itemType === 'preventiva' ? (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        color: 'var(--primary)',
                      }}
                    >
                      🛡️ Preventiva
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#fbbf24',
                      }}
                    >
                      ⚠️ Pontual
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: isDone ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                      color: isDone ? 'var(--accent-green)' : '#f59e0b',
                    }}
                  >
                    {isDone ? '✅ Concluído' : '⏳ Agendado'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Calendar size={12} />
                  <span>{formatDisplayDate(item.date)}</span>
                </div>
              </div>

              {/* Título da Manutenção */}
              <div
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginTop: '6px',
                  textDecoration: isDone ? 'none' : 'none',
                }}
              >
                {item.title}
              </div>

              {/* Informações: Local, Odômetro, Custo */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                }}
              >
                {item.location && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '180px',
                    }}
                    title={item.location}
                  >
                    <MapPin size={12} color="var(--primary)" />
                    <span>{item.location}</span>
                  </div>
                )}

                {item.odometer && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                    <Gauge size={12} color="var(--accent-purple)" />
                    <span>{item.odometer.toLocaleString('pt-BR')} Km</span>
                  </div>
                )}

                {item.cost !== undefined && item.cost > 0 && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontWeight: 800,
                      color: 'var(--accent-green)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>R$ {item.cost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Observações */}
              {item.notes && (
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--text-dim)',
                    marginTop: '5px',
                    fontStyle: 'italic',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  💬 {item.notes}
                </div>
              )}

              {/* Botão de Marcar como Concluído / Reabrir */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginTop: '8px',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(item.id);
                  }}
                  className="liquid-pill-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: isDone ? 'rgba(255, 255, 255, 0.06)' : 'rgba(16, 185, 129, 0.16)',
                    border: isDone ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(16, 185, 129, 0.4)',
                    color: isDone ? 'var(--text-muted)' : 'var(--accent-green)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>{isDone ? 'Reabrir como Agendado' : 'Marcar como Concluído'}</span>
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Modal de Manutenção */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={onSaveItem}
        onDelete={onDeleteItem}
        currentOdometer={currentOdometer}
        itemToEdit={editingItem}
      />
    </div>
  );
};

