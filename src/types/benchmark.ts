export interface BenchmarkCar {
  id: string;
  name: string;
  brand: string;
  category: 'Combustão' | 'Híbrido' | 'Elétrico';
  fuelType: 'Gasolina' | 'Etanol' | 'Flex' | 'Híbrido Flex' | 'Híbrido Plug-in' | '100% Elétrico';
  cityKmL: number; // Km/L na cidade ou Km/kWh para elétrico
  highwayKmL: number; // Km/L na estrada ou Km/kWh
  combinedKmL: number;
  consumptionUnit: 'Km/L' | 'Km/kWh';
  estimatedCostPer100Km: number; // Custo estimado para rodar 100km em R$
  efficiencyScore: 'A' | 'B' | 'C' | 'D' | 'E';
  notes: string;
}

export const BRAZILIAN_BENCHMARK_CARS: BenchmarkCar[] = [
  // ELÉTRICOS
  {
    id: 'byd-dolphin-mini',
    name: 'BYD Dolphin Mini',
    brand: 'BYD',
    category: 'Elétrico',
    fuelType: '100% Elétrico',
    cityKmL: 9.6, // km/kWh
    highwayKmL: 8.4,
    combinedKmL: 9.1,
    consumptionUnit: 'Km/kWh',
    estimatedCostPer100Km: 10.50, // base R$ 0,95/kWh
    efficiencyScore: 'A',
    notes: 'Mais vendido elétrico do Brasil. Bateria Blade de 38 kWh.',
  },
  {
    id: 'byd-dolphin',
    name: 'BYD Dolphin GS',
    brand: 'BYD',
    category: 'Elétrico',
    fuelType: '100% Elétrico',
    cityKmL: 9.1,
    highwayKmL: 8.0,
    combinedKmL: 8.6,
    consumptionUnit: 'Km/kWh',
    estimatedCostPer100Km: 11.20,
    efficiencyScore: 'A',
    notes: 'Hatch elétrico espaçoso com 44.9 kWh.',
  },
  {
    id: 'ora-03',
    name: 'GWM Ora 03 Skin',
    brand: 'GWM',
    category: 'Elétrico',
    fuelType: '100% Elétrico',
    cityKmL: 8.8,
    highwayKmL: 7.7,
    combinedKmL: 8.3,
    consumptionUnit: 'Km/kWh',
    estimatedCostPer100Km: 11.80,
    efficiencyScore: 'A',
    notes: 'Elétrico premium com 171 cv e autonomia urbana destacada.',
  },

  // HÍBRIDOS
  {
    id: 'corolla-cross-hybrid',
    name: 'Toyota Corolla Cross Hybrid',
    brand: 'Toyota',
    category: 'Híbrido',
    fuelType: 'Híbrido Flex',
    cityKmL: 17.8,
    highwayKmL: 14.7,
    combinedKmL: 16.5,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 35.10, // gasolina R$ 5,80
    efficiencyScore: 'A',
    notes: 'Híbrido Flex autorecarregável mais tradicional das ruas brasileiras.',
  },
  {
    id: 'byd-song-plus',
    name: 'BYD Song Plus DM-i',
    brand: 'BYD',
    category: 'Híbrido',
    fuelType: 'Híbrido Plug-in',
    cityKmL: 21.5,
    highwayKmL: 18.2,
    combinedKmL: 20.1,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 28.80,
    efficiencyScore: 'A',
    notes: 'Plug-in Hybrid com mais de 1000 km de autonomia combinada.',
  },
  {
    id: 'gwm-haval-h6-hev',
    name: 'GWM Haval H6 HEV',
    brand: 'GWM',
    category: 'Híbrido',
    fuelType: 'Híbrido Flex',
    cityKmL: 13.8,
    highwayKmL: 12.0,
    combinedKmL: 13.0,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 44.60,
    efficiencyScore: 'B',
    notes: 'SUV médio com 243 cv e excelente retomada combinando motor turbo e elétrico.',
  },

  // COMBUSTÃO POPULARES E ECONÔMICOS
  {
    id: 'renault-kwid',
    name: 'Renault Kwid 1.0 SCe',
    brand: 'Renault',
    category: 'Combustão',
    fuelType: 'Flex',
    cityKmL: 15.3,
    highwayKmL: 15.7,
    combinedKmL: 15.5,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 37.40,
    efficiencyScore: 'A',
    notes: 'Carro a combustão mais econômico do ranking Conpet/Inmetro no Brasil.',
  },
  {
    id: 'chevrolet-onix-10',
    name: 'Chevrolet Onix 1.0 Aspirado',
    brand: 'Chevrolet',
    category: 'Combustão',
    fuelType: 'Flex',
    cityKmL: 13.8,
    highwayKmL: 16.6,
    combinedKmL: 15.0,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 38.60,
    efficiencyScore: 'A',
    notes: 'Excelente consumo rodoviário, líder de vendas no Brasil.',
  },
  {
    id: 'hyundai-hb20-10',
    name: 'Hyundai HB20 1.0 Sense',
    brand: 'Hyundai',
    category: 'Combustão',
    fuelType: 'Flex',
    cityKmL: 13.5,
    highwayKmL: 14.6,
    combinedKmL: 14.0,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 41.40,
    efficiencyScore: 'B',
    notes: 'Motor Kappa 1.0 12V 3 cilindros com bom equilíbrio urbano.',
  },
  {
    id: 'fiat-mobi-10',
    name: 'Fiat Mobi 1.0 Fire',
    brand: 'Fiat',
    category: 'Combustão',
    fuelType: 'Flex',
    cityKmL: 13.5,
    highwayKmL: 15.0,
    combinedKmL: 14.2,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 40.80,
    efficiencyScore: 'B',
    notes: 'Compacto de entrada com mecânica consagrada e manutenção barata.',
  },
  {
    id: 'vw-polo-tsi',
    name: 'VW Polo 170 TSI',
    brand: 'Volkswagen',
    category: 'Combustão',
    fuelType: 'Flex',
    cityKmL: 14.0,
    highwayKmL: 16.4,
    combinedKmL: 15.1,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 38.40,
    efficiencyScore: 'A',
    notes: 'Motor 1.0 Turbo com alto torque em baixas rotações e baixo consumo.',
  },
  {
    id: 'jeep-compass-t270',
    name: 'Jeep Compass 1.3 Turbo T270',
    brand: 'Jeep',
    category: 'Combustão',
    fuelType: 'Flex',
    cityKmL: 10.1,
    highwayKmL: 12.0,
    combinedKmL: 11.0,
    consumptionUnit: 'Km/L',
    estimatedCostPer100Km: 52.70,
    efficiencyScore: 'C',
    notes: 'SUV médio mais vendido, motor potente de 185 cv mas consumo mais elevado.',
  }
];

