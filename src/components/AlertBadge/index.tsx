import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { AlertLevel } from '@/types';

interface AlertBadgeProps {
  count: number;
  level?: AlertLevel;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ count, level = 'critical' }) => {
  if (count <= 0) return null;

  return (
    <View
      className={classnames(
        styles.badge,
        level === 'warning' && styles.badgeWarning,
        level === 'info' && styles.badgeInfo
      )}
    >
      <Text>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

export default AlertBadge;
