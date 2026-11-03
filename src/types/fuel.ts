export type FuelType = 'Gasolina Comum' | 'Gasolina Aditivada' | 'Etanol' | 'Diesel' | 'GNV';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  currentOdometer: number; // em KM
  tankCapacityLiters?: number;
  photoUrl?: string; // URL ou Base64 da imagem/miniatura do veículo
}

export interface RefuelingLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Refueling {
  id: string;
  vehicleId: string;
  date: string; // ISO string YYYY-MM-DD
  odometer: number; // KM no momento
  liters: number; // Litros abastecidos
  pricePerLiter: number; // R$/L
  totalCost: number; // R$ total
  fuelType: FuelType;
  isFullTank: boolean; // Tanque cheio para cálculo preciso de consumo
  gasStation?: string; // Nome do posto
  location?: RefuelingLocation; // Localização GPS / Posto
  notes?: string;
  kmDriven?: number; // Calculado em relação ao abastecimento anterior
  consumptionKmL?: number; // Km/L calculated
  costPerKm?: number; // R$/Km
  runningAverageKmL?: number; // Média acumulada até este abastecimento
}

export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  title: string;
  category: 'Óleo & Filtro' | 'Pneus' | 'Freios' | 'Revisão Geral' | 'IPVA/Seguro' | 'Outros';
  lastServiceDate: string;
  lastServiceOdometer: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  completed: boolean;
  notes?: string;
}

export interface ConsumptionStats {
  totalSpent: number;
  totalLiters: number;
  totalKmDriven: number;
  averageKmL: number;
  averageCostPerKm: number;
  averagePricePerLiter: number;
  lastOdometer: number;
}
