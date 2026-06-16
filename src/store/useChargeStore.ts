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
  StrategyType
} from '@/types';
import { mockPowerPool, mockZoneStats, mockDashboardAlerts, mockTeamOnDuty } from '@/data/mockDashboard';
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
  setActiveStrategy: (id: StrategyType) => void;
  handleAlert: (alertId: string) => void;
  addIntervention: (log: Omit<InterventionLog, 'id' | 'timestamp'>) => void;
  authorizePowerBoost: (pileId: string, managerId: string, managerName: string) => void;
  handleOccupancy: (pileId: string, operatorId: string, operatorName: string) => void;
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

  setActiveStrategy: (id) => {
    set({
      activeStrategyId: id,
      strategies: get().strategies.map(s => ({
        ...s,
        isActive: s.id === id
      }))
    });
    persistStrategy(id);
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
  }
}));
