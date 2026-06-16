import type { ChargeStrategy, StrategyType } from '@/types';

export const mockStrategies: ChargeStrategy[] = [
  {
    id: 'balanced',
    name: '均衡模式',
    description: '功率按需分配，兼顾快充与慢充，适用于平峰时段',
    isActive: true,
    singlePileMaxPower: 120,
    vipReservedPower: 120,
    accessibleReservedPower: 60,
    fastChargePriority: 1,
    autoDropLoad: true,
    dropLoadThreshold: 85
  },
  {
    id: 'highTurnover',
    name: '高周转模式',
    description: '优先保障短停快补车辆，限制长停慢充功率，适用于活动散场、节假日高峰',
    isActive: false,
    singlePileMaxPower: 120,
    vipReservedPower: 100,
    accessibleReservedPower: 60,
    fastChargePriority: 3,
    autoDropLoad: true,
    dropLoadThreshold: 75
  },
  {
    id: 'energySaving',
    name: '节能模式',
    description: '降低全站功率上限，主动压降负荷，适用于商场用电紧张时段',
    isActive: false,
    singlePileMaxPower: 80,
    vipReservedPower: 80,
    accessibleReservedPower: 40,
    fastChargePriority: 1,
    autoDropLoad: true,
    dropLoadThreshold: 60
  },
  {
    id: 'vipPriority',
    name: 'VIP优先模式',
    description: 'VIP区和无障碍车位优先保障功率，适用于重要接待日',
    isActive: false,
    singlePileMaxPower: 120,
    vipReservedPower: 240,
    accessibleReservedPower: 120,
    fastChargePriority: 2,
    autoDropLoad: true,
    dropLoadThreshold: 80
  }
];

export const strategyIconMap: Record<StrategyType, string> = {
  balanced: '⚖️',
  highTurnover: '⚡',
  energySaving: '🌱',
  vipPriority: '👑'
};

export const strategyColorMap: Record<StrategyType, string> = {
  balanced: '#1677FF',
  highTurnover: '#FF7D00',
  energySaving: '#00B42A',
  vipPriority: '#7B61FF'
};
