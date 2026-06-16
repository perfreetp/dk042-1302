import React, { useState, useMemo } from 'react';
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
import type { StrategyType, ChargeStrategy, StrategyPreview } from '@/types';

const StrategyPage: React.FC = () => {
  const activeStrategyId = useChargeStore(s => s.activeStrategyId);
  const setStoreStrategy = useChargeStore(s => s.setActiveStrategy);
  const previewStrategyChange = useChargeStore(s => s.previewStrategyChange);

  const [previewTarget, setPreviewTarget] = useState<StrategyType | null>(null);

  const currentStrategy = mockStrategies.find(s => s.id === activeStrategyId) || mockStrategies[0];

  const previewData = useMemo<StrategyPreview | null>(() => {
    if (!previewTarget) return null;
    return previewStrategyChange(previewTarget);
  }, [previewTarget, previewStrategyChange]);

  const handleSwitchClick = (strategy: ChargeStrategy) => {
    if (strategy.id === activeStrategyId) return;
    setPreviewTarget(strategy.id);
  };

  const handleConfirmSwitch = () => {
    if (!previewTarget) return;
    setStoreStrategy(previewTarget, 'm1', '张经理', 'manual');
    const targetStrategy = mockStrategies.find(s => s.id === previewTarget);
    Taro.showToast({ title: `已切换至${targetStrategy?.name}`, icon: 'success' });
    setPreviewTarget(null);
  };

  const handleCancelPreview = () => {
    setPreviewTarget(null);
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
          const isActive = strategy.id === activeStrategyId;
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
                onClick={() => handleSwitchClick(strategy)}
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

      {previewData && (
        <>
          <View className={styles.previewMask} onClick={handleCancelPreview} />
          <View className={styles.previewModal}>
            <View className={styles.previewHandle} />
            <View className={styles.previewHeader}>
              <Text className={styles.previewTitle}>策略切换预览</Text>
            </View>

            <View className={styles.previewStrategyChange}>
              <View className={styles.strategyFrom}>
                <Text style={{ fontSize: 28 }}>{strategyIconMap[previewData.fromStrategy.id]}</Text>
                <Text>{previewData.fromStrategy.name}</Text>
              </View>
              <Text className={styles.strategyArrow}>→</Text>
              <View className={styles.strategyTo}>
                <Text style={{ fontSize: 28 }}>{strategyIconMap[previewData.toStrategy.id]}</Text>
                <Text style={{ color: strategyColorMap[previewData.toStrategy.id] }}>
                  {previewData.toStrategy.name}
                </Text>
              </View>
            </View>

            <Text className={styles.previewSectionTitle}>参数变化</Text>
            <View className={styles.paramCompareGrid}>
              <View className={styles.paramCompareItem}>
                <Text className={styles.paramLabel}>VIP预留</Text>
                <View className={styles.paramChangeBar}>
                  <Text className={styles.paramFrom}>{previewData.fromStrategy.vipReservedPower}</Text>
                  <Text className={styles.paramArrow}>→</Text>
                  <Text className={styles.paramTo}>{previewData.toStrategy.vipReservedPower}</Text>
                </View>
                <Text className={classnames(
                  styles.paramDelta,
                  previewData.toStrategy.vipReservedPower > previewData.fromStrategy.vipReservedPower ? styles.deltaUp : styles.deltaDown
                )}>
                  {previewData.toStrategy.vipReservedPower - previewData.fromStrategy.vipReservedPower >= 0 ? '+' : ''}
                  {previewData.toStrategy.vipReservedPower - previewData.fromStrategy.vipReservedPower} kW
                </Text>
              </View>
              <View className={styles.paramCompareItem}>
                <Text className={styles.paramLabel}>无障碍预留</Text>
                <View className={styles.paramChangeBar}>
                  <Text className={styles.paramFrom}>{previewData.fromStrategy.accessibleReservedPower}</Text>
                  <Text className={styles.paramArrow}>→</Text>
                  <Text className={styles.paramTo}>{previewData.toStrategy.accessibleReservedPower}</Text>
                </View>
                <Text className={classnames(
                  styles.paramDelta,
                  previewData.toStrategy.accessibleReservedPower > previewData.fromStrategy.accessibleReservedPower ? styles.deltaUp : styles.deltaDown
                )}>
                  {previewData.toStrategy.accessibleReservedPower - previewData.fromStrategy.accessibleReservedPower >= 0 ? '+' : ''}
                  {previewData.toStrategy.accessibleReservedPower - previewData.fromStrategy.accessibleReservedPower} kW
                </Text>
              </View>
              <View className={styles.paramCompareItem}>
                <Text className={styles.paramLabel}>单桩上限</Text>
                <View className={styles.paramChangeBar}>
                  <Text className={styles.paramFrom}>{previewData.fromStrategy.singlePileMaxPower}</Text>
                  <Text className={styles.paramArrow}>→</Text>
                  <Text className={styles.paramTo}>{previewData.toStrategy.singlePileMaxPower}</Text>
                </View>
                <Text className={classnames(
                  styles.paramDelta,
                  previewData.estimatedPowerChange.avgPilePowerChange > 0 ? styles.deltaUp : styles.deltaDown
                )}>
                  {previewData.estimatedPowerChange.avgPilePowerChange > 0 ? '+' : ''}
                  {previewData.estimatedPowerChange.avgPilePowerChange}%
                </Text>
              </View>
            </View>

            <Text className={styles.previewSectionTitle}>功率影响</Text>
            <View className={styles.impactSection}>
              <View className={styles.impactRow}>
                <Text className={styles.impactLabel}>快补桩功率提升</Text>
                <Text className={classnames(styles.impactValue, previewData.estimatedPowerChange.fastChargeBoost > 0 && styles.positive)}>
                  {previewData.estimatedPowerChange.fastChargeBoost > 0 ? '+' : ''}
                  {previewData.estimatedPowerChange.fastChargeBoost}%
                </Text>
              </View>
              <View className={styles.impactRow}>
                <Text className={styles.impactLabel}>慢充桩功率调整</Text>
                <Text className={classnames(styles.impactValue, previewData.estimatedPowerChange.slowChargeReduction > 0 && styles.negative)}>
                  {previewData.estimatedPowerChange.slowChargeReduction > 0 ? '-' : ''}
                  {previewData.estimatedPowerChange.slowChargeReduction}%
                </Text>
              </View>
              <View className={styles.impactRow}>
                <Text className={styles.impactLabel}>影响快补桩数</Text>
                <Text className={styles.impactValue}>
                  {previewData.affectedPilesCount.fastChargePiles} 个
                </Text>
              </View>
              <View className={styles.impactRow}>
                <Text className={styles.impactLabel}>影响慢充桩数</Text>
                <Text className={styles.impactValue}>
                  {previewData.affectedPilesCount.slowChargePiles} 个
                </Text>
              </View>
              <View className={styles.impactRow}>
                <Text className={styles.impactLabel}>VIP保障桩</Text>
                <Text className={styles.impactValue}>
                  {previewData.affectedPilesCount.vipPiles} 个
                </Text>
              </View>
              <View className={styles.impactRow}>
                <Text className={styles.impactLabel}>无障碍保障</Text>
                <Text className={styles.impactValue}>
                  {previewData.affectedPilesCount.accessiblePiles} 个
                </Text>
              </View>
            </View>

            {previewData.affectedZones.length > 0 && (
              <>
                <Text className={styles.previewSectionTitle}>影响区域</Text>
                <View className={styles.zoneTags}>
                  {previewData.affectedZones.map(z => (
                    <View key={z} className={styles.zoneTag}>
                      <Text>{z}区</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <View className={styles.previewTip}>
              💡 切换后以上参数即时生效，正在充电的车辆功率会自动调整
            </View>

            <View className={styles.previewActions}>
              <View className={styles.previewBtn} onClick={handleCancelPreview}>
                <Text>取消</Text>
              </View>
              <View className={classnames(styles.previewBtn, styles.previewBtnPrimary)} onClick={handleConfirmSwitch}>
                <Text>确认切换</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default StrategyPage;
