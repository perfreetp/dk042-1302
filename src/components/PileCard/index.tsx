import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { ChargingPile, PileStatus } from '@/types';

const statusLabels: Record<PileStatus, string> = {
  charging: '充电中',
  idle: '空闲',
  occupied: '空占',
  fault: '故障',
  reserved: '预留'
};

const PileCard: React.FC<{ pile: ChargingPile; onClick?: () => void }> = ({ pile, onClick }) => {
  const powerPercent = pile.maxPower > 0 ? Math.round((pile.currentPower / pile.maxPower) * 100) : 0;
  const isFast = pile.vehicleType === 'fastCharge';

  const getCardClass = () => {
    if (pile.isVip) return styles.cardVip;
    if (pile.isAccessible) return styles.cardAccessible;
    switch (pile.status) {
      case 'charging': return styles.cardCharging;
      case 'idle': return styles.cardIdle;
      case 'occupied': return styles.cardOccupied;
      case 'fault': return styles.cardFault;
      default: return '';
    }
  };

  const getStatusTagClass = () => {
    switch (pile.status) {
      case 'charging': return styles.tagCharging;
      case 'idle': return styles.tagIdle;
      case 'occupied': return styles.tagOccupied;
      case 'fault': return styles.tagFault;
      default: return '';
    }
  };

  return (
    <View
      className={classnames(styles.card, getCardClass())}
      onClick={onClick}
    >
      <View className={styles.header}>
        <Text className={styles.pileName}>{pile.name}</Text>
        <View className={styles.tags}>
          {pile.isVip && <View className={classnames(styles.tag, styles.tagVip)}>VIP</View>}
          {pile.isAccessible && <View className={classnames(styles.tag, styles.tagAccessible)}>无障碍</View>}
          {isFast && pile.status === 'charging' && <View className={classnames(styles.tag, styles.tagFast)}>快补</View>}
          {pile.vehicleType === 'slowCharge' && <View className={classnames(styles.tag, styles.tagSlow)}>慢充</View>}
          <View className={classnames(styles.tag, getStatusTagClass())}>
            {statusLabels[pile.status]}
          </View>
        </View>
      </View>

      {pile.plateNumber && (
        <View className={styles.info}>
          <Text className={styles.plate}>{pile.plateNumber}</Text>
          {pile.status === 'charging' && (
            <View>
              <Text className={styles.power}>{pile.currentPower}</Text>
              <Text className={styles.powerUnit}>kW</Text>
            </View>
          )}
        </View>
      )}

      {pile.status === 'charging' && (
        <>
          <View className={styles.powerBar}>
            <View
              className={classnames(
                styles.powerFill,
                isFast && styles.powerFillFast,
                pile.isVip && styles.powerFillVip
              )}
              style={{ width: `${powerPercent}%` }}
            />
          </View>
          <View className={styles.meta}>
            {pile.startTime && <Text className={styles.metaItem}>开始 {pile.startTime}</Text>}
            {pile.estimatedEnd && <Text className={styles.metaItem}>预计 {pile.estimatedEnd}</Text>}
            {pile.chargedKwh != null && <Text className={styles.metaItem}>{pile.chargedKwh.toFixed(1)} kWh</Text>}
          </View>
        </>
      )}

      {pile.status === 'occupied' && pile.occupancyDetected && (
        <View className={styles.meta}>
          <Text className={styles.metaItem} style={{ color: '#FF7D00' }}>⚠ 检测到空占，需现场处置</Text>
        </View>
      )}
    </View>
  );
};

export default PileCard;
