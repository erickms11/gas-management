export type FuelType = 'Gasolina Comum' | 'Gasolina Aditivada' | 'Etanol' | 'Diesel' | 'GNV';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  initialOdometer?: number; // Odômetro inicial ao começar o controle (em KM)
  currentOdometer: number; // Odômetro atual do veículo (em KM)
  tankCapacityLiters?: number; // Capacidade do tanque em Litros (ex: 53L no Nissan Tiida)
  fuelGaugePoints?: number; // Divisões/pontos do mostrador digital no odômetro (ex: 14 no Nissan Tiida)
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
  tankLevelPointsBefore?: number; // Pontos no mostrador antes de abastecer (ex: 3 de 14)
  tankLevelPointsAfter?: number; // Pontos no mostrador após abastecer (ex: 14 de 14)
  estimatedLitersBefore?: number; // Litros estimados restantes antes do abastecimento
  estimatedLitersAfter?: number; // Litros estimados no tanque após abastecimento
  gasStation?: string; // Nome do posto
  location?: RefuelingLocation; // Localização GPS / Posto
  notes?: string;
  kmDriven?: number; // Calculado em relação ao abastecimento anterior
  consumedLiters?: number; // Litros que impulsionaram este trecho
  consumptionKmL?: number; // Km/L calculated
  costPerKm?: number; // R$/Km
  runningAverageKmL?: number; // Média acumulada até este abastecimento
}

export type MaintenanceType = 'preventiva' | 'pontual';
export type MaintenanceStatus = 'agendado' | 'concluido';

export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  type: MaintenanceType; // 'preventiva' (agendamento/revisão) ou 'pontual' (imprevisto/reparo)
  title: string;
  category?: 'Óleo & Filtro' | 'Pneus' | 'Freios' | 'Câmbio' | 'Funilaria' | 'Revisão Geral' | 'Bateria' | 'Outros' | string;
  date: string; // YYYY-MM-DD
  location?: string; // Oficina, Posto, Borracharia, Concessionária, etc.
  cost?: number; // R$
  odometer?: number; // Km no momento ou planejado
  status: MaintenanceStatus; // 'agendado' ou 'concluido'
  notes?: string;
  // Campos legados para compatibilidade com versões anteriores
  lastServiceDate?: string;
  lastServiceOdometer?: number;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  completed?: boolean;
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
