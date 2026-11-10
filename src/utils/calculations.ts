import { Refueling, ConsumptionStats, Vehicle } from '../types/fuel';

/**
 * Recalcula a quilometragem percorrida e o consumo Km/L para uma lista de abastecimentos ordenados por odômetro asc.
 * Considera o nível do marcador de combustível (pontos no odômetro/painel) e a capacidade do tanque para cálculo exato,
 * inclusive em abastecimentos parciais!
 */
export function processRefuelings(refuelings: Refueling[], vehicle?: Vehicle): Refueling[] {
  // Ordenar por odômetro crescente para cálculos de sequência
  const sorted = [...refuelings].sort((a, b) => a.odometer - b.odometer);
  const firstOdometer = sorted.length > 0 ? sorted[0].odometer : 0;

  const tankCapacity = vehicle?.tankCapacityLiters || 53;
  const gaugePoints = vehicle?.fuelGaugePoints || 14;
  const litersPerPoint = tankCapacity / gaugePoints;

  let cumulativeLiters = 0;

  return sorted.map((item, index) => {
    // Calcular estimativas em litros a partir dos pontos do marcador
    const estimatedLitersBefore = item.tankLevelPointsBefore !== undefined
      ? Math.round(item.tankLevelPointsBefore * litersPerPoint * 10) / 10
      : item.estimatedLitersBefore;

    let estimatedLitersAfter = item.tankLevelPointsAfter !== undefined
      ? Math.round(item.tankLevelPointsAfter * litersPerPoint * 10) / 10
      : item.estimatedLitersAfter;

    if (item.isFullTank) {
      estimatedLitersAfter = tankCapacity;
    } else if (estimatedLitersAfter === undefined && estimatedLitersBefore !== undefined) {
      estimatedLitersAfter = Math.min(tankCapacity, Math.round((estimatedLitersBefore + item.liters) * 10) / 10);
    }

    if (index === 0) {
      return {
        ...item,
        estimatedLitersBefore,
        estimatedLitersAfter,
        kmDriven: undefined,
        consumedLiters: undefined,
        consumptionKmL: undefined,
        costPerKm: undefined,
        runningAverageKmL: undefined,
      };
    }

    const prev = sorted[index - 1];
    const kmDriven = item.odometer - prev.odometer;

    // Determinar litros no tanque ao final do abastecimento anterior
    let prevEndLiters: number | undefined = undefined;
    if (prev.isFullTank) {
      prevEndLiters = tankCapacity;
    } else if (prev.tankLevelPointsAfter !== undefined) {
      prevEndLiters = prev.tankLevelPointsAfter * litersPerPoint;
    } else if (prev.tankLevelPointsBefore !== undefined) {
      prevEndLiters = Math.min(tankCapacity, (prev.tankLevelPointsBefore * litersPerPoint) + prev.liters);
    }

    // Determinar litros no tanque no início do abastecimento atual (ao chegar para abastecer)
    let currentStartLiters: number | undefined = undefined;
    if (item.tankLevelPointsBefore !== undefined) {
      currentStartLiters = item.tankLevelPointsBefore * litersPerPoint;
    }

    let consumedLiters: number;
    const isBothFullTank = Boolean(prev.isFullTank && item.isFullTank);

    if (isBothFullTank) {
      // Regra clássica tanque cheio: o que foi colocado repõe exatamente o gasto do trecho
      consumedLiters = item.liters;
    } else if (prevEndLiters !== undefined && currentStartLiters !== undefined && prevEndLiters > currentStartLiters) {
      // Método dos pontos do mostrador:
      // O combustível queimado é a diferença exata entre o combustível anterior e o nível de chegada
      consumedLiters = Math.round((prevEndLiters - currentStartLiters) * 100) / 100;
    } else {
      // Abastecimento parcial tradicional (combustível colocado no início do trecho)
      consumedLiters = prev.liters;
    }

    // Litros acumulados consumidos até este ponto para a média acumulada
    cumulativeLiters += consumedLiters;
    const totalKmDrivenSoFar = item.odometer - firstOdometer;

    let consumptionKmL: number | undefined = undefined;
    let costPerKm: number | undefined = undefined;
    let runningAverageKmL: number | undefined = undefined;

    if (kmDriven > 0 && consumedLiters > 0) {
      consumptionKmL = kmDriven / consumedLiters;
      const trechoCost = isBothFullTank ? item.totalCost : (item.pricePerLiter * consumedLiters);
      costPerKm = trechoCost / kmDriven;
    }

    if (totalKmDrivenSoFar > 0 && cumulativeLiters > 0) {
      runningAverageKmL = totalKmDrivenSoFar / cumulativeLiters;
    }

    return {
      ...item,
      estimatedLitersBefore,
      estimatedLitersAfter,
      kmDriven,
      consumedLiters,
      consumptionKmL,
      costPerKm,
      runningAverageKmL,
    };
  });
}

