import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { strategyIconMap, strategyColorMap } from '@/data/mockStrategy';
import type { StrategyType } from '@/types';

interface StrategyTagProps {
  strategy: StrategyType;
  name: string;
  isActive?: boolean;
}

const StrategyTag: React.FC<StrategyTagProps> = ({ strategy, name, isActive }) => {
  const color = strategyColorMap[strategy];
  const icon = strategyIconMap[strategy];

  return (
    <View
      className={classnames(styles.tag, isActive && styles.active)}
      style={!isActive ? { background: `${color}15`, color } : { background: color }}
    >
      <Text className={styles.icon}>{icon}</Text>
      <Text>{name}</Text>
    </View>
  );
};

export default StrategyTag;
