import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { RefuelList } from './components/RefuelList';
import { FlexCalculator } from './components/FlexCalculator';
import { MaintenanceReminders } from './components/MaintenanceReminders';
import { ChartsView } from './components/ChartsView';
import { RefuelFormModal } from './components/RefuelFormModal';
import { DataExportModal } from './components/DataExportModal';
import { CarComparison } from './components/CarComparison';
import { SettingsView } from './components/SettingsView';
import { VehicleModal } from './components/VehicleModal';
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
import { LayoutDashboard, History, Flame, Wrench, Plus, Scale, Settings } from 'lucide-react';

export function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [refuelings, setRefuelings] = useState<Refueling[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState<string>('v1');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'historico' | 'flex' | 'comparativo' | 'manutencao' | 'configuracoes'>('dashboard');
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

  // Filtrar abastecimentos do veículo ativo
  const vehicleRefuelings = refuelings.filter((r) => r.vehicleId === activeVehicleId);
  const processedRefuelings = processRefuelings(vehicleRefuelings);
  const stats = calculateStats(processedRefuelings);

  const vehicleMaintenance = maintenance.filter((m) => m.vehicleId === activeVehicleId);
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);

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
    const updated = maintenance.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setMaintenance(updated);
    saveMaintenance(updated);
  };

  const handleAddMaintenance = (newItem: Omit<MaintenanceItem, 'id'>) => {
    const item: MaintenanceItem = {
      ...newItem,
      id: 'm_' + Date.now(),
      vehicleId: activeVehicleId,
    };
    const updated = [...maintenance, item];
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
        onOpenAddModal={handleOpenNewModal}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenVehicleModal={handleOpenVehicleModal}
      />

      {/* Visão Dashboard */}
      {activeTab === 'dashboard' && (
        <>
          <StatsOverview stats={stats} />
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

      {/* Visão Calculadora Flex */}
      {activeTab === 'flex' && <FlexCalculator />}

      {/* Visão Comparativo de Carros */}
      {activeTab === 'comparativo' && (
        <CarComparison
          userStats={stats}
          currentVehicleName={activeVehicle?.name}
        />
      )}

      {/* Visão Manutenções */}
      {activeTab === 'manutencao' && (
        <MaintenanceReminders
          items={vehicleMaintenance}
          currentOdometer={activeVehicle?.currentOdometer || stats.lastOdometer}
          onToggleComplete={handleToggleMaintenance}
          onAdd={handleAddMaintenance}
        />
      )}

      {/* Visão Configurações & Backup */}
      {activeTab === 'configuracoes' && (
        <SettingsView onDataChanged={reloadAllData} />
      )}

      {/* Modal Abastecimento (Novo / Editar) */}
      <RefuelFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRefueling}
        vehicleId={activeVehicleId}
        lastOdometer={stats.lastOdometer}
        refuelingToEdit={editingRefueling}
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

        <button className="fab-button" onClick={() => setIsAddModalOpen(true)} title="Abastecer">
          <Plus size={28} />
        </button>

        <button
          className={`nav-item ${activeTab === 'comparativo' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparativo')}
        >
          <Scale size={20} />
          <span>Comparar</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'configuracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracoes')}
        >
          <Settings size={20} />
          <span>Ajustes</span>
        </button>
      </nav>
    </div>
  );
}
