
import { Vehicle } from '../types';

export interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  isAc: boolean;
  totalFare: number;
  extraKmCharges: number;
}

export const calculateMissionFare = (
  distanceKm: number,
  vehicle: Vehicle,
  isAc: boolean
): FareBreakdown => {
  if (!vehicle.tariff) {
    return { baseFare: 500, distanceKm, isAc, totalFare: 500, extraKmCharges: 0 };
  }

  const mode = isAc ? 'ac' : 'nonAc';
  const prices = vehicle.tariff[mode];
  const extraRate = vehicle.tariff.extraKm[mode];
  
  let totalFare = 0;
  let extraKmCharges = 0;

  if (distanceKm <= 10) totalFare = prices[0] || 0;
  else if (distanceKm <= 20) totalFare = prices[1] || 0;
  else if (distanceKm <= 30) totalFare = prices[2] || 0;
  else if (distanceKm <= 40) totalFare = prices[3] || 0;
  else if (distanceKm <= 50) totalFare = prices[4] || 0;
  else if (distanceKm <= 60) totalFare = prices[5] || 0;
  else if (distanceKm <= 70) totalFare = prices[6] || 0;
  else if (distanceKm <= 80) totalFare = prices[7] || 0;
  else if (distanceKm <= 90) totalFare = prices[8] || 0;
  else if (distanceKm <= 110) totalFare = prices[9] || 0;
  else if (distanceKm <= 130) totalFare = prices[10] || 0;
  else if (distanceKm <= 150) totalFare = prices[11] || 0;
  else {
    const base150 = prices[11] || 2500;
    const extraDistance = distanceKm - 150;
    extraKmCharges = Math.ceil(extraDistance * extraRate);
    totalFare = base150 + extraKmCharges;
  }

  return {
    baseFare: prices[0] || 0,
    distanceKm: Math.ceil(distanceKm),
    isAc,
    totalFare: Math.ceil(totalFare),
    extraKmCharges
  };
};
