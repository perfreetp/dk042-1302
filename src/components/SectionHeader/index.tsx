import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, onAction }) => {
  return (
    <View className={styles.container}>
      <View className={styles.left}>
        <View className={styles.indicator} />
        <Text className={styles.title}>{title}</Text>
      </View>
      {action && (
        <View className={styles.action} onClick={onAction}>
          <Text>{action} ›</Text>
        </View>
      )}
    </View>
  );
};

export default SectionHeader;
