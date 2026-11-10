import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { RefuelList } from './components/RefuelList';
import { FlexCalculator } from './components/FlexCalculator';
import { MaintenanceView } from './components/MaintenanceView';
import { ChartsView } from './components/ChartsView';
import { RefuelFormModal } from './components/RefuelFormModal';
import { DataExportModal } from './components/DataExportModal';
import { VehicleModal } from './components/VehicleModal';
import { OthersView } from './components/OthersView';
import { PullToRefresh } from './components/PullToRefresh';
import {
  loadVehicles,
  saveVehicles,
  loadRefuelings,
  saveRefuelings,
  loadMaintenance,
  saveMaintenance,
  loadActiveVehicleId,
  saveActiveVehicleId,
} from './utils/storage';
import { processRefuelings, calculateStats } from './utils/calculations';
import { Vehicle, Refueling, MaintenanceItem } from './types/fuel';
import { LayoutDashboard, History, Flame, Wrench, Plus, Scale, Settings, MoreHorizontal, Gauge } from 'lucide-react';

export function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [refuelings, setRefuelings] = useState<Refueling[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>('v1');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'historico' | 'flex' | 'comparativo' | 'manutencao' | 'configuracoes' | 'outros'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRefueling, setEditingRefueling] = useState<Refueling | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    reloadAllData();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const reloadAllData = () => {
    const loadedV = loadVehicles();
    const loadedR = loadRefuelings();
    const loadedM = loadMaintenance();
    const activeId = loadActiveVehicleId();

    setVehicles(loadedV);
    setRefuelings(loadedR);
    setMaintenance(loadedM);
    setActiveVehicleId(activeId);
  };

  const vehicleMaintenance = maintenance.filter((m) => m.vehicleId === activeVehicleId);
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

  // Filtrar abastecimentos do veículo ativo
  const vehicleRefuelings = refuelings.filter((r) => r.vehicleId === activeVehicleId);
  const processedRefuelings = processRefuelings(vehicleRefuelings, activeVehicle);
  const stats = calculateStats(processedRefuelings, activeVehicle);

  // Cálculos do Mostrador de Combustível em Tempo Real (Nissan Tiida 14 pontos)
  const tankCapacity = activeVehicle?.tankCapacityLiters || 53;
  const gaugePoints = activeVehicle?.fuelGaugePoints || 14;
  const litersPerPoint = tankCapacity / gaugePoints;

  const lastRefuel = processedRefuelings.length > 0 ? processedRefuelings[processedRefuelings.length - 1] : null;
  let currentEstimatedLiters = tankCapacity;
  let currentEstimatedPoints = gaugePoints;
  let estimatedRangeKm: number | undefined = undefined;

  if (lastRefuel) {
    const endLiters = lastRefuel.estimatedLitersAfter !== undefined
      ? lastRefuel.estimatedLitersAfter
      : (lastRefuel.isFullTank ? tankCapacity : (lastRefuel.liters + (lastRefuel.tankLevelPointsBefore ? lastRefuel.tankLevelPointsBefore * litersPerPoint : 0)));

    const distanceSinceLastRefuel = Math.max(0, (activeVehicle?.currentOdometer || lastRefuel.odometer) - lastRefuel.odometer);
    const avgKmL = stats.averageKmL > 0 ? stats.averageKmL : (lastRefuel.consumptionKmL || 10.5);
    const litersBurned = avgKmL > 0 ? (distanceSinceLastRefuel / avgKmL) : 0;

    currentEstimatedLiters = Math.max(0, Math.min(tankCapacity, Math.round((endLiters - litersBurned) * 10) / 10));
    currentEstimatedPoints = Math.max(0, Math.min(gaugePoints, Math.round((currentEstimatedLiters / tankCapacity) * gaugePoints)));
    if (avgKmL > 0) {
      estimatedRangeKm = Math.round(currentEstimatedLiters * avgKmL);
    }
  }

  const handleSelectVehicle = (id: string) => {
    setActiveVehicleId(id);
    saveActiveVehicleId(id);
  };

  const handleSaveRefueling = (data: Omit<Refueling, 'id'>, editId?: string) => {
    let updated: Refueling[];

    if (editId) {
      updated = refuelings.map((r) => (r.id === editId ? { ...data, id: editId } : r));
    } else {
      const newRefuel: Refueling = {
        ...data,
        id: 'r_' + Date.now(),
      };
      updated = [...refuelings, newRefuel];
    }

    setRefuelings(updated);
    saveRefuelings(updated);

    // Recalcular odômetro máximo para o veículo
    const vehicleRefuels = updated.filter((r) => r.vehicleId === activeVehicleId);
    const maxOdometer = vehicleRefuels.length > 0
      ? Math.max(...vehicleRefuels.map((r) => r.odometer))
      : (activeVehicle?.currentOdometer || 0);

    if (activeVehicle && maxOdometer > activeVehicle.currentOdometer) {
      const updatedV = vehicles.map((v) =>
        v.id === activeVehicleId ? { ...v, currentOdometer: maxOdometer } : v
      );
      setVehicles(updatedV);
      saveVehicles(updatedV);
    }

    setIsAddModalOpen(false);
    setEditingRefueling(null);
  };

  const handleEditRefueling = (item: Refueling) => {
    setEditingRefueling(item);
    setIsAddModalOpen(true);
  };

  const handleDeleteRefueling = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este abastecimento?')) {
      const updated = refuelings.filter((r) => r.id !== id);
      setRefuelings(updated);
      saveRefuelings(updated);
    }
  };

  const handleToggleMaintenance = (id: string) => {
    const updated = maintenance.map((m) => {
      if (m.id !== id) return m;
      const isDone = m.status === 'concluido' || m.completed === true;
      const nextStatus = isDone ? 'agendado' : 'concluido';
      return {
        ...m,
        status: nextStatus as 'agendado' | 'concluido',
        completed: nextStatus === 'concluido',
      };
    });
    setMaintenance(updated);
    saveMaintenance(updated);
  };

  const handleSaveMaintenance = (data: Omit<MaintenanceItem, 'id' | 'vehicleId'>, editId?: string) => {
    let updated: MaintenanceItem[];
    if (editId) {
      updated = maintenance.map((m) =>
        m.id === editId ? { ...data, id: editId, vehicleId: activeVehicleId } : m
      );
    } else {
      const newItem: MaintenanceItem = {
        ...data,
        id: 'm_' + Date.now(),
        vehicleId: activeVehicleId,
      };
      updated = [newItem, ...maintenance];
    }
    setMaintenance(updated);
    saveMaintenance(updated);
  };

  const handleDeleteMaintenance = (id: string) => {
    const updated = maintenance.filter((m) => m.id !== id);
    setMaintenance(updated);
    saveMaintenance(updated);
  };

  const handleSaveVehicle = (vehicleData: Vehicle) => {
    let updated: Vehicle[];
    const exists = vehicles.some((v) => v.id === vehicleData.id);

    if (exists) {
      updated = vehicles.map((v) => (v.id === vehicleData.id ? vehicleData : v));
    } else {
      updated = [...vehicles, vehicleData];
      setActiveVehicleId(vehicleData.id);
      saveActiveVehicleId(vehicleData.id);
    }

    setVehicles(updated);
    saveVehicles(updated);
    setIsVehicleModalOpen(false);
    setVehicleToEdit(null);
  };

  const handleDeleteVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      alert('Você precisa ter pelo menos um veículo cadastrado.');
      return;
    }
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    saveVehicles(updated);
    if (activeVehicleId === id) {
      setActiveVehicleId(updated[0].id);
      saveActiveVehicleId(updated[0].id);
    }
  };

  const handleOpenVehicleModal = (vehicle?: Vehicle | null) => {
    setVehicleToEdit(vehicle || null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingRefueling(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingRefueling(null);
  };

  return (
    <div className="liquid-app-wrapper">
      {/* Componente de Puxar para Atualizar (Pull-to-Refresh) para PWA Mobile */}
      <PullToRefresh onRefresh={reloadAllData} />

      {/* Ambient Liquid Glow Orbs - Luzes dinâmicas de fundo para refração do vidro líquido */}
      <div className="ambient-blob blob-cyan" aria-hidden="true" />
      <div className="ambient-blob blob-purple" aria-hidden="true" />
      <div className="ambient-blob blob-amber" aria-hidden="true" />

      <div className="app-container">
      {/* Banner de Instalação Mobile PWA */}
      {isInstallable && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(37, 99, 235, 0.2) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📲</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Instalar no Android
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Acesse mais rápido direto da sua tela inicial
              </div>
            </div>
          </div>
          <button
            onClick={handleInstallApp}
            className="btn-primary"
            style={{
              width: 'auto',
              padding: '7px 14px',
              fontSize: '0.78rem',
              fontWeight: 800,
              borderRadius: '10px',
              flexShrink: 0,
            }}
          >
            Instalar
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        vehicles={vehicles}
        activeVehicleId={activeVehicleId}
        onSelectVehicle={handleSelectVehicle}
        onOpenVehicleModal={handleOpenVehicleModal}
      />

      {/* Visão Dashboard */}
      {activeTab === 'dashboard' && (
        <>
          <StatsOverview
            stats={stats}
            initialOdometer={activeVehicle?.initialOdometer}
            currentOdometer={activeVehicle?.currentOdometer || stats.lastOdometer}
          />

          {/* Card de Nível do Tanque no Painel (Estilo Marcador Nissan Tiida) */}
          <div
            className="glass-card"
            style={{
              padding: '14px 16px',
              marginTop: '14px',
              background: 'linear-gradient(135deg, rgba(14, 20, 36, 0.75) 0%, rgba(20, 30, 55, 0.6) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gauge size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Mostrador de Combustível (Painel)
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
                {currentEstimatedPoints} / {gaugePoints} pontos
              </span>
            </div>

            {/* Display de Barras no Cluster */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gaugePoints}, 1fr)`,
                gap: '4px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '10px',
              }}
            >
              {Array.from({ length: gaugePoints }, (_, i) => i + 1).map((p) => {
                const isActive = p <= currentEstimatedPoints;
                const isReserve = p <= 2;
                const isHigh = p >= 11;

                let bg = 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)';
                let border = 'rgba(56, 189, 248, 0.9)';
                let glow = '0 0 8px rgba(56, 189, 248, 0.6)';

                if (isReserve) {
                  bg = 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)';
                  border = 'rgba(248, 113, 113, 0.9)';
                  glow = '0 0 8px rgba(239, 68, 68, 0.6)';
                } else if (isHigh) {
                  bg = 'linear-gradient(180deg, #34d399 0%, #059669 100%)';
                  border = 'rgba(52, 211, 153, 0.9)';
                  glow = '0 0 8px rgba(16, 185, 129, 0.6)';
                }

                return (
                  <div
                    key={p}
                    style={{
                      height: '14px',
                      borderRadius: '3px',
                      background: isActive ? bg : 'rgba(255, 255, 255, 0.06)',
                      border: isActive ? `1px solid ${border}` : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isActive ? glow : 'none',
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div>
                Nível estimado: <strong style={{ color: 'var(--text-main)' }}>~{currentEstimatedLiters} L</strong> de {tankCapacity} L
              </div>
              {estimatedRangeKm !== undefined && (
                <div>
                  Autonomia estimada: <strong style={{ color: 'var(--accent-green)' }}>~{estimatedRangeKm} Km</strong>
                </div>
              )}
            </div>
          </div>

          {/* Atalho Rápido para Oficina & Manutenções */}
          <div
            className="glass-card clickable-card"
            onClick={() => setActiveTab('manutencao')}
            style={{
              padding: '12px 14px',
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.16)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Wrench size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                  Oficina & Manutenções
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {vehicleMaintenance.filter((m) => (m.status || (m.completed ? 'concluido' : 'agendado')) === 'agendado').length > 0
                    ? `⚠️ ${vehicleMaintenance.filter((m) => (m.status || (m.completed ? 'concluido' : 'agendado')) === 'agendado').length} serviço(s) agendado(s)`
                    : 'Revisões preventivas e reparos pontuais'}
                </div>
              </div>
            </div>

            <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 700 }}>
              Abrir ➔
            </span>
          </div>

          <FlexCalculator />
          <ChartsView refuelings={processedRefuelings} />
          <RefuelList
            refuelings={processedRefuelings}
            onDelete={handleDeleteRefueling}
            onEdit={handleEditRefueling}
          />
        </>
      )}

      {/* Visão Histórico */}
      {activeTab === 'historico' && (
        <>
          <ChartsView refuelings={processedRefuelings} />
          <RefuelList
            refuelings={processedRefuelings}
            onDelete={handleDeleteRefueling}
            onEdit={handleEditRefueling}
          />
        </>
      )}

      {/* Visão Manutenções */}
      {activeTab === 'manutencao' && (
        <MaintenanceView
          items={vehicleMaintenance}
          currentOdometer={activeVehicle?.currentOdometer || stats.lastOdometer}
          onToggleComplete={handleToggleMaintenance}
          onSaveItem={handleSaveMaintenance}
          onDeleteItem={handleDeleteMaintenance}
        />
      )}

      {/* Visão Outros (Hub: Ajustes & Dados, Comparativo de Carros, Calculadora Flex) */}
      {(activeTab === 'outros' || activeTab === 'configuracoes' || activeTab === 'comparativo' || activeTab === 'flex') && (
        <OthersView
          onDataChanged={reloadAllData}
          stats={stats}
          currentVehicleName={activeVehicle?.name}
          defaultSection={activeTab === 'comparativo' ? 'comparativo' : (activeTab === 'flex' ? 'flex' : 'ajustes')}
        />
      )}

      {/* Modal Abastecimento (Novo / Editar) */}
      <RefuelFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRefueling}
        onDelete={handleDeleteRefueling}
        vehicleId={activeVehicleId}
        lastOdometer={stats.lastOdometer}
        vehicleCurrentOdometer={activeVehicle?.currentOdometer}
        refuelingToEdit={editingRefueling}
        vehicle={activeVehicle}
      />

      {/* Modal Exportar / Backup JSON */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onDataImported={reloadAllData}
      />

      {/* Modal Veículo (Novo / Editar / Excluir) */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setVehicleToEdit(null);
        }}
        onSave={handleSaveVehicle}
        onDelete={handleDeleteVehicle}
        vehicleToEdit={vehicleToEdit}
        canDelete={vehicles.length > 1}
      />

      {/* Menu Inferior (Mobile Bottom Nav) */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Início</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          <History size={20} />
          <span>Histórico</span>
        </button>

        <button className="fab-button" onClick={handleOpenNewModal} title="Abastecer">
          <Plus size={28} />
        </button>

        <button
          className={`nav-item ${activeTab === 'manutencao' ? 'active' : ''}`}
          onClick={() => setActiveTab('manutencao')}
        >
          <Wrench size={20} />
          <span>Oficina</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'outros' || activeTab === 'configuracoes' || activeTab === 'comparativo' || activeTab === 'flex' ? 'active' : ''}`}
          onClick={() => setActiveTab('outros')}
        >
          <MoreHorizontal size={20} />
          <span>Outros</span>
        </button>
      </nav>
    </div>
    </div>
  );
}
