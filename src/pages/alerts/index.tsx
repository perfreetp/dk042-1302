import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { mockAlerts, alertTypeLabels, alertLevelColors } from '@/data/mockAlerts';
import { useChargeStore } from '@/store/useChargeStore';
import type { AlertItem, AlertLevel, AlertType } from '@/types';

type FilterKey = 'all' | 'unhandled' | AlertType;

const AlertsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const handleAlertStore = useChargeStore(s => s.handleAlert);
  const addIntervention = useChargeStore(s => s.addIntervention);
  const [localAlerts, setLocalAlerts] = useState<AlertItem[]>(mockAlerts);

  const stats = useMemo(() => {
    return {
      total: localAlerts.length,
      critical: localAlerts.filter(a => a.level === 'critical' && !a.isHandled).length,
      warning: localAlerts.filter(a => a.level === 'warning' && !a.isHandled).length,
      info: localAlerts.filter(a => a.level === 'info' && !a.isHandled).length,
      unhandled: localAlerts.filter(a => !a.isHandled).length
    };
  }, [localAlerts]);

  const filters: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'unhandled', label: '待处理', count: stats.unhandled },
    { key: 'powerOverload', label: '负荷超限' },
    { key: 'emptyOccupancy', label: '空占车位' },
    { key: 'waitTimeout', label: '等待超时' },
    { key: 'managerAuth', label: '授权请求' }
  ];

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return localAlerts;
    if (activeFilter === 'unhandled') return localAlerts.filter(a => !a.isHandled);
    return localAlerts.filter(a => a.type === activeFilter);
  }, [activeFilter, localAlerts]);

  const getAlertClass = (level: AlertLevel) => {
    if (level === 'critical') return styles.alertCritical;
    if (level === 'warning') return styles.alertWarning;
    return styles.alertInfo;
  };

  const getLevelClass = (level: AlertLevel) => {
    if (level === 'critical') return styles.levelCritical;
    if (level === 'warning') return styles.levelWarning;
    return styles.levelInfo;
  };

  const getLevelLabel = (level: AlertLevel) => {
    if (level === 'critical') return '紧急';
    if (level === 'warning') return '警告';
    return '提示';
  };

  const handleAlert = (alert: AlertItem) => {
    if (alert.isHandled) return;
    setLocalAlerts(prev =>
      prev.map(a => (a.id === alert.id ? { ...a, isHandled: true } : a))
    );
    handleAlertStore(alert.id);
    addIntervention({
      operatorId: 'm1',
      operatorName: '张经理',
      action: '处理告警',
      description: `处理告警「${alert.title}」`,
      pileId: alert.pileId,
      zoneId: alert.zoneId
    });
    Taro.showToast({ title: '已标记为已处理', icon: 'success' });
    console.log('[Alerts] 处理告警:', alert.id);
  };

  const handleAction = (alert: AlertItem, actionType: string) => {
    console.log('[Alerts] 执行操作:', alert.id, actionType);
    if (actionType === 'dispatch') {
      Taro.showToast({ title: '已派发现场人员', icon: 'success' });
    } else if (actionType === 'switch') {
      Taro.switchTab({ url: '/pages/strategy/index' });
    } else if (actionType === 'authorize') {
      Taro.showToast({ title: '已授权临时提功率', icon: 'success' });
    }
    handleAlert(alert);
  };

  const unhandledCount = (type: AlertType) =>
    localAlerts.filter(a => a.type === type && !a.isHandled).length;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.filterBar}>
        {filters.map(f => (
          <View
            key={f.key}
            className={classnames(styles.filterItem, activeFilter === f.key && styles.filterItemActive)}
            onClick={() => setActiveFilter(f.key)}
          >
            <Text>{f.label}</Text>
            {f.count !== undefined && f.count > 0 && activeFilter !== f.key && (
              <View className={styles.filterBadge}>
                <Text>{f.count > 99 ? '99+' : f.count}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{stats.critical}</Text>
          <Text className={styles.statLabel}>紧急</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueWarning)}>{stats.warning}</Text>
          <Text className={styles.statLabel}>警告</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueInfo)}>{stats.info}</Text>
          <Text className={styles.statLabel}>提示</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statValue, styles.statValueDone)}>{stats.unhandled}</Text>
          <Text className={styles.statLabel}>待处理</Text>
        </View>
      </View>

      <View className={styles.alertList}>
        {filteredAlerts.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>暂无相关告警</Text>
          </View>
        ) : (
          filteredAlerts.map(alert => (
            <View
              key={alert.id}
              className={classnames(
                styles.alertCard,
                getAlertClass(alert.level),
                alert.isHandled && styles.alertHandled
              )}
            >
              <View className={styles.cardTop}>
                <View className={classnames(styles.levelTag, getLevelClass(alert.level))}>
                  <Text>{getLevelLabel(alert.level)} · {alertTypeLabels[alert.type]}</Text>
                </View>
                {alert.isHandled ? (
                  <View className={styles.handledTag}>已处理</View>
                ) : (
                  <Text className={styles.timeText}>
                    {dayjs(alert.timestamp).format('HH:mm')}
                  </Text>
                )}
              </View>
              <Text className={styles.alertTitle}>{alert.title}</Text>
              <Text className={styles.alertDesc}>{alert.description}</Text>
              <View className={styles.extraInfo}>
                {alert.zoneId && <Text className={styles.extraTag}>区域：{alert.zoneId}区</Text>}
                {alert.pileId && <Text className={styles.extraTag}>桩位：{alert.pileId}</Text>}
                {alert.extra?.plateNumber && <Text className={styles.extraTag}>车牌：{alert.extra.plateNumber}</Text>}
                {alert.extra?.waitingCount && <Text className={styles.extraTag}>排队：{alert.extra.waitingCount}辆</Text>}
              </View>
              {!alert.isHandled && (
                <View className={styles.actionRow}>
                  {alert.type === 'emptyOccupancy' && (
                    <>
                      <View className={styles.actionBtn} onClick={() => handleAction(alert, 'dispatch')}>
                        <Text>派发人员</Text>
                      </View>
                      <View className={classnames(styles.actionBtn, styles.actionBtnWarning)} onClick={() => handleAlert(alert)}>
                        <Text>标记处理</Text>
                      </View>
                    </>
                  )}
                  {(alert.type === 'powerOverload' || alert.type === 'queueAbnormal' || alert.type === 'waitTimeout') && (
                    <>
                      <View className={styles.actionBtn} onClick={() => handleAlert(alert)}>
                        <Text>稍后处理</Text>
                      </View>
                      <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={() => handleAction(alert, 'switch')}>
                        <Text>切换高周转</Text>
                      </View>
                    </>
                  )}
                  {alert.type === 'managerAuth' && (
                    <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={() => handleAction(alert, 'authorize')}>
                      <Text>立即授权</Text>
                    </View>
                  )}
                  {alert.type === 'pileFault' && (
                    <View className={classnames(styles.actionBtn, styles.actionBtnWarning)} onClick={() => handleAction(alert, 'dispatch')}>
                      <Text>派发维修</Text>
                    </View>
                  )}
                  {alert.type === 'powerDrop' && (
                    <View className={styles.actionBtn} onClick={() => handleAlert(alert)}>
                      <Text>我知道了</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default AlertsPage;
