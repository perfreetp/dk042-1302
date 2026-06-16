import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, trend, trendUp }) => {
  return (
    <View className={styles.card}>
      <Text className={styles.label}>{label}</Text>
      <View className={styles.valueRow}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {trend && (
        <View className={classnames(styles.trend, trendUp ? styles.trendUp : styles.trendDown)}>
          <Text>{trendUp ? '↑' : '↓'} {trend}</Text>
        </View>
      )}
    </View>
  );
};

export default StatCard;
