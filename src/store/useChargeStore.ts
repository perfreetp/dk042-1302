import { create } from 'zustand';
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
  authorizePowerBoost: (pileId: string, managerId: string) => void;
}

export const useChargeStore = create<ChargeState>((set, get) => ({
  powerPool: {
    totalPower: 2000,
    usedPower: 1560,
    reservedPower: 180,
    availablePower: 260,
    usageRate: 78,
    mallLoad: 8200,
    mallLoadThreshold: 9000
  },
  zones: [],
  piles: [],
  strategies: [],
  activeStrategyId: 'balanced',
  alerts: [],
  teamMembers: [],
  interventionLogs: [],
  turnoverStats: [],
  dailySummary: {
    date: '2026-06-16',
    totalChargedKwh: 0,
    avgTurnoverMinutes: 0,
    peakUsageRate: 0,
    alertsCount: 0,
    interventionsCount: 0,
    highlightEvents: [],
    suggestions: []
  },
  setActiveStrategy: (id) => {
    set({ activeStrategyId: id });
    const strategies = get().strategies.map(s => ({
      ...s,
      isActive: s.id === id
    }));
    set({ strategies });
    console.log('[Strategy] 切换策略为:', id);
  },
  handleAlert: (alertId) => {
    const alerts = get().alerts.map(a =>
      a.id === alertId ? { ...a, isHandled: true } : a
    );
    set({ alerts });
    console.log('[Alert] 处理告警:', alertId);
  },
  addIntervention: (log) => {
    const newLog: InterventionLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    set({ interventionLogs: [newLog, ...get().interventionLogs] });
    console.log('[Intervention] 记录干预:', newLog);
  },
  authorizePowerBoost: (pileId, managerId) => {
    const piles = get().piles.map(p =>
      p.id === pileId ? { ...p, currentPower: Math.min(p.currentPower * 1.5, p.maxPower) } : p
    );
    set({ piles });
    get().addIntervention({
      operatorId: managerId,
      operatorName: '值班经理',
      action: '临时提功率',
      description: `为桩 ${pileId} 授权临时提升功率`,
      pileId
    });
    console.log('[Auth] 授权提功率:', pileId, '经理:', managerId);
  }
}));
