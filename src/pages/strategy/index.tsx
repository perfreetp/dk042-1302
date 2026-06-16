import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import {
  mockStrategies,
  strategyIconMap,
  strategyColorMap
} from '@/data/mockStrategy';
import { useChargeStore } from '@/store/useChargeStore';
import type { StrategyType, ChargeStrategy } from '@/types';

const StrategyPage: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>('balanced');
  const setStoreStrategy = useChargeStore(s => s.setActiveStrategy);
  const addIntervention = useChargeStore(s => s.addIntervention);

  const currentStrategy = mockStrategies.find(s => s.id === activeStrategy) || mockStrategies[0];

  const handleSwitchStrategy = (strategy: ChargeStrategy) => {
    if (strategy.id === activeStrategy) return;
    setActiveStrategy(strategy.id);
    setStoreStrategy(strategy.id);
    addIntervention({
      operatorId: 'm1',
      operatorName: '张经理',
      action: '切换策略',
      description: `切换至「${strategy.name}」`
    });
    Taro.showToast({ title: `已切换至${strategy.name}`, icon: 'success' });
    console.log('[Strategy] 切换策略:', strategy.id);
  };

  const schedules = [
    { time: '工作日 07:00-10:00', strategy: '均衡模式' },
    { time: '工作日 17:00-21:00', strategy: '高周转模式' },
    { time: '周末全天', strategy: '高周转模式' },
    { time: '限电日全天', strategy: '节能模式' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>当前运行策略</Text>
        <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text style={{ fontSize: 40 }}>{strategyIconMap[currentStrategy.id]}</Text>
          <Text className={styles.headerName}>{currentStrategy.name}</Text>
        </View>
        <Text className={styles.headerDesc}>{currentStrategy.description}</Text>
        <View className={styles.headerParams}>
          <View className={styles.headerParam}>
            <Text className={styles.paramValue}>{currentStrategy.singlePileMaxPower}</Text>
            <Text className={styles.paramLabel}>单桩上限(kW)</Text>
          </View>
          <View className={styles.headerParam}>
            <Text className={classnames(styles.paramValue, styles.paramValueOrange)}>{currentStrategy.vipReservedPower}</Text>
            <Text className={styles.paramLabel}>VIP预留(kW)</Text>
          </View>
          <View className={styles.headerParam}>
            <Text className={classnames(styles.paramValue, styles.paramValueGreen)}>{currentStrategy.accessibleReservedPower}</Text>
            <Text className={styles.paramLabel}>无障碍预留(kW)</Text>
          </View>
        </View>
      </View>

      <View className={styles.strategyList}>
        {mockStrategies.map(strategy => {
          const isActive = strategy.id === activeStrategy;
          const color = strategyColorMap[strategy.id];
          return (
            <View
              key={strategy.id}
              className={classnames(styles.strategyCard, isActive && styles.strategyCardActive)}
            >
              <View className={styles.cardHeader}>
                <View className={styles.cardTitle}>
                  <View
                    className={styles.iconBox}
                    style={{ background: `${color}15` }}
                  >
                    <Text>{strategyIconMap[strategy.id]}</Text>
                  </View>
                  <Text className={styles.cardName}>{strategy.name}</Text>
                </View>
                {isActive && <View className={styles.activeBadge}>运行中</View>}
              </View>
              <Text className={styles.cardDesc}>{strategy.description}</Text>
              <View className={styles.cardParams}>
                <View className={styles.cardParam}>
                  <Text className={styles.cardParamLabel}>单桩最大功率</Text>
                  <Text className={styles.cardParamValue}>{strategy.singlePileMaxPower} kW</Text>
                </View>
                <View className={styles.cardParam}>
                  <Text className={styles.cardParamLabel}>VIP预留功率</Text>
                  <Text className={styles.cardParamValue}>{strategy.vipReservedPower} kW</Text>
                </View>
                <View className={styles.cardParam}>
                  <Text className={styles.cardParamLabel}>无障碍预留</Text>
                  <Text className={styles.cardParamValue}>{strategy.accessibleReservedPower} kW</Text>
                </View>
                <View className={styles.cardParam}>
                  <Text className={styles.cardParamLabel}>快充优先级</Text>
                  <Text className={styles.cardParamValue}>
                    {strategy.fastChargePriority === 3 ? '最高' : strategy.fastChargePriority === 2 ? '较高' : '标准'}
                  </Text>
                </View>
                <View className={styles.cardParam}>
                  <Text className={styles.cardParamLabel}>自动压降</Text>
                  <Text className={styles.cardParamValue}>{strategy.autoDropLoad ? '开启' : '关闭'}</Text>
                </View>
                <View className={styles.cardParam}>
                  <Text className={styles.cardParamLabel}>压降阈值</Text>
                  <Text className={styles.cardParamValue}>{strategy.dropLoadThreshold}%</Text>
                </View>
              </View>
              <View
                className={classnames(styles.switchBtn, isActive && styles.switchBtnActive)}
                onClick={() => handleSwitchStrategy(strategy)}
              >
                <Text>{isActive ? '当前策略' : '切换到此策略'}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className={styles.scheduleSection}>
        <Text className={styles.scheduleTitle}>定时切换计划</Text>
        {schedules.map((item, idx) => (
          <View key={idx} className={styles.scheduleItem}>
            <Text className={styles.scheduleTime}>{item.time}</Text>
            <Text className={styles.scheduleStrategy}>{item.strategy}</Text>
          </View>
        ))}
        <View
          className={styles.addSchedule}
          onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}
        >
          <Text>+ 添加定时计划</Text>
        </View>
      </View>
    </View>
  );
};

export default StrategyPage;
