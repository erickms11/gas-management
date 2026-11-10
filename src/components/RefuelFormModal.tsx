import React, { useState, useEffect } from 'react';
import { X, Fuel, Check, MapPin, Navigation, RefreshCw, Trash2, Edit3, DollarSign, Droplets, Gauge, Plus, Minus, Zap } from 'lucide-react';
import { FuelType, Refueling, RefuelingLocation, Vehicle } from '../types/fuel';

interface RefuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (refuelData: Omit<Refueling, 'id'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  vehicleId: string;
  lastOdometer: number;
  vehicleCurrentOdometer?: number;
  refuelingToEdit?: Refueling | null;
  vehicle?: Vehicle;
}

export const RefuelFormModal: React.FC<RefuelFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  vehicleId,
  lastOdometer,
  vehicleCurrentOdometer,
  refuelingToEdit,
  vehicle,
}) => {
  if (!isOpen) return null;

  // Capacidade e pontos do marcador do veículo (ex: Nissan Tiida: 53L e 14 pontos)
  const tankCapacity = vehicle?.tankCapacityLiters || 53;
  const gaugePoints = vehicle?.fuelGaugePoints || 14;
  const litersPerPoint = tankCapacity / gaugePoints;

  // Modo de entrada: 'liters' (digitou litros) ou 'value' (digitou valor em R$)
  const [inputMode, setInputMode] = useState<'liters' | 'value'>('liters');

  const baseOdo = lastOdometer || vehicleCurrentOdometer || 0;
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<string>(baseOdo > 0 ? baseOdo.toString() : '');
  const [liters, setLiters] = useState<string>('35.0');
  const [totalValue, setTotalValue] = useState<string>(''); // R$ total digitado pelo usuário
  const [pricePerLiter, setPricePerLiter] = useState<string>('5.79');
  const [fuelType, setFuelType] = useState<FuelType>('Gasolina Comum');
  const [isFullTank, setIsFullTank] = useState<boolean>(false);
  const [tankLevelPointsBefore, setTankLevelPointsBefore] = useState<number>(3);
  const [tankLevelPointsAfter, setTankLevelPointsAfter] = useState<number | undefined>(undefined);
  const [gasStation, setGasStation] = useState<string>('Posto Shell');
  const [notes, setNotes] = useState<string>('');

  const [location, setLocation] = useState<RefuelingLocation | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (refuelingToEdit) {
      setDate(refuelingToEdit.date);
      setOdometer(refuelingToEdit.odometer.toString());
      setLiters(refuelingToEdit.liters.toString());
      setTotalValue(refuelingToEdit.totalCost.toFixed(2));
      setPricePerLiter(refuelingToEdit.pricePerLiter.toString());
      setFuelType(refuelingToEdit.fuelType);
      setIsFullTank(refuelingToEdit.isFullTank ?? false);
      setTankLevelPointsBefore(refuelingToEdit.tankLevelPointsBefore ?? 3);
      setTankLevelPointsAfter(refuelingToEdit.tankLevelPointsAfter);
      setGasStation(refuelingToEdit.gasStation || '');
      setNotes(refuelingToEdit.notes || '');
      setLocation(refuelingToEdit.location || null);
      setInputMode('liters');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      const currentBase = lastOdometer || vehicleCurrentOdometer || 0;
      setOdometer(currentBase > 0 ? currentBase.toString() : '');
      setLiters('35.0');
      setTotalValue('');
      setPricePerLiter('5.79');
      setFuelType('Gasolina Comum');
      setIsFullTank(false);
      setTankLevelPointsBefore(3);
      setTankLevelPointsAfter(undefined);
      setGasStation('Posto Shell');
      setNotes('');
      setLocation(null);
      setInputMode('liters');
    }
  }, [isOpen, refuelingToEdit, lastOdometer, vehicleCurrentOdometer]);

  const numPrice = parseFloat(pricePerLiter) || 0;

  // Calcular litros e total de acordo com o modo de entrada
  const numLiters: number = inputMode === 'liters'
    ? (parseFloat(liters) || 0)
    : (numPrice > 0 ? (parseFloat(totalValue) || 0) / numPrice : 0);

  const computedTotal: number = inputMode === 'liters'
    ? numLiters * numPrice
    : (parseFloat(totalValue) || 0);

  // Estimativas em Litros com base nos pontos do marcador
  const litersRemainingBefore = Math.round(tankLevelPointsBefore * litersPerPoint * 10) / 10;
  const litersNeededToFill = Math.max(0, Math.round((tankCapacity - litersRemainingBefore) * 10) / 10);

  // Previsão de nível pós-abastecimento
  const predictedLitersAfter = Math.min(tankCapacity, Math.round((litersRemainingBefore + numLiters) * 10) / 10);
  const predictedPointsAfter = Math.min(gaugePoints, Math.round((predictedLitersAfter / tankCapacity) * gaugePoints));

  const handleFillUpClick = () => {
    setInputMode('liters');
    setLiters(litersNeededToFill.toFixed(1));
    setIsFullTank(true);
    setTankLevelPointsAfter(gaugePoints);
  };

  const handleLevelChange = (newLevel: number) => {
    const clamped = Math.max(0, Math.min(gaugePoints, newLevel));
    setTankLevelPointsBefore(clamped);
    if (isFullTank) {
      setTankLevelPointsAfter(gaugePoints);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Navegador não suporta geolocalização.');
      return;
    }

    setIsFetchingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let addressStr: string | undefined = undefined;

        try {
          // Tentar reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.pedestrian;
            const suburb = data.address?.suburb || data.address?.neighbourhood;
            const city = data.address?.city || data.address?.town || data.address?.municipality;

            if (road || city) {
              addressStr = [road, suburb, city].filter(Boolean).join(', ');
            } else if (data.display_name) {
              addressStr = data.display_name.split(',').slice(0, 3).join(',');
            }
          }
        } catch {
          // Manter coordenadas sem endereço se offline
        }

        setLocation({
          latitude: lat,
          longitude: lng,
          address: addressStr,
        });
        setIsFetchingLocation(false);
      },
      (err) => {
        setIsFetchingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Permissão de GPS negada.');
        } else {
          setLocationError('Não foi possível obter a localização.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOdometer = parseInt(odometer, 10);

    if (inputMode === 'value' && numPrice <= 0) {
      alert('Informe o Preço por Litro para calcular os litros automaticamente.');
      return;
    }

    if (!parsedOdometer || numLiters <= 0 || numPrice <= 0) {
      alert('Por favor, preencha os campos de Odômetro, Litros/Valor e Preço corretamente.');
      return;
    }

    onSave(
      {
        vehicleId,
        date,
        odometer: parsedOdometer,
        liters: numLiters,
        pricePerLiter: numPrice,
        totalCost: computedTotal,
        fuelType,
        isFullTank,
        tankLevelPointsBefore,
        tankLevelPointsAfter: isFullTank ? gaugePoints : (tankLevelPointsAfter ?? predictedPointsAfter),
        estimatedLitersBefore: litersRemainingBefore,
        estimatedLitersAfter: isFullTank ? tankCapacity : predictedLitersAfter,
        gasStation: gasStation.trim() || undefined,
        location: location || undefined,
        notes: notes.trim() || undefined,
      },
      refuelingToEdit ? refuelingToEdit.id : undefined
    );

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {refuelingToEdit ? (
              <Edit3 size={22} color="var(--primary)" />
            ) : (
              <Fuel size={22} color="var(--accent-fuel)" />
            )}
            <h2 className="modal-title">
              {refuelingToEdit ? 'Editar Abastecimento' : 'Novo Abastecimento'}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Odômetro (Km)</label>
              <input
                type="number"
                className="form-input"
                placeholder={baseOdo > 0 ? `Ex: ${baseOdo}` : 'Ex: 35000'}
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                required
              />
              {baseOdo > 0 && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Último: <strong>{baseOdo.toLocaleString('pt-BR')} Km</strong>
                </span>
              )}
            </div>
          </div>

          {/* Mostrador de Combustível - Odômetro / Painel (Nissan Tiida 14 pontos) */}
          <div
            className="tiida-gauge-card"
            style={{
              background: 'linear-gradient(145deg, rgba(14, 20, 36, 0.85) 0%, rgba(20, 29, 52, 0.65) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gauge size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Nível no Painel (Mostrador do Odômetro)
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {tankLevelPointsBefore} / {gaugePoints} pontos
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Marque quantos pontos estavam acesos no painel ao chegar no posto:
            </div>

            {/* Marcador Interativo de 14 Barras estilo Cluster Nissan Tiida */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => handleLevelChange(tankLevelPointsBefore - 1)}
                disabled={tankLevelPointsBefore <= 0}
                style={{
                  width: '32px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: tankLevelPointsBefore <= 0 ? 'not-allowed' : 'pointer',
                  opacity: tankLevelPointsBefore <= 0 ? 0.3 : 1,
                  flexShrink: 0,
                }}
                title="Diminuir 1 ponto"
              >
                <Minus size={16} />
              </button>

              <div
                style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gaugePoints}, 1fr)`,
                  gap: '4px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '6px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {Array.from({ length: gaugePoints }, (_, i) => i + 1).map((pointNum) => {
                  const isActive = pointNum <= tankLevelPointsBefore;
                  const isReserve = pointNum <= 2;
                  const isHigh = pointNum >= 11;

                  let activeBg = 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)';
                  let activeBorder = 'rgba(56, 189, 248, 0.9)';
                  let activeGlow = '0 0 8px rgba(56, 189, 248, 0.6)';

                  if (isReserve) {
                    activeBg = 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)';
                    activeBorder = 'rgba(248, 113, 113, 0.9)';
                    activeGlow = '0 0 8px rgba(239, 68, 68, 0.6)';
                  } else if (isHigh) {
                    activeBg = 'linear-gradient(180deg, #34d399 0%, #059669 100%)';
                    activeBorder = 'rgba(52, 211, 153, 0.9)';
                    activeGlow = '0 0 8px rgba(16, 185, 129, 0.6)';
                  }

                  return (
                    <button
                      key={pointNum}
                      type="button"
                      onClick={() => handleLevelChange(pointNum)}
                      title={`Ponto ${pointNum} de ${gaugePoints} (~${(pointNum * litersPerPoint).toFixed(1)} L)`}
                      style={{
                        height: '32px',
                        borderRadius: '4px',
                        background: isActive ? activeBg : 'rgba(255, 255, 255, 0.06)',
                        border: isActive ? `1px solid ${activeBorder}` : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isActive ? activeGlow : 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.15s ease',
                      }}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handleLevelChange(tankLevelPointsBefore + 1)}
                disabled={tankLevelPointsBefore >= gaugePoints}
                style={{
                  width: '32px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: tankLevelPointsBefore >= gaugePoints ? 'not-allowed' : 'pointer',
                  opacity: tankLevelPointsBefore >= gaugePoints ? 0.3 : 1,
                  flexShrink: 0,
                }}
                title="Aumentar 1 ponto"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Cards de Litragem & Atalho Rápido para Encher */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Restava no Tanque</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ≈ {litersRemainingBefore} L
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {litersPerPoint.toFixed(2)} L por ponto
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Espaço Livre para Encher</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ≈ {litersNeededToFill} L
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Tanque total de {tankCapacity} L
                </div>
              </div>
            </div>

            {litersNeededToFill > 0 && (
              <button
                type="button"
                onClick={handleFillUpClick}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--accent-green)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={14} /> Quero Completar até o Tanque Cheio (~{litersNeededToFill} L)
              </button>
            )}
          </div>

          <div className="form-row">
            {/* Toggle: Litros ou Valor (R$) - Segmented Liquid Glass Control */}
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Como você quer registrar?</label>
              <div className="liquid-segment">
                <button
                  type="button"
                  onClick={() => setInputMode('liters')}
                  className={`liquid-segment-btn ${inputMode === 'liters' ? 'active' : ''}`}
                >
                  <Droplets size={15} /> Litros abastecidos
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('value')}
                  className={`liquid-segment-btn ${inputMode === 'value' ? 'active-fuel' : ''}`}
                >
                  <DollarSign size={15} /> Valor gasto (R$)
                </button>
              </div>
            </div>

            {/* Campo Litros OU Valor */}
            <div className="form-group">
              {inputMode === 'liters' ? (
                <>
                  <label className="form-label">Litros Abastecidos</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="Ex: 40.5"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    required
                  />
                </>
              ) : (
                <>
                  <label className="form-label">Valor Gasto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="Ex: 100.00"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    required
                  />
                  {numPrice > 0 && parseFloat(totalValue) > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '4px', fontWeight: 600 }}>
                      ≈ {numLiters.toFixed(2)} L calculados automaticamente
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Preço por Litro (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Ex: 5.79"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '12px', marginBottom: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor Total Estimado:</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
              R$ {computedTotal.toFixed(2)}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Combustível</label>
              <select
                className="form-select"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
              >
                <option value="Gasolina Comum">Gasolina Comum</option>
                <option value="Gasolina Aditivada">Gasolina Aditivada</option>
                <option value="Etanol">Etanol</option>
                <option value="Diesel">Diesel</option>
                <option value="GNV">GNV</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nome do Posto (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Posto Shell Central"
                value={gasStation}
                onChange={(e) => setGasStation(e.target.value)}
              />
            </div>
          </div>

          {/* Campo de Localização GPS */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Localização do Posto (GPS)</span>
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation(null)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Trash2 size={12} /> Remover
                </button>
              )}
            </label>

            {!location ? (
              <div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isFetchingLocation}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px dashed var(--primary)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: isFetchingLocation ? 'wait' : 'pointer',
                  }}
                >
                  {isFetchingLocation ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Obtenção do GPS em andamento...
                    </>
                  ) : (
                    <>
                      <Navigation size={16} /> Salvar Minha Localização Atual (GPS)
                    </>
                  )}
                </button>
                {locationError && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                    ⚠️ {locationError}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MapPin size={20} color="var(--accent-etanol)" />
                <div style={{ flex: 1, fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {location.address || 'Coordenadas GPS Capturadas'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group" style={{ flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="fullTank"
                checked={isFullTank}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsFullTank(checked);
                  if (checked) {
                    setTankLevelPointsAfter(gaugePoints);
                  }
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="fullTank" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                Tanque Cheio ({gaugePoints}/{gaugePoints} pontos no mostrador)
              </label>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '28px' }}>
              {isFullTank ? (
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                  ✓ Tanque completado até a boca ({tankCapacity} L • {gaugePoints} pontos). Média Km/L com máxima precisão!
                </span>
              ) : (
                <span>
                  Abastecimento parcial: com {numLiters > 0 ? `${numLiters.toFixed(1)} L` : 'o combustível colocado'}, o mostrador subirá para aprox.{' '}
                  <strong style={{ color: 'var(--primary)' }}>{predictedPointsAfter} de {gaugePoints} pontos</strong> (~{predictedLitersAfter} L).
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Observações (Opcional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Viagem para a serra"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', alignItems: 'center' }}>
            {refuelingToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir este abastecimento?')) {
                    onDelete(refuelingToEdit.id);
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
                title="Excluir este abastecimento"
              >
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            )}

            <button type="submit" className="btn-primary" style={{ flex: 1, margin: 0 }}>
              <Check size={18} /> {refuelingToEdit ? 'Salvar Alterações' : 'Salvar Abastecimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


