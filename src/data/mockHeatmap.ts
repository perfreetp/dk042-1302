import type { ChargingPile } from '@/types';

export const mockPiles: ChargingPile[] = [
  { id: 'A-01', name: 'A区01号桩', zoneId: 'A', status: 'charging', currentPower: 85, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京A·12345', startTime: '18:30', estimatedEnd: '18:55', chargedKwh: 12.5 },
  { id: 'A-02', name: 'A区02号桩', zoneId: 'A', status: 'charging', currentPower: 60, maxPower: 120, vehicleType: 'slowCharge', plateNumber: '京B·67890', startTime: '17:10', estimatedEnd: '20:30', chargedKwh: 45.2 },
  { id: 'A-03', name: 'A区03号桩', zoneId: 'A', status: 'charging', currentPower: 90, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京C·11111', startTime: '18:35', estimatedEnd: '19:00', chargedKwh: 8.3 },
  { id: 'A-04', name: 'A区04号桩', zoneId: 'A', status: 'idle', currentPower: 0, maxPower: 120 },
  { id: 'A-05', name: 'A区05号桩', zoneId: 'A', status: 'occupied', currentPower: 0, maxPower: 120, occupancyDetected: true, plateNumber: '京D·22222', startTime: '18:15' },
  { id: 'A-06', name: 'A区06号桩', zoneId: 'A', status: 'charging', currentPower: 72, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京E·33333', startTime: '18:20', estimatedEnd: '18:50', chargedKwh: 15.8 },
  { id: 'B-01', name: 'B区01号桩', zoneId: 'B', status: 'charging', currentPower: 55, maxPower: 120, vehicleType: 'slowCharge', plateNumber: '京F·44444', startTime: '16:00', estimatedEnd: '21:00', chargedKwh: 78.5 },
  { id: 'B-02', name: 'B区02号桩', zoneId: 'B', status: 'charging', currentPower: 88, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京G·55555', startTime: '18:40', estimatedEnd: '19:05', chargedKwh: 5.2 },
  { id: 'B-03', name: 'B区03号桩', zoneId: 'B', status: 'idle', currentPower: 0, maxPower: 120 },
  { id: 'B-04', name: 'B区04号桩', zoneId: 'B', status: 'charging', currentPower: 95, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京H·66666', startTime: '18:38', estimatedEnd: '19:02', chargedKwh: 6.1 },
  { id: 'B-05', name: 'B区05号桩', zoneId: 'B', status: 'fault', currentPower: 0, maxPower: 120 },
  { id: 'C-01', name: 'C区VIP01', zoneId: 'C', status: 'charging', currentPower: 110, maxPower: 120, vehicleType: 'vip', plateNumber: '京V·88888', isVip: true, startTime: '18:25', estimatedEnd: '18:50', chargedKwh: 18.6 },
  { id: 'C-02', name: 'C区VIP02', zoneId: 'C', status: 'reserved', currentPower: 0, maxPower: 120, isVip: true },
  { id: 'C-03', name: 'C区VIP03', zoneId: 'C', status: 'idle', currentPower: 0, maxPower: 120, isVip: true },
  { id: 'D-01', name: 'D区01号桩', zoneId: 'D', status: 'charging', currentPower: 92, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京I·77777', startTime: '18:42', estimatedEnd: '19:08', chargedKwh: 4.5 },
  { id: 'D-02', name: 'D区02号桩', zoneId: 'D', status: 'charging', currentPower: 88, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京J·88888', startTime: '18:40', estimatedEnd: '19:05', chargedKwh: 5.8 },
  { id: 'D-03', name: 'D区03号桩', zoneId: 'D', status: 'charging', currentPower: 75, maxPower: 120, vehicleType: 'fastCharge', plateNumber: '京K·99999', startTime: '18:32', estimatedEnd: '18:58', chargedKwh: 10.2 },
  { id: 'D-04', name: 'D区04号桩', zoneId: 'D', status: 'charging', currentPower: 45, maxPower: 120, vehicleType: 'slowCharge', plateNumber: '京L·00000', startTime: '17:45', estimatedEnd: '20:15', chargedKwh: 32.5 },
  { id: 'E-01', name: 'E区无障碍01', zoneId: 'E', status: 'charging', currentPower: 65, maxPower: 120, vehicleType: 'accessible', plateNumber: '京M·12121', isAccessible: true, startTime: '18:00', estimatedEnd: '19:30', chargedKwh: 22.8 },
  { id: 'E-02', name: 'E区无障碍02', zoneId: 'E', status: 'idle', currentPower: 0, maxPower: 120, isAccessible: true }
];
