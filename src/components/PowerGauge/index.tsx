import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface PowerGaugeProps {
  usedPower: number;
  totalPower: number;
  reservedPower: number;
  availablePower: number;
  usageRate: number;
  mallLoad: number;
  mallLoadThreshold: number;
}

const PowerGauge: React.FC<PowerGaugeProps> = ({
  usedPower,
  totalPower,
  reservedPower,
  availablePower,
  usageRate,
  mallLoad,
  mallLoadThreshold
}) => {
  const isWarning = usageRate >= 85;
  const mallLoadPercent = Math.min(Math.round((mallLoad / mallLoadThreshold) * 100), 100);
  const isMallWarning = mallLoadPercent >= 85;

  const radius = 110;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((usageRate / 100) * circumference, circumference);

  const progressColor = usageRate >= 90 ? '#F53F3F' : usageRate >= 75 ? '#FF7D00' : '#1677FF';

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>总功率池</Text>
        <View className={classnames(styles.statusTag, isWarning && styles.statusTagWarning)}>
          {isWarning ? '接近上限' : '运行正常'}
        </View>
      </View>

      <View className={styles.gaugeWrapper}>
        <View className={styles.gaugeCenter}>
          <Text className={styles.usageValue}>{usageRate}</Text>
          <Text className={styles.usageUnit}>%</Text>
          <View className={styles.usageLabel}>功率占用率</View>
        </View>
        <svg
          className={styles.progressRing}
          width="260"
          height="260"
          viewBox="0 0 260 260"
        >
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="130"
            cy="130"
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ filter: `drop-shadow(0 0 8px ${progressColor})` }}
          />
        </svg>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueBlue)}>{usedPower}</Text>
          <View className={styles.statLabel}>已用(kW)</View>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueGreen)}>{reservedPower}</Text>
          <View className={styles.statLabel}>预留(kW)</View>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueOrange)}>{availablePower}</Text>
          <View className={styles.statLabel}>可用(kW)</View>
        </View>
      </View>

      <View className={styles.mallLoad}>
        <View className={styles.mallLoadHeader}>
          <Text className={styles.mallLoadLabel}>商场总负荷</Text>
          <Text className={styles.mallLoadValue}>
            {mallLoad} / {mallLoadThreshold} kW
          </Text>
        </View>
        <View className={styles.mallLoadBar}>
          <View
            className={classnames(styles.mallLoadFill, isMallWarning && styles.mallLoadFillWarning)}
            style={{ width: `${mallLoadPercent}%` }}
          />
        </View>
      </View>
    </View>
  );
};

export default PowerGauge;
