import { Refueling, Vehicle, MaintenanceItem } from '../types/fuel';

const STORAGE_KEYS = {
  VEHICLES: 'gascontrol_vehicles',
  REFUELINGS: 'gascontrol_refuelings',
  MAINTENANCE: 'gascontrol_maintenance',
  ACTIVE_VEHICLE: 'gascontrol_active_vehicle',
};

const DEFAULT_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    name: 'Meu Nissan Tiida',
    brand: 'Nissan',
    model: 'Tiida 1.8 16V Flex',
    year: 2013,
    licensePlate: 'ABC-1D23',
    initialOdometer: 145000,
    currentOdometer: 146420,
    tankCapacityLiters: 53,
    fuelGaugePoints: 14,
  },
  {
    id: 'v2',
    name: 'Carro da Família',
    brand: 'Toyota',
    model: 'Corolla 2.0',
    year: 2021,
    licensePlate: 'XYZ-9876',
    initialOdometer: 50000,
    currentOdometer: 52100,
    tankCapacityLiters: 50,
    fuelGaugePoints: 12,
  }
];

const DEFAULT_REFUELINGS: Refueling[] = [
  {
    id: 'r1',
    vehicleId: 'v1',
    date: '2026-09-01',
    odometer: 145000,
    liters: 45.0,
    pricePerLiter: 5.79,
    totalCost: 260.55,
    fuelType: 'Gasolina Comum',
    isFullTank: true,
    tankLevelPointsBefore: 2,
    tankLevelPointsAfter: 14,
    gasStation: 'Posto Shell Central',
    location: {
      latitude: -23.55052,
      longitude: -46.633308,
      address: 'Av. Paulista - Bela Vista, São Paulo - SP'
    },
    notes: 'Abastecimento inicial - Tanque Cheio',
  },
  {
    id: 'r2',
    vehicleId: 'v1',
    date: '2026-09-12',
    odometer: 145450,
    liters: 39.5,
    pricePerLiter: 5.85,
    totalCost: 231.08,
    fuelType: 'Gasolina Aditivada',
    isFullTank: true,
    tankLevelPointsBefore: 3,
    tankLevelPointsAfter: 14,
    gasStation: 'Posto Ipiranga Express',
    location: {
      latitude: -23.56141,
      longitude: -46.65588,
      address: 'Alameda Santos - Cerqueira César, São Paulo - SP'
    },
    notes: 'Uso misto cidade/estrada',
  },
  {
    id: 'r3',
    vehicleId: 'v1',
    date: '2026-09-22',
    odometer: 145920,
    liters: 25.0,
    pricePerLiter: 3.89,
    totalCost: 97.25,
    fuelType: 'Etanol',
    isFullTank: false,
    tankLevelPointsBefore: 3,
    tankLevelPointsAfter: 10,
    gasStation: 'Posto BR Petrobras',
    notes: 'Abastecimento parcial com Etanol',
  },
  {
    id: 'r4',
    vehicleId: 'v1',
    date: '2026-10-01',
    odometer: 146420,
    liters: 42.0,
    pricePerLiter: 5.75,
    totalCost: 241.50,
    fuelType: 'Gasolina Comum',
    isFullTank: true,
    tankLevelPointsBefore: 2,
    tankLevelPointsAfter: 14,
    gasStation: 'Posto Shell Central',
    location: {
      latitude: -23.55052,
      longitude: -46.633308,
      address: 'Av. Paulista - Bela Vista, São Paulo - SP'
    },
    notes: 'Tanque completado',
  }
];

const DEFAULT_MAINTENANCE: MaintenanceItem[] = [
  {
    id: 'm1',
    vehicleId: 'v1',
    type: 'preventiva',
    title: 'Troca de Óleo e Filtro de Óleo',
    category: 'Óleo & Filtro',
    date: '2026-11-20',
    location: 'Troca de Óleo Express',
    cost: 260,
    odometer: 160000,
    status: 'agendado',
    notes: 'Óleo sintético 5W30 + filtro de óleo e ar',
  },
  {
    id: 'm2',
    vehicleId: 'v1',
    type: 'preventiva',
    title: 'Troca do Óleo do Câmbio',
    category: 'Câmbio',
    date: '2026-12-15',
    location: 'Oficina Especializada em Transmissão',
    cost: 580,
    odometer: 165000,
    status: 'agendado',
    notes: 'Verificar nível e fluido original recomendado',
  },
  {
    id: 'm3',
    vehicleId: 'v1',
    type: 'pontual',
    title: 'Conserto de Pneu Furado',
    category: 'Pneus',
    date: '2026-10-18',
    location: 'Borracharia São Judas',
    cost: 45,
    odometer: 158500,
    status: 'concluido',
    notes: 'Vulcanização após parafuso no pneu traseiro direito',
  },
  {
    id: 'm4',
    vehicleId: 'v1',
    type: 'pontual',
    title: 'Reparo no Para-choque',
    category: 'Funilaria',
    date: '2026-09-05',
    location: 'Funilaria & Martelinho de Ouro',
    cost: 380,
    odometer: 157200,
    status: 'concluido',
    notes: 'Pintura localizada de arranhão no estacionamento',
  }
];

