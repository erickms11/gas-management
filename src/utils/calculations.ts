import { Refueling, ConsumptionStats } from '../types/fuel';

/**
 * Recalcula a quilometragem percorrida e o consumo Km/L para uma lista de abastecimentos ordenados por odômetro asc.
 */
export function processRefuelings(refuelings: Refueling[]): Refueling[] {
  // Ordenar por odômetro crescente para cálculos de sequência
  const sorted = [...refuelings].sort((a, b) => a.odometer - b.odometer);
  const firstOdometer = sorted.length > 0 ? sorted[0].odometer : 0;

  let cumulativeLiters = 0;

  return sorted.map((item, index) => {
    if (index === 0) {
      return {
        ...item,
        kmDriven: undefined,
        consumptionKmL: undefined,
        costPerKm: undefined,
        runningAverageKmL: undefined,
      };
    }

    const prev = sorted[index - 1];
    const kmDriven = item.odometer - prev.odometer;

    // Litros acumulados a partir do segundo abastecimento (já que o 1º abastecimento estabeleceu a base de odômetro)
    cumulativeLiters += item.liters;
    const totalKmDrivenSoFar = item.odometer - firstOdometer;

    let consumptionKmL: number | undefined = undefined;
    let costPerKm: number | undefined = undefined;
    let runningAverageKmL: number | undefined = undefined;

    if (kmDriven > 0 && item.liters > 0) {
      consumptionKmL = kmDriven / item.liters;
      costPerKm = item.totalCost / kmDriven;
    }

    if (totalKmDrivenSoFar > 0 && cumulativeLiters > 0) {
      runningAverageKmL = totalKmDrivenSoFar / cumulativeLiters;
    }

    return {
      ...item,
      kmDriven,
      consumptionKmL,
      costPerKm,
      runningAverageKmL,
    };
  });
}

/**
 * Calcula as estatísticas acumuladas do veículo
 */
export function calculateStats(processedRefuelings: Refueling[]): ConsumptionStats {
  if (processedRefuelings.length === 0) {
    return {
      totalSpent: 0,
      totalLiters: 0,
      totalKmDriven: 0,
      averageKmL: 0,
      averageCostPerKm: 0,
      averagePricePerLiter: 0,
      lastOdometer: 0,
    };
  }

  const totalSpent = processedRefuelings.reduce((sum, r) => sum + r.totalCost, 0);
  const totalLiters = processedRefuelings.reduce((sum, r) => sum + r.liters, 0);

  // Ordenar por odômetro crescente
  const sorted = [...processedRefuelings].sort((a, b) => a.odometer - b.odometer);
  const firstOdometer = sorted[0].odometer;
  const lastOdometer = sorted[sorted.length - 1].odometer;
  const totalKmDriven = lastOdometer - firstOdometer;

  // Para o cálculo da média real de consumo, consideramos os litros colocados após o 1º registro de odômetro
  const litersSinceFirst = sorted.slice(1).reduce((sum, r) => sum + r.liters, 0);

  let averageKmL = 0;
  if (totalKmDriven > 0 && litersSinceFirst > 0) {
    averageKmL = totalKmDriven / litersSinceFirst;
  } else if (totalKmDriven > 0 && totalLiters > 0) {
    averageKmL = totalKmDriven / totalLiters;
  } else {
    const validItems = processedRefuelings.filter(r => r.consumptionKmL !== undefined && r.consumptionKmL > 0);
    if (validItems.length > 0) {
      averageKmL = validItems.reduce((sum, r) => sum + (r.consumptionKmL || 0), 0) / validItems.length;
    }
  }

  const averageCostPerKm = totalKmDriven > 0 ? totalSpent / totalKmDriven : 0;
  const averagePricePerLiter = totalLiters > 0 ? totalSpent / totalLiters : 0;

  return {
    totalSpent,
    totalLiters,
    totalKmDriven,
    averageKmL,
    averageCostPerKm,
    averagePricePerLiter,
    lastOdometer,
  };
}

/**
 * Análise de vantagem combustivel Flex (Etanol vs Gasolina)
 * @param priceEthanol Preço do Etanol por litro
 * @param priceGasoline Preço da Gasolina por litro
 * @param customRatio Proporção personalizada (padrão 0.70 ou 70%)
 */
export function calculateFlexAdvantage(priceEthanol: number, priceGasoline: number, customRatio = 0.70) {
  if (!priceEthanol || !priceGasoline || priceGasoline <= 0) {
    return { ratio: 0, recommended: 'indefenido', savingsPercent: 0 };
  }

  const ratio = priceEthanol / priceGasoline;
  const ratioPercent = ratio * 100;
  const isEthanolBetter = ratio <= customRatio;

  // Cálculo da economia estimada
  const savingsPercent = Math.abs(ratio - customRatio) * 100;

  return {
    ratio,
    ratioPercent,
    recommended: isEthanolBetter ? 'Etanol' : 'Gasolina',
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    thresholdPercent: customRatio * 100,
  };
}
