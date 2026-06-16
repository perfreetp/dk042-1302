import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  PowerPool,
  ZoneStat,
  ChargingPile,
  ChargeStrategy,
  AlertItem,
  TeamMember,
  InterventionLog,
  TurnoverStat,
  DailySummary,
  StrategyType,
  StrategyChangeLog,
  StrategyPreview
} from '@/types';
import { mockPowerPool, mockZoneStats, mockTeamOnDuty } from '@/data/mockDashboard';
import { mockPiles } from '@/data/mockHeatmap';
import { mockStrategies } from '@/data/mockStrategy';
import { mockAlerts } from '@/data/mockAlerts';
import { mockTeamMembers, mockInterventionLogs, mockTurnoverStats, mockDailySummary } from '@/data/mockTeam';

const STRATEGY_STORAGE_KEY = 'charge_active_strategy';

function getPersistedStrategy(): StrategyType {
  try {
    const saved = Taro.getStorageSync(STRATEGY_STORAGE_KEY);
    if (saved && ['balanced', 'highTurnover', 'energySaving', 'vipPriority'].includes(saved)) {
      return saved as StrategyType;
    }
  } catch {}
  return 'balanced';
}

function persistStrategy(id: StrategyType) {
  try {
    Taro.setStorageSync(STRATEGY_STORAGE_KEY, id);
  } catch {}
}

const initialStrategy = getPersistedStrategy();

const initialStrategies = mockStrategies.map(s => ({
  ...s,
  isActive: s.id === initialStrategy
}));

function calculatePilePower(pile: ChargingPile, strategy: ChargeStrategy): number {
  if (pile.status !== 'charging') return pile.currentPower;
  if (pile.isVip || pile.vehicleType === 'vip') {
    return Math.min(pile.currentPower, strategy.vipReservedPower);
  }
  if (pile.isAccessible || pile.vehicleType === 'accessible') {
    return Math.min(pile.currentPower, strategy.accessibleReservedPower);
  }
  if (pile.vehicleType === 'fastCharge') {
    const boostFactor = 1 + (strategy.fastChargePriority - 1) * 0.25;
    return Math.min(Math.round(pile.currentPower * boostFactor), strategy.singlePileMaxPower);
  }
  if (pile.vehicleType === 'slowCharge') {
    const slowFactor = strategy.id === 'energySaving' ? 0.6 : 1;
    return Math.min(Math.round(pile.currentPower * slowFactor), strategy.singlePileMaxPower);
  }
  return Math.min(pile.currentPower, strategy.singlePileMaxPower);
}

interface ChargeState {
  powerPool: PowerPool;
  zones: ZoneStat[];
  piles: ChargingPile[];
  strategies: ChargeStrategy[];
  activeStrategyId: StrategyType;
  alerts: AlertItem[];
  teamMembers: TeamMember[];
  interventionLogs: InterventionLog[];
  turnoverStats: TurnoverStat[];
  dailySummary: DailySummary;
  strategyChangeLogs: StrategyChangeLog[];
  getPileDisplayPower: (pile: ChargingPile) => number;
  previewStrategyChange: (toStrategyId: StrategyType) => StrategyPreview | null;
  setActiveStrategy: (id: StrategyType, operatorId?: string, operatorName?: string, trigger?: StrategyChangeLog['trigger'], alertIds?: string[]) => void;
  handleAlert: (alertId: string) => void;
  addIntervention: (log: Omit<InterventionLog, 'id' | 'timestamp'>) => void;
  authorizePowerBoost: (pileId: string, managerId: string, managerName: string) => void;
  handleOccupancy: (pileId: string, operatorId: string, operatorName: string) => void;
  batchHandleAlertsAndSwitch: (alertIds: string[], toStrategy: StrategyType, operatorId: string, operatorName: string) => void;
}

