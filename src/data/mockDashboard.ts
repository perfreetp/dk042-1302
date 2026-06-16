import type { PowerPool, ZoneStat, AlertItem, TeamMember } from '@/types';

export const mockPowerPool: PowerPool = {
  totalPower: 2000,
  usedPower: 1560,
  reservedPower: 180,
  availablePower: 260,
  usageRate: 78,
  mallLoad: 8200,
  mallLoadThreshold: 9000
};

export const mockZoneStats: ZoneStat[] = [
  {
    zoneId: 'A',
    zoneName: 'A区·东门入口',
    totalPiles: 20,
    chargingPiles: 16,
    idlePiles: 2,
    occupiedPiles: 2,
    avgPower: 78,
    turnoverRate: 4.2,
    busynessLevel: 92
  },
  {
    zoneId: 'B',
    zoneName: 'B区·主力店',
    totalPiles: 24,
    chargingPiles: 20,
    idlePiles: 3,
    occupiedPiles: 1,
    avgPower: 72,
    turnoverRate: 3.1,
    busynessLevel: 85
  },
  {
    zoneId: 'C',
    zoneName: 'C区·VIP专享',
    totalPiles: 10,
    chargingPiles: 6,
    idlePiles: 3,
    occupiedPiles: 1,
    avgPower: 95,
    turnoverRate: 2.0,
    busynessLevel: 60
  },
  {
    zoneId: 'D',
    zoneName: 'D区·影院散场',
    totalPiles: 18,
    chargingPiles: 15,
    idlePiles: 2,
    occupiedPiles: 1,
    avgPower: 68,
    turnoverRate: 5.8,
    busynessLevel: 88
  },
  {
    zoneId: 'E',
    zoneName: 'E区·无障碍',
    totalPiles: 6,
    chargingPiles: 3,
    idlePiles: 3,
    occupiedPiles: 0,
    avgPower: 60,
    turnoverRate: 2.5,
    busynessLevel: 50
  }
];

export const mockDashboardAlerts: AlertItem[] = [
  {
    id: 'a1',
    type: 'powerOverload',
    level: 'warning',
    title: 'D区负荷接近上限',
    description: '影院散场高峰，D区功率占用88%，建议切换高周转策略',
    timestamp: '2026-06-16T18:42:00',
    isHandled: false
  },
  {
    id: 'a2',
    type: 'emptyOccupancy',
    level: 'info',
    title: '发现2个空占车位',
    description: 'A区A-05、B区B-12已插枪未充电超过15分钟',
    timestamp: '2026-06-16T18:38:00',
    isHandled: false
  },
  {
    id: 'a3',
    type: 'waitTimeout',
    level: 'warning',
    title: '排队等待超时',
    description: 'D区有3辆车等待超过12分钟',
    timestamp: '2026-06-16T18:35:00',
    isHandled: false
  }
];

export const mockTeamOnDuty: TeamMember[] = [
  { id: 'm1', name: '张经理', role: 'manager', isOnDuty: true, phone: '138****1234' },
  { id: 'm2', name: '李运维', role: 'operator', isOnDuty: true, phone: '139****5678' },
  { id: 'm3', name: '王技师', role: 'technician', isOnDuty: true, phone: '137****9012' },
  { id: 'm4', name: '赵运维', role: 'operator', isOnDuty: false, phone: '136****3456' }
];

export const mockCoreStats = [
  { label: '今日充电量', value: '8,652', unit: 'kWh', trend: '+12%', trendUp: true },
  { label: '平均周转', value: '38', unit: '分钟', trend: '-6%', trendUp: true },
  { label: '今日翻台', value: '228', unit: '次', trend: '+18%', trendUp: true },
  { label: '空占处置率', value: '94', unit: '%', trend: '+3%', trendUp: true }
];
