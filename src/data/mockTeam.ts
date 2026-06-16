import type { TeamMember, InterventionLog, TurnoverStat, DailySummary } from '@/types';

export const mockTeamMembers: TeamMember[] = [
  { id: 'm1', name: '张经理', role: 'manager', isOnDuty: true, phone: '138****1234' },
  { id: 'm2', name: '李运维', role: 'operator', isOnDuty: true, phone: '139****5678' },
  { id: 'm3', name: '王技师', role: 'technician', isOnDuty: true, phone: '137****9012' },
  { id: 'm4', name: '赵运维', role: 'operator', isOnDuty: false, phone: '136****3456' },
  { id: 'm5', name: '陈经理', role: 'manager', isOnDuty: false, phone: '135****7890' }
];

export const mockInterventionLogs: InterventionLog[] = [
  {
    id: 'log_1',
    operatorId: 'm1',
    operatorName: '张经理',
    action: '切换策略',
    description: '将策略从「均衡模式」切换为「高周转模式」，应对影院散场高峰',
    timestamp: '2026-06-16T18:42:00',
    zoneId: 'D'
  },
  {
    id: 'log_2',
    operatorId: 'm2',
    operatorName: '李运维',
    action: '处置空占',
    description: '劝离B-12桩空占车辆（京N·88990），空占时长30分钟',
    timestamp: '2026-06-16T17:55:00',
    zoneId: 'B',
    pileId: 'B-12'
  },
  {
    id: 'log_3',
    operatorId: 'm1',
    operatorName: '张经理',
    action: '临时提功率',
    description: '为VIP客户C-01桩授权临时提升功率至110kW，有效期30分钟',
    timestamp: '2026-06-16T18:10:00',
    zoneId: 'C',
    pileId: 'C-01'
  },
  {
    id: 'log_4',
    operatorId: 'm3',
    operatorName: '王技师',
    action: '设备复位',
    description: 'B-05桩通信异常，现场断电重启后恢复正常',
    timestamp: '2026-06-16T18:25:00',
    zoneId: 'B',
    pileId: 'B-05'
  },
  {
    id: 'log_5',
    operatorId: 'm2',
    operatorName: '李运维',
    action: '引导车辆',
    description: 'D区排队引导，将3辆车分流至A区空闲桩位',
    timestamp: '2026-06-16T18:30:00',
    zoneId: 'D'
  },
  {
    id: 'log_6',
    operatorId: 'm1',
    operatorName: '张经理',
    action: '预留功率',
    description: '为无障碍E-02桩手动预留60kW最低功率保障',
    timestamp: '2026-06-16T16:00:00',
    zoneId: 'E',
    pileId: 'E-02'
  }
];

export const mockTurnoverStats: TurnoverStat[] = [
  { strategy: 'balanced', strategyName: '均衡模式', avgTurnoverMinutes: 45, dailyTurnoverCount: 185, totalChargedKwh: 7200, date: '2026-06-14' },
  { strategy: 'highTurnover', strategyName: '高周转模式', avgTurnoverMinutes: 32, dailyTurnoverCount: 268, totalChargedKwh: 8950, date: '2026-06-15' },
  { strategy: 'balanced', strategyName: '均衡模式', avgTurnoverMinutes: 42, dailyTurnoverCount: 195, totalChargedKwh: 7680, date: '2026-06-13' },
  { strategy: 'vipPriority', strategyName: 'VIP优先', avgTurnoverMinutes: 52, dailyTurnoverCount: 162, totalChargedKwh: 6800, date: '2026-06-12' },
  { strategy: 'energySaving', strategyName: '节能模式', avgTurnoverMinutes: 58, dailyTurnoverCount: 148, totalChargedKwh: 5420, date: '2026-06-11' }
];

export const mockDailySummary: DailySummary = {
  date: '2026-06-16（周日·影院散场日）',
  totalChargedKwh: 8652,
  avgTurnoverMinutes: 38,
  peakUsageRate: 92,
  alertsCount: 12,
  interventionsCount: 8,
  highlightEvents: [
    '18:30-19:30 影院散场高峰，D区最高排队7辆车，启用高周转策略后40分钟内消峰',
    'VIP区全天接待22车次，平均周转32分钟，客户满意度反馈良好',
    '自动压降系统触发2次，累计削减负荷180kW，有效规避商场限电风险'
  ],
  suggestions: [
    '周末散场日建议提前30分钟切换高周转模式，可进一步缩短排队时长',
    'B-05桩本月已发生3次通信异常，建议安排技术人员全面检修',
    'A区空占车位问题较突出，建议增配地锁或语音提醒装置'
  ]
};
