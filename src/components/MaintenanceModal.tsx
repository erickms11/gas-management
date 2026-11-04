import React, { useState, useEffect } from 'react';
import { X, Wrench, Check, Trash2, Calendar, MapPin, Gauge, DollarSign, ShieldAlert, Sparkles, FileText } from 'lucide-react';
import { MaintenanceItem, MaintenanceType, MaintenanceStatus } from '../types/fuel';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<MaintenanceItem, 'id' | 'vehicleId'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  currentOdometer?: number;
  itemToEdit?: MaintenanceItem | null;
}

const QUICK_SERVICES = [
  { label: 'Troca de Óleo & Filtro', type: 'preventiva' as MaintenanceType, category: 'Óleo & Filtro' },
  { label: 'Óleo do Câmbio', type: 'preventiva' as MaintenanceType, category: 'Câmbio' },
  { label: 'Pneus & Alinhamento', type: 'preventiva' as MaintenanceType, category: 'Pneus' },
  { label: 'Pneu Furado / Borracharia', type: 'pontual' as MaintenanceType, category: 'Pneus' },
  { label: 'Para-choque / Funilaria', type: 'pontual' as MaintenanceType, category: 'Funilaria' },
  { label: 'Pastilhas & Freios', type: 'preventiva' as MaintenanceType, category: 'Freios' },
  { label: 'Troca de Bateria', type: 'pontual' as MaintenanceType, category: 'Bateria' },
  { label: 'Revisão Geral', type: 'preventiva' as MaintenanceType, category: 'Revisão Geral' },
  { label: 'Amortecedores & Suspensão', type: 'preventiva' as MaintenanceType, category: 'Outros' },
  { label: 'Filtro do Ar-Condicionado', type: 'preventiva' as MaintenanceType, category: 'Outros' },
];

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  currentOdometer = 0,
  itemToEdit,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<MaintenanceType>('preventiva');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('Óleo & Filtro');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [odometer, setOdometer] = useState('');
  const [status, setStatus] = useState<MaintenanceStatus>('agendado');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setType(itemToEdit.type || (itemToEdit.category === 'Outros' ? 'pontual' : 'preventiva'));
      setTitle(itemToEdit.title || '');
      setCategory(itemToEdit.category || 'Óleo & Filtro');
      setDate(itemToEdit.date || itemToEdit.nextServiceDate || itemToEdit.lastServiceDate || new Date().toISOString().split('T')[0]);
      setLocation(itemToEdit.location || '');
      setCost(itemToEdit.cost !== undefined ? itemToEdit.cost.toString() : '');
      setOdometer(
        itemToEdit.odometer !== undefined
          ? itemToEdit.odometer.toString()
          : (itemToEdit.nextServiceOdometer || itemToEdit.lastServiceOdometer || '').toString()
      );
      setStatus(itemToEdit.status || (itemToEdit.completed ? 'concluido' : 'agendado'));
      setNotes(itemToEdit.notes || '');
    } else {
      setType('preventiva');
      setTitle('');
      setCategory('Óleo & Filtro');
      setDate(new Date().toISOString().split('T')[0]);
      setLocation('');
      setCost('');
      setOdometer(currentOdometer > 0 ? currentOdometer.toString() : '');
      setStatus('agendado');
      setNotes('');
    }
  }, [isOpen, itemToEdit, currentOdometer]);

  const handleSelectQuickService = (service: typeof QUICK_SERVICES[0]) => {
    setTitle(service.label);
    setType(service.type);
    setCategory(service.category);
    // Se for preventiva, sugerir status agendado; se pontual, pode ser realizado ou agendado
    if (!itemToEdit) {
      setStatus(service.type === 'preventiva' ? 'agendado' : 'concluido');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe a descrição ou título do serviço.');
      return;
    }

    const parsedCost = cost.trim() ? parseFloat(cost.replace(',', '.')) : undefined;
    const parsedOdometer = odometer.trim() ? parseInt(odometer, 10) : undefined;

    onSave(
      {
        type,
        title: title.trim(),
        category,
        date,
        location: location.trim() || undefined,
        cost: parsedCost && !isNaN(parsedCost) ? parsedCost : undefined,
        odometer: parsedOdometer && !isNaN(parsedOdometer) ? parsedOdometer : undefined,
        status,
        notes: notes.trim() || undefined,
        // Mantém compatibilidade com campos legados
        completed: status === 'concluido',
        lastServiceDate: date,
        lastServiceOdometer: parsedOdometer,
      },
      itemToEdit ? itemToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={22} color="var(--primary)" />
            <h2 className="modal-title">
              {itemToEdit ? 'Editar Manutenção' : 'Nova Manutenção'}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seletor Tipo: Preventiva vs Pontual */}
          <div className="form-group">
            <label className="form-label">Tipo de Manutenção</label>
            <div className="liquid-segment">
              <button
                type="button"
                className={`liquid-segment-btn ${type === 'preventiva' ? 'active' : ''}`}
                onClick={() => setType('preventiva')}
              >
                <span>🛡️ Preventiva</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Agendada)</span>
              </button>
              <button
                type="button"
                className={`liquid-segment-btn ${type === 'pontual' ? 'active' : ''}`}
                onClick={() => setType('pontual')}
              >
                <span>⚠️ Pontual</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Imprevisto)</span>
              </button>
            </div>
          </div>

          {/* Atalhos Rápidos de Sugestões de Serviços */}
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
              <Sparkles size={13} color="var(--primary)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Sugestões rápidas (1 toque para preencher):
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
              }}
            >
              {QUICK_SERVICES.map((srv, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickService(srv)}
                  className="liquid-pill-btn"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderRadius: '20px',
                    border: title === srv.label ? '1px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.14)',
                    background: title === srv.label ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                    color: title === srv.label ? '#fff' : 'var(--text-main)',
                  }}
                >
                  {srv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição / O que é ou foi feito */}
          <div className="form-group">
            <label className="form-label">O que é / foi realizado? *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Troca de Óleo, Pneu furado, Para-choque..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Linha: Data & Odômetro */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Data
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Gauge size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Odômetro (Km)
              </label>
              <input
                type="number"
                className="form-input"
                placeholder={currentOdometer > 0 ? `Ex: ${currentOdometer}` : 'Ex: 158800'}
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </div>
          </div>

          {/* Linha: Local / Oficina & Valor R$ */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Local / Oficina
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Borracharia, Dpaschoal..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <DollarSign size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Ex: 250,00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          {/* Status: Agendado vs Concluído */}
          <div className="form-group">
            <label className="form-label">Situação</label>
            <div className="liquid-segment">
              <button
                type="button"
                className={`liquid-segment-btn ${status === 'agendado' ? 'active' : ''}`}
                onClick={() => setStatus('agendado')}
              >
                <span>⏳ Agendado / Pendente</span>
              </button>
              <button
                type="button"
                className={`liquid-segment-btn ${status === 'concluido' ? 'active' : ''}`}
                onClick={() => setStatus('concluido')}
              >
                <span>✅ Concluído / Realizado</span>
              </button>
            </div>
          </div>

          {/* Observações */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Observações (Opcional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Marca do óleo 5W30, garantia 3 meses..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Rodapé: Botões de Ação */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', alignItems: 'center' }}>
            {itemToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir esta manutenção?')) {
                    onDelete(itemToEdit.id);
                    onClose();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0,
                }}
                title="Excluir esta manutenção"
              >
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            )}

            <button type="submit" className="btn-primary" style={{ flex: 1, margin: 0 }}>
              <Check size={18} /> {itemToEdit ? 'Salvar Alterações' : 'Salvar Manutenção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

