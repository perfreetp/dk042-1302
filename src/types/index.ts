export type StrategyType = 'balanced' | 'highTurnover' | 'energySaving' | 'vipPriority';

export type PileStatus = 'charging' | 'idle' | 'occupied' | 'fault' | 'reserved';

export type VehicleType = 'fastCharge' | 'slowCharge' | 'vip' | 'accessible';

export type AlertLevel = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'powerOverload'
  | 'emptyOccupancy'
  | 'waitTimeout'
  | 'queueAbnormal'
  | 'powerDrop'
  | 'pileFault'
  | 'managerAuth';

export interface PowerPool {
  totalPower: number;
  usedPower: number;
  reservedPower: number;
  availablePower: number;
  usageRate: number;
  mallLoad: number;
  mallLoadThreshold: number;
}

export interface ZoneStat {
  zoneId: string;
  zoneName: string;
  totalPiles: number;
  chargingPiles: number;
  idlePiles: number;
  occupiedPiles: number;
  avgPower: number;
  turnoverRate: number;
  busynessLevel: number;
}

export interface ChargingPile {
  id: string;
  name: string;
  zoneId: string;
  status: PileStatus;
  currentPower: number;
  maxPower: number;
  vehicleType?: VehicleType;
  plateNumber?: string;
  startTime?: string;
  estimatedEnd?: string;
  chargedKwh?: number;
  isVip?: boolean;
  isAccessible?: boolean;
  occupancyDetected?: boolean;
}

export interface ChargeStrategy {
  id: StrategyType;
  name: string;
  description: string;
  isActive: boolean;
  singlePileMaxPower: number;
  vipReservedPower: number;
  accessibleReservedPower: number;
  fastChargePriority: number;
  autoDropLoad: boolean;
  dropLoadThreshold: number;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  timestamp: string;
  isHandled: boolean;
  zoneId?: string;
  pileId?: string;
  extra?: Record<string, any>;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'manager' | 'operator' | 'technician';
  isOnDuty: boolean;
  avatar?: string;
  phone?: string;
}

export interface InterventionLog {
  id: string;
  operatorId: string;
  operatorName: string;
  action: string;
  description: string;
  timestamp: string;
  zoneId?: string;
  pileId?: string;
}

export interface TurnoverStat {
  strategy: StrategyType;
  strategyName: string;
  avgTurnoverMinutes: number;
  dailyTurnoverCount: number;
  totalChargedKwh: number;
  date: string;
}

export interface DailySummary {
  date: string;
  totalChargedKwh: number;
  avgTurnoverMinutes: number;
  peakUsageRate: number;
  alertsCount: number;
  interventionsCount: number;
  highlightEvents: string[];
  suggestions: string[];
}
