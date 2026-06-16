import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import dayjs from 'dayjs';
import PowerGauge from '@/components/PowerGauge';
import StatCard from '@/components/StatCard';
import SectionHeader from '@/components/SectionHeader';
import StrategyTag from '@/components/StrategyTag';
import {
  mockPowerPool,
  mockZoneStats,
  mockDashboardAlerts,
  mockTeamOnDuty,
  mockCoreStats
} from '@/data/mockDashboard';
import { mockStrategies } from '@/data/mockStrategy';
import { useChargeStore } from '@/store/useChargeStore';
import type { ZoneStat, AlertItem, StrategyType } from '@/types';

const DashboardPage: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>('balanced');
  const setStoreStrategy = useChargeStore(s => s.setActiveStrategy);
  const addIntervention = useChargeStore(s => s.addIntervention);

  const currentTime = dayjs().format('MM-DD HH:mm');
  const activeStrategyData = mockStrategies.find(s => s.id === activeStrategy) || mockStrategies[0];

  const handleSwitchStrategy = (strategyId: StrategyType) => {
    setActiveStrategy(strategyId);
    setStoreStrategy(strategyId);
    const strategy = mockStrategies.find(s => s.id === strategyId);
    addIntervention({
      operatorId: 'm1',
      operatorName: '张经理',
      action: '切换策略',
      description: `从首页快捷切换至「${strategy?.name}」`
    });
    Taro.showToast({ title: `已切换至${strategy?.name}`, icon: 'success' });
    console.log('[Dashboard] 切换策略:', strategyId);
  };

  const getBusyLevelClass = (level: number) => {
    if (level >= 85) return styles.zoneLevelHigh;
    if (level >= 60) return styles.zoneLevelMid;
    return styles.zoneLevelLow;
  };

  const getBusyFillColor = (level: number) => {
    if (level >= 85) return '#F53F3F';
    if (level >= 60) return '#FF7D00';
    return '#00B42A';
  };

  const getBusyLevelText = (level: number) => {
    if (level >= 85) return '繁忙';
    if (level >= 60) return '适中';
    return '空闲';
  };

  const handleZoneClick = (zone: ZoneStat) => {
    console.log('[Dashboard] 点击区域:', zone.zoneId);
    Taro.switchTab({ url: '/pages/heatmap/index' });
  };

  const handleAlertClick = (alert: AlertItem) => {
    console.log('[Dashboard] 点击告警:', alert.id);
    Taro.switchTab({ url: '/pages/alerts/index' });
  };

  const getAlertClass = (level: string) => {
    if (level === 'critical') return styles.alertCritical;
    if (level === 'warning') return styles.alertWarning;
    return styles.alertInfo;
  };

  const roleLabels = {
    manager: '值班经理',
    operator: '运维员',
    technician: '技术员'
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
    >
      <View className={styles.topSection}>
        <View className={styles.pageTitle}>
          <Text className={styles.titleText}>运营看板</Text>
          <Text className={styles.timeText}>{currentTime}</Text>
        </View>

        <PowerGauge {...mockPowerPool} />

        <View className={styles.statsGrid}>
          {mockCoreStats.map((stat, idx) => (
            <StatCard
              key={idx}
              label={stat.label}
              value={stat.value}
              unit={stat.unit}
              trend={stat.trend}
              trendUp={stat.trendUp}
            />
          ))}
        </View>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.strategyCard}>
          <View className={styles.strategyHeader}>
            <Text className={styles.strategyTitle}>当前运行策略</Text>
          </View>
          <View className={styles.strategyBody}>
            <View className={styles.strategyInfo}>
              <StrategyTag
                strategy={activeStrategyData.id}
                name={activeStrategyData.name}
                isActive
              />
              <Text className={styles.strategyName}>{activeStrategyData.description}</Text>
            </View>
          </View>

          <View className={styles.quickActions}>
            <View
              className={styles.actionBtn}
              onClick={() => handleSwitchStrategy('balanced')}
            >
              <Text>均衡模式</Text>
            </View>
            <View
              className={classnames(styles.actionBtn, styles.actionBtnPrimary)}
              onClick={() => handleSwitchStrategy('highTurnover')}
            >
              <Text>⚡ 高周转</Text>
            </View>
          </View>
        </View>

        <SectionHeader
          title="区域繁忙度"
          action="查看详情"
          onAction={() => Taro.switchTab({ url: '/pages/heatmap/index' })}
        />

        <ScrollView
          className={styles.zoneScroll}
          scrollX
          showScrollbar={false}
        >
          {mockZoneStats.map(zone => (
            <View
              key={zone.zoneId}
              className={styles.zoneCard}
              onClick={() => handleZoneClick(zone)}
            >
              <View className={styles.zoneHeader}>
                <Text className={styles.zoneName}>{zone.zoneName}</Text>
                <View className={classnames(styles.zoneLevel, getBusyLevelClass(zone.busynessLevel))}>
                  <Text>{getBusyLevelText(zone.busynessLevel)}</Text>
                </View>
              </View>
              <View className={styles.zoneStats}>
                <Text>{zone.chargingPiles}/{zone.totalPiles} 充电中</Text>
                <Text>·</Text>
                <Text>周转 {zone.turnoverRate}次/h</Text>
              </View>
              <View className={styles.zoneBusyBar}>
                <View
                  className={styles.zoneBusyFill}
                  style={{
                    width: `${zone.busynessLevel}%`,
                    background: getBusyFillColor(zone.busynessLevel)
                  }}
                />
              </View>
            </View>
          ))}
        </ScrollView>

        <SectionHeader
          title="待处理告警"
          action="全部"
          onAction={() => Taro.switchTab({ url: '/pages/alerts/index' })}
        />

        {mockDashboardAlerts.slice(0, 3).map(alert => (
          <View
            key={alert.id}
            className={classnames(
              styles.alertCard,
              getAlertClass(alert.level),
              alert.isHandled && styles.alertHandled
            )}
            onClick={() => handleAlertClick(alert)}
          >
            <View className={styles.alertContent}>
              <Text className={styles.alertTitle}>{alert.title}</Text>
              <Text className={styles.alertDesc}>{alert.description}</Text>
            </View>
            <Text className={styles.alertTime}>
              {dayjs(alert.timestamp).format('HH:mm')}
            </Text>
          </View>
        ))}

        <SectionHeader title="班组在岗" />

        <View className={styles.teamCard}>
          <View className={styles.teamList}>
            {mockTeamOnDuty.map(member => (
              <View key={member.id} className={styles.teamItem}>
                <View className={styles.teamAvatar}>
                  <Text>{member.name.slice(0, 1)}</Text>
                </View>
                <View className={styles.teamInfo}>
                  <View className={styles.teamDuty}>
                    <View className={classnames(styles.dutyDot, !member.isOnDuty && styles.dutyDotOff)} />
                    <Text className={styles.teamName}>{member.name}</Text>
                  </View>
                  <Text className={styles.teamRole}>
                    {roleLabels[member.role]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text className={styles.refreshTip}>下拉刷新实时数据</Text>
      </View>
    </ScrollView>
  );
};

export default DashboardPage;
