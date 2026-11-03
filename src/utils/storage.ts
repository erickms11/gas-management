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
    name: 'Meu Carro Principal',
    brand: 'Chevrolet',
    model: 'Onix 1.0 Flex',
    year: 2022,
    licensePlate: 'ABC-1D23',
    currentOdometer: 34850,
    tankCapacityLiters: 44,
  },
  {
    id: 'v2',
    name: 'Carro da Família',
    brand: 'Toyota',
    model: 'Corolla 2.0',
    year: 2021,
    licensePlate: 'XYZ-9876',
    currentOdometer: 52100,
    tankCapacityLiters: 50,
  }
];

const DEFAULT_REFUELINGS: Refueling[] = [
  {
    id: 'r1',
    vehicleId: 'v1',
    date: '2026-09-01',
    odometer: 33400,
    liters: 38.5,
    pricePerLiter: 5.79,
    totalCost: 222.91,
    fuelType: 'Gasolina Comum',
    isFullTank: true,
    gasStation: 'Posto Shell Central',
    location: {
      latitude: -23.55052,
      longitude: -46.633308,
      address: 'Av. Paulista - Bela Vista, São Paulo - SP'
    },
    notes: 'Abastecimento inicial',
  },
  {
    id: 'r2',
    vehicleId: 'v1',
    date: '2026-09-12',
    odometer: 33880,
    liters: 36.2,
    pricePerLiter: 3.89,
    totalCost: 140.81,
    fuelType: 'Etanol',
    isFullTank: true,
    gasStation: 'Posto Ipiranga Express',
    location: {
      latitude: -23.56141,
      longitude: -46.65588,
      address: 'Alameda Santos - Cerqueira César, São Paulo - SP'
    },
    notes: 'Teste com Etanol na cidade',
  },
  {
    id: 'r3',
    vehicleId: 'v1',
    date: '2026-09-22',
    odometer: 34320,
    liters: 37.0,
    pricePerLiter: 5.85,
    totalCost: 216.45,
    fuelType: 'Gasolina Aditivada',
    isFullTank: true,
    gasStation: 'Posto BR Petrobras',
    notes: 'Viagem de fim de semana',
  },
  {
    id: 'r4',
    vehicleId: 'v1',
    date: '2026-10-01',
    odometer: 34850,
    liters: 39.1,
    pricePerLiter: 5.75,
    totalCost: 224.82,
    fuelType: 'Gasolina Comum',
    isFullTank: true,
    gasStation: 'Posto Shell Central',
    location: {
      latitude: -23.55052,
      longitude: -46.633308,
      address: 'Av. Paulista - Bela Vista, São Paulo - SP'
    },
    notes: 'Abastecimento recente',
  }
];

const DEFAULT_MAINTENANCE: MaintenanceItem[] = [
  {
    id: 'm1',
    vehicleId: 'v1',
    title: 'Troca de Óleo e Filtro de Óleo',
    category: 'Óleo & Filtro',
    lastServiceDate: '2026-06-15',
    lastServiceOdometer: 30000,
    nextServiceOdometer: 40000,
    nextServiceDate: '2026-12-15',
    completed: false,
    notes: 'Utilizar óleo 5W30 Sintético',
  },
  {
    id: 'm2',
    vehicleId: 'v1',
    title: 'Alinhamento e Balanceamento dos Pneus',
    category: 'Pneus',
    lastServiceDate: '2026-04-10',
    lastServiceOdometer: 28000,
    nextServiceOdometer: 38000,
    completed: false,
  },
  {
    id: 'm3',
    vehicleId: 'v1',
    title: 'Pagamento IPVA 2026',
    category: 'IPVA/Seguro',
    lastServiceDate: '2026-01-20',
    lastServiceOdometer: 25000,
    nextServiceDate: '2027-01-20',
    completed: true,
  }
];

export function loadVehicles(): Vehicle[] {
  const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEFAULT_VEHICLES));
    return DEFAULT_VEHICLES;
  }
  try {
    return JSON.parse(data);
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
    return JSON.parse(data);
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
