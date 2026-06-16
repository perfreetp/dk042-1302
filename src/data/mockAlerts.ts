import type { AlertItem } from '@/types';

export const mockAlerts: AlertItem[] = [
  {
    id: 'alert_1',
    type: 'powerOverload',
    level: 'critical',
    title: '商场总负荷即将超限',
    description: '当前总负荷8920kW，阈值9000kW，预计5分钟后触发自动压降。建议立即切换节能模式或协调商业降低负荷。',
    timestamp: '2026-06-16T18:45:00',
    isHandled: false,
    extra: { currentLoad: 8920, threshold: 9000 }
  },
  {
    id: 'alert_2',
    type: 'emptyOccupancy',
    level: 'warning',
    title: 'A-05 空占车位超过20分钟',
    description: '车牌号京D·22222已于18:15插枪，但未开始充电。请现场人员确认车主是否需要协助或劝离。',
    timestamp: '2026-06-16T18:38:00',
    isHandled: false,
    zoneId: 'A',
    pileId: 'A-05',
    extra: { plateNumber: '京D·22222', durationMin: 20 }
  },
  {
    id: 'alert_3',
    type: 'waitTimeout',
    level: 'warning',
    title: 'D区排队等待超时',
    description: 'D区有3辆车等待超过15分钟，最长等待22分钟。建议启用高周转策略加速车辆流转。',
    timestamp: '2026-06-16T18:35:00',
    isHandled: false,
    zoneId: 'D',
    extra: { waitingCount: 3, maxWaitMin: 22 }
  },
  {
    id: 'alert_4',
    type: 'queueAbnormal',
    level: 'warning',
    title: 'D区排队异常增长',
    description: 'D区排队车辆从2辆增至7辆，10分钟内增长250%，疑似影院散场客流集中到达。',
    timestamp: '2026-06-16T18:30:00',
    isHandled: true,
    zoneId: 'D'
  },
  {
    id: 'alert_5',
    type: 'powerDrop',
    level: 'info',
    title: 'B区自动压降完成',
    description: '因商场负荷上升，B区3台慢充桩功率从60kW降至40kW，预计减少负荷60kW。',
    timestamp: '2026-06-16T18:20:00',
    isHandled: true,
    zoneId: 'B',
    extra: { pilesAffected: 3, reducedPower: 60 }
  },
  {
    id: 'alert_6',
    type: 'pileFault',
    level: 'warning',
    title: 'B-05 桩通信异常',
    description: 'B区05号桩已离线5分钟，请现场人员检查设备状态或派工维修。',
    timestamp: '2026-06-16T18:15:00',
    isHandled: true,
    zoneId: 'B',
    pileId: 'B-05'
  },
  {
    id: 'alert_7',
    type: 'managerAuth',
    level: 'info',
    title: '值班经理授权临时提功率',
    description: '张经理为VIP区C-01桩授权临时提升功率至110kW，有效期30分钟。',
    timestamp: '2026-06-16T18:10:00',
    isHandled: true,
    zoneId: 'C',
    pileId: 'C-01',
    extra: { manager: '张经理', boostedPower: 110 }
  },
  {
    id: 'alert_8',
    type: 'emptyOccupancy',
    level: 'info',
    title: 'B-12 空占车位处置完成',
    description: '车牌号京N·88990空占30分钟，已由现场人员劝离，车位已释放。',
    timestamp: '2026-06-16T17:55:00',
    isHandled: true,
    zoneId: 'B',
    pileId: 'B-12'
  }
];

export const alertTypeLabels: Record<string, string> = {
  powerOverload: '负荷超限',
  emptyOccupancy: '空占车位',
  waitTimeout: '等待超时',
  queueAbnormal: '排队异常',
  powerDrop: '功率压降',
  pileFault: '桩体故障',
  managerAuth: '经理授权'
};

export const alertLevelColors: Record<string, string> = {
  critical: '#F53F3F',
  warning: '#FF7D00',
  info: '#1677FF'
};
