import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { alertTypeLabels, alertLevelColors } from '@/data/mockAlerts';
import { useChargeStore } from '@/store/useChargeStore';
import type { AlertItem, AlertLevel, AlertType } from '@/types';

type FilterKey = 'all' | 'unhandled' | AlertType;

const AlertsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());

  const storeAlerts = useChargeStore(s => s.alerts);
  const handleAlertStore = useChargeStore(s => s.handleAlert);
  const addIntervention = useChargeStore(s => s.addIntervention);
  const setActiveStrategy = useChargeStore(s => s.setActiveStrategy);
  const authorizePowerBoost = useChargeStore(s => s.authorizePowerBoost);
  const batchHandleAlertsAndSwitch = useChargeStore(s => s.batchHandleAlertsAndSwitch);

  const stats = useMemo(() => {
    return {
      total: storeAlerts.length,
      critical: storeAlerts.filter(a => a.level === 'critical' && !a.isHandled).length,
      warning: storeAlerts.filter(a => a.level === 'warning' && !a.isHandled).length,
      info: storeAlerts.filter(a => a.level === 'info' && !a.isHandled).length,
      unhandled: storeAlerts.filter(a => !a.isHandled).length
    };
  }, [storeAlerts]);

  const filters: { key: FilterKey; label: string; count?: number }[] = [
    { key: 'all', label: '全部', count: stats.total },
    { key: 'unhandled', label: '待处理', count: stats.unhandled },
    { key: 'powerOverload', label: '负荷超限' },
    { key: 'emptyOccupancy', label: '空占车位' },
    { key: 'waitTimeout', label: '等待超时' },
    { key: 'managerAuth', label: '授权请求' }
  ];

  const batchEligibleAlerts = useMemo(() => {
    return storeAlerts.filter(a =>
      !a.isHandled &&
      (a.type === 'waitTimeout' || a.type === 'queueAbnormal' || a.type === 'powerOverload')
    );
  }, [storeAlerts]);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return storeAlerts;
    if (activeFilter === 'unhandled') return storeAlerts.filter(a => !a.isHandled);
    return storeAlerts.filter(a => a.type === activeFilter);
  }, [activeFilter, storeAlerts]);

  const isAlertSelected = (alertId: string) => selectedAlertIds.has(alertId);

  const toggleAlertSelect = (alertId: string) => {
    const alert = storeAlerts.find(a => a.id === alertId);
    if (!alert || alert.isHandled) return;
    if (alert.type !== 'waitTimeout' && alert.type !== 'queueAbnormal' && alert.type !== 'powerOverload') {
      Taro.showToast({ title: '该告警暂不支持批量处理', icon: 'none' });
      return;
    }
    setSelectedAlertIds(prev => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  const handleToggleBatchMode = () => {
    if (batchMode) {
      setBatchMode(false);
      setSelectedAlertIds(new Set());
    } else {
      if (batchEligibleAlerts.length === 0) {
        Taro.showToast({ title: '暂无可批量处理的告警', icon: 'none' });
        return;
      }
      setBatchMode(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedAlertIds.size === batchEligibleAlerts.length) {
      setSelectedAlertIds(new Set());
    } else {
      const allIds = new Set(batchEligibleAlerts.map(a => a.id));
      setSelectedAlertIds(allIds);
    }
  };

  const handleBatchSwitch = () => {
    if (selectedAlertIds.size === 0) {
      Taro.showToast({ title: '请选择要处理的告警', icon: 'none' });
      return;
    }
    const alertIds = Array.from(selectedAlertIds);
    batchHandleAlertsAndSwitch(alertIds, 'highTurnover', 'm1', '张经理');
    Taro.showToast({ title: `已处理${alertIds.length}条告警`, icon: 'success' });
    setSelectedAlertIds(new Set());
    setBatchMode(false);
  };

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
  };

  const handleSwitchHighTurnover = (alert: AlertItem) => {
    setActiveStrategy('highTurnover', 'm1', '张经理', 'alert', [alert.id]);
    handleAlertStore(alert.id);
    addIntervention({
      operatorId: 'm1',
      operatorName: '张经理',
      action: '切换策略',
      description: `因告警「${alert.title}」，从告警页切换至「高周转模式」`,
      pileId: alert.pileId,
      zoneId: alert.zoneId
    });
    Taro.showToast({ title: '已切换至高周转模式', icon: 'success' });
  };

  const handleAuthorize = (alert: AlertItem) => {
    if (alert.pileId) {
      authorizePowerBoost(alert.pileId, 'm1', '张经理');
    }
    handleAlertStore(alert.id);
    Taro.showToast({ title: '已授权临时提功率', icon: 'success' });
  };

  const handleDispatch = (alert: AlertItem) => {
    handleAlertStore(alert.id);
    addIntervention({
      operatorId: 'm1',
      operatorName: '张经理',
      action: '派发人员',
      description: `派发现场人员处理「${alert.title}」`,
      pileId: alert.pileId,
      zoneId: alert.zoneId
    });
    Taro.showToast({ title: '已派发现场人员', icon: 'success' });
  };

  const getBatchEligible = (alert: AlertItem) => {
    return !alert.isHandled &&
      (alert.type === 'waitTimeout' || alert.type === 'queueAbnormal' || alert.type === 'powerOverload');
  };

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
        <View
          className={classnames(styles.batchToggleBtn, batchMode && styles.batchToggleBtnActive)}
          onClick={handleToggleBatchMode}
        >
          <Text>{batchMode ? '取消' : '批量'}</Text>
        </View>
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
          filteredAlerts.map(alert => {
            const selected = isAlertSelected(alert.id);
            const canBatch = getBatchEligible(alert);
            return (
              <View
                key={alert.id}
                className={classnames(
                  styles.alertCard,
                  getAlertClass(alert.level),
                  alert.isHandled && styles.alertHandled,
                  batchMode && !canBatch && styles.cardDisabled
                )}
                onClick={() => batchMode && canBatch && toggleAlertSelect(alert.id)}
              >
                {batchMode && (
                  <View
                    className={classnames(
                      styles.checkbox,
                      selected && styles.checkboxChecked
                    )}
                  >
                    {selected && <Text>✓</Text>}
                  </View>
                )}
                <View className={styles.cardContent}>
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
                  {!alert.isHandled && !batchMode && (
                    <View className={styles.actionRow}>
                      {alert.type === 'emptyOccupancy' && (
                        <>
                          <View className={styles.actionBtn} onClick={() => handleDispatch(alert)}>
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
                          <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={() => handleSwitchHighTurnover(alert)}>
                            <Text>切换高周转</Text>
                          </View>
                        </>
                      )}
                      {alert.type === 'managerAuth' && (
                        <View className={classnames(styles.actionBtn, styles.actionBtnPrimary)} onClick={() => handleAuthorize(alert)}>
                          <Text>立即授权</Text>
                        </View>
                      )}
                      {alert.type === 'pileFault' && (
                        <View className={classnames(styles.actionBtn, styles.actionBtnWarning)} onClick={() => handleDispatch(alert)}>
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
              </View>
            );
          })
        )}
      </View>

      {batchMode && (
        <View className={styles.batchBar}>
          <View className={styles.batchInfo}>
            <Text>已选择 <Text className={styles.batchCount}>{selectedAlertIds.size}</Text> 条</Text>
            <Text style={{ marginLeft: 16, fontSize: 24, color: '#86909C' }}
              onClick={handleSelectAll}>
              {selectedAlertIds.size === batchEligibleAlerts.length ? '取消全选' : '全选'}
            </Text>
          </View>
          <View className={styles.batchActions}>
            <View className={styles.batchBtn} onClick={handleToggleBatchMode}>
              <Text>取消</Text>
            </View>
            <View
              className={classnames(styles.batchBtn, styles.batchBtnPrimary)}
              onClick={handleBatchSwitch}
            >
              <Text>批量切换高周转</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AlertsPage;