export const useChargeStore = create<ChargeState>((set, get) => ({
  powerPool: mockPowerPool,
  zones: mockZoneStats,
  piles: [...mockPiles],
  strategies: initialStrategies,
  activeStrategyId: initialStrategy,
  alerts: [...mockAlerts],
  teamMembers: mockTeamMembers,
  interventionLogs: [...mockInterventionLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ),
  turnoverStats: mockTurnoverStats,
  dailySummary: mockDailySummary,
  strategyChangeLogs: [],

  getPileDisplayPower: (pile) => {
    const state = get();
    const strategy = state.strategies.find(s => s.id === state.activeStrategyId);
    if (!strategy) return pile.currentPower;
    return calculatePilePower(pile, strategy);
  },

  previewStrategyChange: (toStrategyId) => {
    const state = get();
    const fromStrategy = state.strategies.find(s => s.id === state.activeStrategyId);
    const toStrategy = state.strategies.find(s => s.id === toStrategyId);
    if (!fromStrategy || !toStrategy || fromStrategy.id === toStrategy.id) return null;

    const affectedZoneIds = new Set<string>();
    let vipCount = 0, accessibleCount = 0, fastCount = 0, slowCount = 0;

    state.piles.forEach(pile => {
      if (pile.status !== 'charging') return;
      const currentPower = calculatePilePower(pile, fromStrategy);
      const newPower = calculatePilePower(pile, toStrategy);
      if (currentPower !== newPower) {
        affectedZoneIds.add(pile.zoneId);
        if (pile.isVip || pile.vehicleType === 'vip') vipCount++;
        else if (pile.isAccessible || pile.vehicleType === 'accessible') accessibleCount++;
        else if (pile.vehicleType === 'fastCharge') fastCount++;
        else if (pile.vehicleType === 'slowCharge') slowCount++;
      }
    });

    const affectedZones = state.zones
      .filter(z => affectedZoneIds.has(z.zoneId))
      .map(z => z.zoneId);

    return {
      fromStrategy,
      toStrategy,
      affectedZones,
      estimatedPowerChange: {
        totalReservedChange: (toStrategy.vipReservedPower + toStrategy.accessibleReservedPower) - (fromStrategy.vipReservedPower + fromStrategy.accessibleReservedPower),
        avgPilePowerChange: Math.round(((toStrategy.singlePileMaxPower / fromStrategy.singlePileMaxPower) - 1) * 100),
        fastChargeBoost: (toStrategy.fastChargePriority - fromStrategy.fastChargePriority) * 25,
        slowChargeReduction: toStrategy.id === 'energySaving' ? 40 : 0
      },
      affectedPilesCount: {
        vipPiles: vipCount,
        accessiblePiles: accessibleCount,
        fastChargePiles: fastCount,
        slowChargePiles: slowCount
      }
    };
  },

  setActiveStrategy: (id, operatorId = 'm1', operatorName = '张经理', trigger = 'manual', alertIds) => {
    const state = get();
    if (state.activeStrategyId === id) return;

    const fromStrategy = state.strategies.find(s => s.id === state.activeStrategyId);
    const toStrategy = state.strategies.find(s => s.id === id);
    if (!fromStrategy || !toStrategy) return;

    set({
      activeStrategyId: id,
      strategies: state.strategies.map(s => ({
        ...s,
        isActive: s.id === id
      }))
    });
    persistStrategy(id);

    const affectedZoneIds = new Set<string>();
    state.piles.forEach(pile => {
      if (pile.status !== 'charging') return;
      const currentPower = calculatePilePower(pile, fromStrategy);
      const newPower = calculatePilePower(pile, toStrategy);
      if (currentPower !== newPower) {
        affectedZoneIds.add(pile.zoneId);
      }
    });
    const affectedZones = state.zones
      .filter(z => affectedZoneIds.has(z.zoneId))
      .map(z => z.zoneId);

    const changeLog: StrategyChangeLog = {
      id: `strategy_${Date.now()}`,
      operatorId,
      operatorName,
      fromStrategy: fromStrategy.id,
      fromStrategyName: fromStrategy.name,
      toStrategy: toStrategy.id,
      toStrategyName: toStrategy.name,
      timestamp: new Date().toISOString(),
      affectedZones,
      parameterChanges: {
        vipReservedPower: { from: fromStrategy.vipReservedPower, to: toStrategy.vipReservedPower },
        accessibleReservedPower: { from: fromStrategy.accessibleReservedPower, to: toStrategy.accessibleReservedPower },
        singlePileMaxPower: { from: fromStrategy.singlePileMaxPower, to: toStrategy.singlePileMaxPower },
        fastChargePriority: { from: fromStrategy.fastChargePriority, to: toStrategy.fastChargePriority }
      },
      trigger,
      triggerAlertIds: alertIds
    };

    set({
      strategyChangeLogs: [changeLog, ...state.strategyChangeLogs]
    });

    state.addIntervention({
      operatorId,
      operatorName,
      action: '切换策略',
      description: `从「${fromStrategy.name}」切换至「${toStrategy.name}」，影响${affectedZones.length}个区域`,
      zoneId: affectedZones[0],
      extra: {
        fromStrategy: fromStrategy.id,
        toStrategy: toStrategy.id,
        isBatch: alertIds && alertIds.length > 1,
        alertCount: alertIds?.length
      }
    });

    console.log('[Strategy] 切换:', fromStrategy.name, '→', toStrategy.name, '影响区域:', affectedZones);
  },

  handleAlert: (alertId) => {
    set({
      alerts: get().alerts.map(a =>
        a.id === alertId ? { ...a, isHandled: true } : a
      )
    });
  },

  addIntervention: (log) => {
    const newLog: InterventionLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    set({
      interventionLogs: [newLog, ...get().interventionLogs]
    });
  },

  authorizePowerBoost: (pileId, managerId, managerName) => {
    const pile = get().piles.find(p => p.id === pileId);
    if (!pile) return;
    const boostedPower = Math.min(Math.round(pile.currentPower * 1.5), pile.maxPower);
    set({
      piles: get().piles.map(p =>
        p.id === pileId ? { ...p, currentPower: boostedPower } : p
      )
    });
    get().addIntervention({
      operatorId: managerId,
      operatorName: managerName,
      action: '临时提功率',
      description: `为${pile.name}(${pileId})授权提升功率至${boostedPower}kW`,
      pileId,
      zoneId: pile.zoneId
    });
  },

  handleOccupancy: (pileId, operatorId, operatorName) => {
    const pile = get().piles.find(p => p.id === pileId);
    if (!pile) return;
    set({
      piles: get().piles.map(p =>
        p.id === pileId
          ? { ...p, status: 'idle' as const, occupancyDetected: false, plateNumber: undefined, startTime: undefined, currentPower: 0 }
          : p
      ),
      alerts: get().alerts.map(a =>
        a.pileId === pileId ? { ...a, isHandled: true } : a
      )
    });
    get().addIntervention({
      operatorId,
      operatorName,
      action: '处置空占',
      description: `处置${pile.name}(${pileId})空占车辆，已通知现场人员`,
      pileId,
      zoneId: pile.zoneId
    });
  },

  batchHandleAlertsAndSwitch: (alertIds, toStrategy, operatorId, operatorName) => {
    if (alertIds.length === 0) return;
    const state = get();

    set({
      alerts: state.alerts.map(a =>
        alertIds.includes(a.id) ? { ...a, isHandled: true } : a
      )
    });

    state.setActiveStrategy(toStrategy, operatorId, operatorName, 'batch', alertIds);

    state.addIntervention({
      operatorId,
      operatorName,
      action: '批量处理告警',
      description: `批量处理${alertIds.length}条告警，并切换至高周转策略`,
      extra: {
        isBatch: true,
        alertCount: alertIds.length,
        fromStrategy: state.activeStrategyId,
        toStrategy
      }
    });

    console.log('[Batch] 处理', alertIds.length, '条告警，切换策略:', toStrategy);
  }
}));