/**
 * Calcula as estatísticas acumuladas do veículo
 */
export function calculateStats(processedRefuelings: Refueling[], vehicle?: Vehicle): ConsumptionStats {
  if (processedRefuelings.length === 0) {
    const initOdo = vehicle?.initialOdometer || 0;
    const currOdo = vehicle?.currentOdometer || 0;
    const km = currOdo > initOdo ? currOdo - initOdo : 0;
    return {
      totalSpent: 0,
      totalLiters: 0,
      totalKmDriven: km,
      averageKmL: 0,
      averageCostPerKm: 0,
      averagePricePerLiter: 0,
      lastOdometer: currOdo,
    };
  }

  const totalSpent = processedRefuelings.reduce((sum, r) => sum + r.totalCost, 0);
  const totalLiters = processedRefuelings.reduce((sum, r) => sum + r.liters, 0);

  // Ordenar por odômetro crescente
  const sorted = [...processedRefuelings].sort((a, b) => a.odometer - b.odometer);
  
  // Se o veículo tiver initialOdometer definido pelo usuário, usamos como início exato do controle,
  // caso contrário usamos o 1º abastecimento.
  const firstOdometer = (vehicle?.initialOdometer !== undefined && vehicle.initialOdometer > 0)
    ? vehicle.initialOdometer
    : (sorted.length > 0 ? sorted[0].odometer : 0);

  // Odômetro mais recente (o definido no veículo pelo usuário, ou o último abastecimento)
  const lastOdometer = (vehicle?.currentOdometer !== undefined && vehicle.currentOdometer > 0)
    ? vehicle.currentOdometer
    : (sorted.length > 0 ? sorted[sorted.length - 1].odometer : 0);

  const totalKmDriven = Math.max(0, lastOdometer - firstOdometer);

  // Para o cálculo da média real de consumo entre abastecimentos:
  const refuelKm = sorted[sorted.length - 1].odometer - sorted[0].odometer;

  // Se todos os abastecimentos foram tanque cheio, usamos a reposição a partir do 2º;
  // Se forem parciais (método de combustível que impulsionou cada trecho percorrido),
  // somamos os litros colocados no início de cada trecho concluído (todos exceto o último,
  // pois o último acabou de entrar no tanque para o trecho futuro).
  const allFullTank = sorted.length > 1 && sorted.every((r) => r.isFullTank);
  const consumedLitersTotal = allFullTank
    ? sorted.slice(1).reduce((sum, r) => sum + r.liters, 0)
    : (sorted.length > 1 ? sorted.slice(0, -1).reduce((sum, r) => sum + r.liters, 0) : totalLiters);

  // Média de consumo ponderada pelos trechos reais calculados
  const legsWithConsumption = processedRefuelings.filter(
    (r) => r.kmDriven !== undefined && r.kmDriven > 0 && r.consumedLiters !== undefined && r.consumedLiters > 0
  );

  let averageKmL = 0;
  if (legsWithConsumption.length > 0) {
    const totalKmLegs = legsWithConsumption.reduce((sum, r) => sum + (r.kmDriven || 0), 0);
    const totalLitersLegs = legsWithConsumption.reduce((sum, r) => sum + (r.consumedLiters || 0), 0);
    if (totalKmLegs > 0 && totalLitersLegs > 0) {
      averageKmL = totalKmLegs / totalLitersLegs;
    }
  } else if (refuelKm > 0 && consumedLitersTotal > 0) {
    averageKmL = refuelKm / consumedLitersTotal;
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

/**
 * Converte com precisão uma string de data (ex: '2026-10-14' ou ISO) para exibição em pt-BR (ex: '14/10/2026')
 * evitando o bug clássico de timezone em que '2026-10-14' (UTC) virava '13/10' no fuso do Brasil (UTC-3).
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (day && month && year) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

/**
 * Retorna no formato curto dia/mês (ex: '14/10') sem alteração de fuso horário
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [, month, day] = parts;
    if (day && month) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;
    }
  }
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/**
 * Converte data string para timestamp de ordenação sem desvio de fuso horário
 */
export function getDateTimestamp(dateStr: string): number {
  if (!dateStr) return 0;
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    return new Date(y, m - 1, d, 12, 0, 0).getTime();
  }
  return new Date(dateStr).getTime();
}
