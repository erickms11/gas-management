import React, { useState, useEffect } from 'react';
import { X, Car, Check, Trash2, Edit3, Plus } from 'lucide-react';
import { Vehicle } from '../types/fuel';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  vehicleToEdit?: Vehicle | null;
  canDelete?: boolean;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  vehicleToEdit,
  canDelete = false,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Chevrolet');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2023');
  const [licensePlate, setLicensePlate] = useState('');
  const [initialOdometer, setInitialOdometer] = useState('30000');
  const [currentOdometer, setCurrentOdometer] = useState('35000');
  const [tankCapacityLiters, setTankCapacityLiters] = useState('53');
  const [fuelGaugePoints, setFuelGaugePoints] = useState('14');

  useEffect(() => {
    if (vehicleToEdit) {
      setName(vehicleToEdit.name);
      setBrand(vehicleToEdit.brand);
      setModel(vehicleToEdit.model);
      setYear(vehicleToEdit.year.toString());
      setLicensePlate(vehicleToEdit.licensePlate || '');
      const initOdo = vehicleToEdit.initialOdometer !== undefined ? vehicleToEdit.initialOdometer : vehicleToEdit.currentOdometer;
      setInitialOdometer(initOdo.toString());
      setCurrentOdometer(vehicleToEdit.currentOdometer.toString());
      setTankCapacityLiters(vehicleToEdit.tankCapacityLiters ? vehicleToEdit.tankCapacityLiters.toString() : '53');
      setFuelGaugePoints(vehicleToEdit.fuelGaugePoints ? vehicleToEdit.fuelGaugePoints.toString() : '14');
    } else {
      setName('Nissan Tiida');
      setBrand('Nissan');
      setModel('Tiida 1.8 16V');
      setYear('2013');
      setLicensePlate('');
      setInitialOdometer('0');
      setCurrentOdometer('0');
      setTankCapacityLiters('53');
      setFuelGaugePoints('14');
    }
  }, [isOpen, vehicleToEdit]);

  const handleApplyTiidaPreset = () => {
    setName('Nissan Tiida');
    setBrand('Nissan');
    setModel('Tiida 1.8 16V Flex');
    setTankCapacityLiters('53');
    setFuelGaugePoints('14');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !model.trim()) {
      alert('Preencha pelo menos o Apelido e o Modelo do carro.');
      return;
    }

    const initOdo = parseInt(initialOdometer, 10) || 0;
    const currOdo = parseInt(currentOdometer, 10) || initOdo;

    if (currOdo < initOdo) {
      alert(`Atenção: O Odômetro Atual (${currOdo.toLocaleString('pt-BR')} Km) não pode ser menor que o Odômetro Inicial (${initOdo.toLocaleString('pt-BR')} Km). Verifique os números digitados.`);
      return;
    }

    const vehicleData: Vehicle = {
      id: vehicleToEdit ? vehicleToEdit.id : 'v_' + Date.now(),
      name: name.trim(),
      brand: brand.trim() || 'Marca não informada',
      model: model.trim(),
      year: parseInt(year, 10) || new Date().getFullYear(),
      licensePlate: licensePlate.trim() || undefined,
      initialOdometer: initOdo,
      currentOdometer: currOdo,
      tankCapacityLiters: parseFloat(tankCapacityLiters) || 53,
      fuelGaugePoints: parseInt(fuelGaugePoints, 10) || 14,
    };

    onSave(vehicleData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Car size={22} color="var(--primary)" />
            <h2 className="modal-title">
              {vehicleToEdit ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Apelido do Carro</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Meu Onix, Carro de Viagem, HB20 da Maria"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Marca / Montadora</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Chevrolet, Toyota, Fiat"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Modelo & Versão</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Onix 1.0 Turbo, Corolla 2.0"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ano de Fabricação</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 2022"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Placa (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: BRA2E19"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Odômetro Inicial (Km)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 30000"
                value={initialOdometer}
                onChange={(e) => setInitialOdometer(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                Início do seu controle
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Odômetro Atual (Km)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 34850"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                Atualizado nos abastecimentos
              </span>
            </div>
          </div>

          {/* Botão de Atalho Rápido para Nissan Tiida */}
          <div style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={handleApplyTiidaPreset}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px dashed var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              🚗 Configurar como Nissan Tiida (53L • 14 pontos no mostrador)
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capacidade do Tanque (Litros)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                placeholder="Ex: 53"
                value={tankCapacityLiters}
                onChange={(e) => setTankCapacityLiters(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                Nissan Tiida: 53 Litros
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Pontos no Mostrador</label>
              <input
                type="number"
                min="1"
                max="30"
                className="form-input"
                placeholder="Ex: 14"
                value={fuelGaugePoints}
                onChange={(e) => setFuelGaugePoints(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                Nissan Tiida: 14 pontos no odômetro
              </span>
            </div>
          </div>

          {parseFloat(tankCapacityLiters) > 0 && parseInt(fuelGaugePoints, 10) > 0 && (
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '10px 12px',
                marginBottom: '14px',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
              }}
            >
              📊 <strong>Calibração do Mostrador:</strong> Cada ponto digital no seu painel equivale a aproximadamente{' '}
              <strong style={{ color: 'var(--primary)' }}>
                {(parseFloat(tankCapacityLiters) / parseInt(fuelGaugePoints, 10)).toFixed(2)} Litros
              </strong>.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {vehicleToEdit && canDelete && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir o veículo "${vehicleToEdit.name}"?`)) {
                    onDelete(vehicleToEdit.id);
                    onClose();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={16} /> Excluir
              </button>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1, margin: 0 }}
            >
              <Check size={18} /> {vehicleToEdit ? 'Salvar Alterações' : 'Cadastrar Carro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

