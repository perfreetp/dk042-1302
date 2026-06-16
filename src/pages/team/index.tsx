import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import dayjs from 'dayjs';
import SectionHeader from '@/components/SectionHeader';
import { mockTeamMembers, mockInterventionLogs, mockTurnoverStats, mockDailySummary } from '@/data/mockTeam';
import { strategyIconMap, strategyColorMap } from '@/data/mockStrategy';
import type { TeamMember } from '@/types';

type TabKey = 'team' | 'logs' | 'turnover' | 'summary';

const TeamPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('team');

  const roleLabels = {
    manager: '值班经理',
    operator: '运维员',
    technician: '技术员'
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'team', label: '在岗人员' },
    { key: 'logs', label: '干预记录' },
    { key: 'turnover', label: '翻台效率' },
    { key: 'summary', label: '复盘摘要' }
  ];

  const onCallMember = (member: TeamMember) => {
    if (!member.isOnDuty) {
      Taro.showToast({ title: '该人员未在岗', icon: 'none' });
      return;
    }
    console.log('[Team] 联系成员:', member.id);
    Taro.showToast({ title: `正在呼叫${member.name}`, icon: 'none' });
  };

  const handleAuth = () => {
    Taro.showActionSheet({
      itemList: ['授权C-01桩提功率', '授权D区全区域提功率', '临时解除VIP预留', '取消'],
      success: (res) => {
        if (res.tapIndex < 3) {
          Taro.showToast({ title: '授权成功', icon: 'success' });
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryValue}>
              {mockTeamMembers.filter(m => m.isOnDuty).length}
            </Text>
            <Text className={styles.summaryLabel}>在岗人数</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={classnames(styles.summaryValue, styles.summaryValueBlue)}>
              {mockInterventionLogs.length}
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
            {mockTeamMembers.map(member => (
              <View
                key={member.id}
                className={styles.teamCard}
                onClick={() => onCallMember(member)}
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
            {mockInterventionLogs.map(log => (
              <View key={log.id} className={styles.logCard}>
                <View className={styles.logHeader}>
                  <Text className={styles.logAction}>{log.action}</Text>
                  <Text className={styles.logTime}>
                    {dayjs(log.timestamp).format('HH:mm')}
                  </Text>
                </View>
                <Text className={styles.logOperator}>{log.operatorName}</Text>
                <Text className={styles.logDesc}>{log.description}</Text>
              </View>
            ))}
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
