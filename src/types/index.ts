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
  extra?: {
    isBatch?: boolean;
    alertCount?: number;
    fromStrategy?: StrategyType;
    toStrategy?: StrategyType;
  };
}

export interface StrategyChangeLog {
  id: string;
  operatorId: string;
  operatorName: string;
  fromStrategy: StrategyType;
  fromStrategyName: string;
  toStrategy: StrategyType;
  toStrategyName: string;
  timestamp: string;
  affectedZones: string[];
  parameterChanges: {
    vipReservedPower: { from: number; to: number };
    accessibleReservedPower: { from: number; to: number };
    singlePileMaxPower: { from: number; to: number };
    fastChargePriority: { from: number; to: number };
  };
  trigger: 'manual' | 'alert' | 'schedule' | 'batch';
  triggerAlertIds?: string[];
}

export interface StrategyPreview {
  fromStrategy: ChargeStrategy;
  toStrategy: ChargeStrategy;
  affectedZones: string[];
  estimatedPowerChange: {
    totalReservedChange: number;
    avgPilePowerChange: number;
    fastChargeBoost: number;
    slowChargeReduction: number;
  };
  affectedPilesCount: {
    vipPiles: number;
    accessiblePiles: number;
    fastChargePiles: number;
    slowChargePiles: number;
  };
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
