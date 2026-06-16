import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { strategyIconMap, strategyColorMap } from '@/data/mockStrategy';
import { useChargeStore } from '@/store/useChargeStore';
import { mockTurnoverStats, mockDailySummary } from '@/data/mockTeam';
import type { StrategyChangeLog } from '@/types';

type TabKey = 'team' | 'logs' | 'strategy' | 'turnover' | 'summary';

const TeamPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('team');
  const teamMembers = useChargeStore(s => s.teamMembers);
  const interventionLogs = useChargeStore(s => s.interventionLogs);
  const strategyChangeLogs = useChargeStore(s => s.strategyChangeLogs);
  const authorizePowerBoost = useChargeStore(s => s.authorizePowerBoost);
  const addIntervention = useChargeStore(s => s.addIntervention);

  const roleLabels = {
    manager: '值班经理',
    operator: '运维员',
    technician: '技术员'
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'team', label: '在岗人员' },
    { key: 'logs', label: '干预记录' },
    { key: 'strategy', label: '策略变更' },
    { key: 'turnover', label: '翻台效率' },
    { key: 'summary', label: '复盘摘要' }
  ];

  const onCallMember = (memberId: string, name: string, isOnDuty: boolean) => {
    if (!isOnDuty) {
      Taro.showToast({ title: '该人员未在岗', icon: 'none' });
      return;
    }
    Taro.showToast({ title: `正在呼叫${name}`, icon: 'none' });
  };

  const handleAuth = () => {
    Taro.showActionSheet({
      itemList: ['授权C-01桩提功率', '授权D区全区域提功率', '临时解除VIP预留'],
      success: (res) => {
        if (res.tapIndex === 0) {
          authorizePowerBoost('C-01', 'm1', '张经理');
          Taro.showToast({ title: '已授权C-01提功率', icon: 'success' });
        } else if (res.tapIndex === 1) {
          addIntervention({
            operatorId: 'm1',
            operatorName: '张经理',
            action: '区域提功率',
            description: '授权D区全区域临时提升功率',
            zoneId: 'D'
          });
          Taro.showToast({ title: '已授权D区提功率', icon: 'success' });
        } else if (res.tapIndex === 2) {
          addIntervention({
            operatorId: 'm1',
            operatorName: '张经理',
            action: '解除预留',
            description: '临时解除VIP区预留功率限制'
          });
          Taro.showToast({ title: '已解除VIP预留', icon: 'success' });
        }
      }
    });
  };

  const todayInterventionCount = interventionLogs.filter(
    log => dayjs(log.timestamp).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  ).length || interventionLogs.length;

  const triggerLabels: Record<StrategyChangeLog['trigger'], { label: string; className: string }> = {
    manual: { label: '手动切换', className: styles.triggerManual },
    alert: { label: '告警触发', className: styles.triggerAlert },
    batch: { label: '批量处理', className: styles.triggerBatch },
    schedule: { label: '定时切换', className: styles.triggerSchedule }
  };

  const formatDelta = (from: number, to: number) => {
    const diff = to - from;
    if (diff === 0) return { text: '—', className: '' };
    if (diff > 0) return { text: `↑${diff}`, className: styles.schDeltaUp };
    return { text: `↓${Math.abs(diff)}`, className: styles.schDeltaDown };
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>
              {teamMembers.filter(m => m.isOnDuty).length}
            </Text>
            <Text className={styles.summaryLabel}>在岗人数</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.summaryValueBlue)}>
              {todayInterventionCount}
            </Text>
            <Text className={styles.summaryLabel}>今日干预</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.summaryValueOrange)}>
              {mockDailySummary.totalChargedKwh.toLocaleString()}
            </Text>
            <Text className={styles.summaryLabel}>今日充电(kWh)</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.summaryValueGreen)}>
              {mockDailySummary.avgTurnoverMinutes}
            </Text>
            <Text className={styles.summaryLabel}>平均周转(分)</Text>
          </View>
        </View>
        <View className={styles.managerBar}>
          <View className={styles.managerInfo}>
            <View className={styles.managerAvatar}>
              <Text>张</Text>
            </View>
            <View className={styles.managerText}>
              <Text className={styles.managerName}>张经理</Text>
              <Text className={styles.managerRole}>当前值班经理 · 在岗</Text>
            </View>
          </View>
          <View className={styles.authBtn} onClick={handleAuth}>
            <Text>⚡ 远程授权</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.tabBar}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, activeTab === tab.key && styles.tabItemActive)}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'team' && (
          <View className={styles.teamList}>
            {teamMembers.map(member => (
              <View
                key={member.id}
                className={styles.teamCard}
                onClick={() => onCallMember(member.id, member.name, member.isOnDuty)}
              >
                <View className={classnames(styles.teamAvatar, !member.isOnDuty && styles.teamAvatarOff)}>
                  <Text>{member.name.slice(0, 1)}</Text>
                </View>
                <View className={styles.teamInfo}>
                  <Text className={styles.teamName}>{member.name}</Text>
                  <View className={styles.teamStatus}>
                    <View className={classnames(styles.statusDot, !member.isOnDuty && styles.statusDotOff)} />
                    <Text>{roleLabels[member.role]} · {member.isOnDuty ? '在岗' : '休息'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'logs' && (
          <View className={styles.logList}>
            {interventionLogs.length === 0 ? (
              <View className={styles.schEmpty}>
                <Text>暂无干预记录</Text>
              </View>
            ) : (
              interventionLogs.map(log => (
                <View key={log.id} className={styles.logCard}>
                  <View className={styles.logHeader}>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Text className={styles.logAction}>{log.action}</Text>
                      {log.extra?.isBatch && (
                        <View className={styles.logBatchTag}>
                          批量×{log.extra.alertCount || log.extra.alertCount === 0 ? '0' : log.extra.alertCount}
                        </View>
                      )}
                    </View>
                    <Text className={styles.logTime}>
                      {dayjs(log.timestamp).format('HH:mm')}
                    </Text>
                  </View>
                  <Text className={styles.logOperator}>{log.operatorName}</Text>
                  <Text className={styles.logDesc}>{log.description}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'strategy' && (
          <View>
            {strategyChangeLogs.length === 0 ? (
              <View className={styles.schEmpty}>
                <Text>暂无策略变更记录</Text>
              </View>
            ) : (
              strategyChangeLogs.map((change: StrategyChangeLog) => {
                const triggerInfo = triggerLabels[change.trigger];
                const vipDelta = formatDelta(
                  change.parameterChanges.vipReservedPower.from,
                  change.parameterChanges.vipReservedPower.to
                );
                const accessDelta = formatDelta(
                  change.parameterChanges.accessibleReservedPower.from,
                  change.parameterChanges.accessibleReservedPower.to
                );
                const powerDelta = formatDelta(
                  change.parameterChanges.singlePileMaxPower.from,
                  change.parameterChanges.singlePileMaxPower.to
                );
                const priorityDelta = formatDelta(
                  change.parameterChanges.fastChargePriority.from,
                  change.parameterChanges.fastChargePriority.to
                );
                return (
                  <View key={change.id} className={styles.strategyChangeCard}>
                    <View className={styles.schHeader}>
                      <View className={styles.schTitle}>
                        <Text>🔄 策略变更</Text>
                        <View className={classnames(styles.schTriggerTag, triggerInfo.className)}>
                          <Text>{triggerInfo.label}</Text>
                        </View>
                      </View>
                      <Text className={styles.schTime}>
                        {dayjs(change.timestamp).format('MM-DD HH:mm')}
                      </Text>
                    </View>
                    <Text className={styles.schOperator}>{change.operatorName}</Text>

                    <View className={styles.schChangeRow}>
                      <View className={styles.schFrom}>
                        <Text style={{ fontSize: 28 }}>{strategyIconMap[change.fromStrategy]}</Text>
                        <Text style={{ color: strategyColorMap[change.fromStrategy] }}>
                          {change.fromStrategyName}
                        </Text>
                      </View>
                      <Text className={styles.schArrow}>→</Text>
                      <View className={styles.schTo}>
                        <Text style={{ fontSize: 28 }}>{strategyIconMap[change.toStrategy]}</Text>
                        <Text style={{ color: strategyColorMap[change.toStrategy] }}>
                          {change.toStrategyName}
                        </Text>
                      </View>
                    </View>

                    <View className={styles.schParams}>
                      <View className={styles.schParamItem}>
                        <Text>VIP预留</Text>
                        <View className={styles.schParamValue}>
                          <Text>{change.parameterChanges.vipReservedPower.to}kW</Text>
                          <Text className={vipDelta.className}>{vipDelta.text}</Text>
                        </View>
                      </View>
                      <View className={styles.schParamItem}>
                        <Text>无障碍预留</Text>
                        <View className={styles.schParamValue}>
                          <Text>{change.parameterChanges.accessibleReservedPower.to}kW</Text>
                          <Text className={accessDelta.className}>{accessDelta.text}</Text>
                        </View>
                      </View>
                      <View className={styles.schParamItem}>
                        <Text>单桩上限</Text>
                        <View className={styles.schParamValue}>
                          <Text>{change.parameterChanges.singlePileMaxPower.to}kW</Text>
                          <Text className={powerDelta.className}>{powerDelta.text}</Text>
                        </View>
                      </View>
                      <View className={styles.schParamItem}>
                        <Text>快补优先级</Text>
                        <View className={styles.schParamValue}>
                          <Text>{change.parameterChanges.fastChargePriority.to}级</Text>
                          <Text className={priorityDelta.className}>{priorityDelta.text}</Text>
                        </View>
                      </View>
                    </View>

                    {change.affectedZones.length > 0 && (
                      <>
                        <Text style={{ fontSize: 24, color: '#86909C', marginBottom: 8 }}>
                          影响区域 ({change.affectedZones.length}个)
                        </Text>
                        <View className={styles.schZones}>
                          {change.affectedZones.map(z => (
                            <View key={z} className={styles.schZoneTag}>
                              <Text>{z}区</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {activeTab === 'turnover' && (
          <View className={styles.turnoverList}>
            {mockTurnoverStats.map((stat, idx) => {
              const color = strategyColorMap[stat.strategy];
              return (
                <View key={idx} className={styles.turnoverCard}>
                  <View className={styles.turnoverHeader}>
                    <View className={styles.turnoverStrategy}>
                      <Text style={{ fontSize: 28 }}>{strategyIconMap[stat.strategy]}</Text>
                      <Text style={{ color }}>{stat.strategyName}</Text>
                    </View>
                    <Text className={styles.turnoverDate}>{stat.date}</Text>
                  </View>
                  <View className={styles.turnoverStats}>
                    <View className={styles.turnoverStat}>
                      <Text className={styles.turnoverStatValue}>{stat.avgTurnoverMinutes}</Text>
                      <Text className={styles.turnoverStatLabel}>平均周转(分)</Text>
                    </View>
                    <View className={styles.turnoverStat}>
                      <Text className={styles.turnoverStatValue}>{stat.dailyTurnoverCount}</Text>
                      <Text className={styles.turnoverStatLabel}>翻台次数</Text>
                    </View>
                    <View className={styles.turnoverStat}>
                      <Text className={styles.turnoverStatValue}>{(stat.totalChargedKwh / 1000).toFixed(1)}k</Text>
                      <Text className={styles.turnoverStatLabel}>充电量(kWh)</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'summary' && (
          <View className={styles.summaryCardLight}>
            <Text className={styles.summaryHeader}>今日运营复盘</Text>
            <Text className={styles.summaryDate}>{mockDailySummary.date}</Text>
            <View className={styles.summaryStats}>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue}>{mockDailySummary.totalChargedKwh.toLocaleString()}</Text>
                <Text className={styles.summaryStatLabel}>总充电量 (kWh)</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue}>{mockDailySummary.avgTurnoverMinutes}</Text>
                <Text className={styles.summaryStatLabel}>平均周转 (分钟)</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue}>{mockDailySummary.peakUsageRate}%</Text>
                <Text className={styles.summaryStatLabel}>峰值利用率</Text>
              </View>
              <View className={styles.summaryStat}>
                <Text className={styles.summaryStatValue}>{mockDailySummary.interventionsCount}</Text>
                <Text className={styles.summaryStatLabel}>人工干预次数</Text>
              </View>
            </View>

            <Text className={styles.subTitle}>关键事件</Text>
            {mockDailySummary.highlightEvents.map((event, idx) => (
              <Text key={idx} className={styles.eventItem}>{event}</Text>
            ))}

            <Text className={styles.subTitle}>运营建议</Text>
            {mockDailySummary.suggestions.map((sug, idx) => (
              <Text key={idx} className={styles.suggestionItem}>{sug}</Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TeamPage;