export function loadVehicles(): Vehicle[] {
  const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEFAULT_VEHICLES));
    return DEFAULT_VEHICLES;
  }
  try {
    const list: Vehicle[] = JSON.parse(data);
    return list.map((v) => ({
      ...v,
      tankCapacityLiters: v.tankCapacityLiters || 53,
      fuelGaugePoints: v.fuelGaugePoints || 14,
    }));
  } catch {
    return DEFAULT_VEHICLES;
  }
}

export function saveVehicles(vehicles: Vehicle[]): void {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
}

export function loadRefuelings(): Refueling[] {
  const data = localStorage.getItem(STORAGE_KEYS.REFUELINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.REFUELINGS, JSON.stringify(DEFAULT_REFUELINGS));
    return DEFAULT_REFUELINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_REFUELINGS;
  }
}

export function saveRefuelings(refuelings: Refueling[]): void {
  localStorage.setItem(STORAGE_KEYS.REFUELINGS, JSON.stringify(refuelings));
}

export function loadMaintenance(): MaintenanceItem[] {
  const data = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(DEFAULT_MAINTENANCE));
    return DEFAULT_MAINTENANCE;
  }
  try {
    const parsed: any[] = JSON.parse(data);
    // Normalizar compatibilidade para itens salvos em versões anteriores
    return parsed.map((item) => ({
      ...item,
      type: item.type || 'preventiva',
      status: item.status || (item.completed ? 'concluido' : 'agendado'),
      date: item.date || item.nextServiceDate || item.lastServiceDate || new Date().toISOString().split('T')[0],
      odometer: item.odometer ?? item.nextServiceOdometer ?? item.lastServiceOdometer,
    }));
  } catch {
    return DEFAULT_MAINTENANCE;
  }
}

export function saveMaintenance(items: MaintenanceItem[]): void {
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(items));
}

export function loadActiveVehicleId(): string {
  const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE);
  return id || 'v1';
}

export function saveActiveVehicleId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, id);
}

export interface AppExportData {
  version: string;
  exportedAt: string;
  vehicles: Vehicle[];
  refuelings: Refueling[];
  maintenance: MaintenanceItem[];
  activeVehicleId?: string;
}

export function exportDataToJson(): void {
  const data: AppExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    vehicles: loadVehicles(),
    refuelings: loadRefuelings(),
    maintenance: loadMaintenance(),
    activeVehicleId: loadActiveVehicleId(),
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `gascontrol_dados_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importDataFromJson(jsonContent: string): { success: boolean; message: string; data?: AppExportData } {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Arquivo JSON inválido.' };
    }

    if (!Array.isArray(parsed.vehicles) && !Array.isArray(parsed.refuelings)) {
      return { success: false, message: 'O arquivo JSON não possui a estrutura válida do GasControl.' };
    }

    if (Array.isArray(parsed.vehicles)) saveVehicles(parsed.vehicles);
    if (Array.isArray(parsed.refuelings)) saveRefuelings(parsed.refuelings);
    if (Array.isArray(parsed.maintenance)) saveMaintenance(parsed.maintenance);
    if (parsed.activeVehicleId) saveActiveVehicleId(parsed.activeVehicleId);

    return {
      success: true,
      message: 'Dados importados com sucesso!',
      data: parsed,
    };
  } catch (err: any) {
    return { success: false, message: 'Erro ao ler arquivo JSON: ' + (err?.message || 'Formato corrompido') };
  }
}

export function resetToSampleData(): void {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEFAULT_VEHICLES));
  localStorage.setItem(STORAGE_KEYS.REFUELINGS, JSON.stringify(DEFAULT_REFUELINGS));
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(DEFAULT_MAINTENANCE));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, 'v1');
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.VEHICLES);
  localStorage.removeItem(STORAGE_KEYS.REFUELINGS);
  localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_VEHICLE);
}
