import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import PileCard from '@/components/PileCard';
import { mockZoneStats } from '@/data/mockDashboard';
import { useChargeStore } from '@/store/useChargeStore';
import type { ChargingPile } from '@/types';

type FilterType = 'all' | 'charging' | 'idle' | 'occupied' | 'fast' | 'slow';

const HeatmapPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedPileId, setSelectedPileId] = useState<string | null>(null);
  const storePiles = useChargeStore(s => s.piles);
  const authorizePowerBoost = useChargeStore(s => s.authorizePowerBoost);
  const handleOccupancy = useChargeStore(s => s.handleOccupancy);

  const selectedPile = useMemo(
    () => storePiles.find(p => p.id === selectedPileId) || null,
    [storePiles, selectedPileId]
  );

  const pilesByZone = useMemo(() => {
    const grouped: Record<string, ChargingPile[]> = {};
    storePiles.forEach(pile => {
      if (!grouped[pile.zoneId]) grouped[pile.zoneId] = [];
      if (activeFilter === 'all') {
        grouped[pile.zoneId].push(pile);
      } else if (activeFilter === 'fast') {
        if (pile.vehicleType === 'fastCharge') grouped[pile.zoneId].push(pile);
      } else if (activeFilter === 'slow') {
        if (pile.vehicleType === 'slowCharge') grouped[pile.zoneId].push(pile);
      } else if (pile.status === activeFilter) {
        grouped[pile.zoneId].push(pile);
      }
    });
    return grouped;
  }, [activeFilter, storePiles]);

  const summary = useMemo(() => {
    return {
      total: storePiles.length,
      charging: storePiles.filter(p => p.status === 'charging').length,
      idle: storePiles.filter(p => p.status === 'idle').length,
      occupied: storePiles.filter(p => p.status === 'occupied').length,
      fast: storePiles.filter(p => p.vehicleType === 'fastCharge').length,
      slow: storePiles.filter(p => p.vehicleType === 'slowCharge').length
    };
  }, [storePiles]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'charging', label: '充电中' },
    { key: 'idle', label: '空闲' },
    { key: 'occupied', label: '空占' },
    { key: 'fast', label: '短停快补' },
    { key: 'slow', label: '长停慢充' }
  ];

  const handlePileClick = (pile: ChargingPile) => {
    setSelectedPileId(pile.id);
  };

  const closeModal = () => {
    setSelectedPileId(null);
  };

  const handleHandleOccupancy = () => {
    if (!selectedPileId) return;
    handleOccupancy(selectedPileId, 'm1', '张经理');
    Taro.showToast({ title: '已通知现场人员处置', icon: 'success' });
    closeModal();
  };

  const handleAuthorizeBoost = () => {
    if (!selectedPileId) return;
    authorizePowerBoost(selectedPileId, 'm1', '张经理');
    Taro.showToast({ title: '已授权提功率', icon: 'success' });
  };

  const getZoneBadgeClass = (zoneId: string) => {
    const stat = mockZoneStats.find(z => z.zoneId === zoneId);
    if (!stat) return '';
    if (stat.busynessLevel >= 85) return styles.zoneBadgeBusy;
    if (stat.busynessLevel >= 60) return styles.zoneBadgeMid;
    return '';
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
          </View>
        ))}
      </View>

      <View className={styles.summaryBar}>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueBlue)}>{summary.total}</Text>
          <Text className={styles.summaryLabel}>总桩数</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueGreen)}>{summary.charging}</Text>
          <Text className={styles.summaryLabel}>充电中</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={styles.summaryValue}>{summary.idle}</Text>
          <Text className={styles.summaryLabel}>空闲</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueOrange)}>{summary.occupied}</Text>
          <Text className={styles.summaryLabel}>空占</Text>
        </View>
        <View className={styles.summaryItem}>
          <Text className={classnames(styles.summaryValue, styles.summaryValueRed)}>{summary.fast}</Text>
          <Text className={styles.summaryLabel}>快补</Text>
        </View>
      </View>

      <View className={styles.legend}>
        <Text className={styles.legendTitle}>状态图例</Text>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: '#1677FF' }} />
          <Text>充电中</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: '#00B42A' }} />
          <Text>空闲</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: '#FF7D00' }} />
          <Text>空占</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: '#F53F3F' }} />
          <Text>故障</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: '#7B61FF' }} />
          <Text>VIP</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ background: '#FF7D00' }} />
          <Text>快补车辆</Text>
        </View>
      </View>

      {Object.entries(pilesByZone).map(([zoneId, piles]) => {
        if (piles.length === 0) return null;
        const zoneStat = mockZoneStats.find(z => z.zoneId === zoneId);
        return (
          <View key={zoneId} className={styles.zoneSection}>
            <View className={styles.zoneHeader}>
              <Text className={styles.zoneTitle}>{zoneStat?.zoneName || zoneId + '区'}</Text>
              <View className={classnames(styles.zoneBadge, getZoneBadgeClass(zoneId))}>
                <Text>繁忙度 {zoneStat?.busynessLevel || 0}%</Text>
              </View>
            </View>
            <View className={styles.pileGrid}>
              {piles.map(pile => (
                <PileCard key={pile.id} pile={pile} onClick={() => handlePileClick(pile)} />
              ))}
            </View>
          </View>
        );
      })}

      {selectedPile && (
        <>
          <View className={styles.mask} onClick={closeModal} />
          <View className={styles.detailModal}>
            <View className={styles.modalHandle} />
            <Text className={styles.modalTitle}>{selectedPile.name} 详情</Text>
            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>状态</Text>
              <Text className={styles.modalValue}>
                {selectedPile.status === 'charging' && '充电中'}
                {selectedPile.status === 'idle' && '空闲'}
                {selectedPile.status === 'occupied' && '空占待处置'}
                {selectedPile.status === 'fault' && '故障'}
                {selectedPile.status === 'reserved' && '预留'}
              </Text>
            </View>
            {selectedPile.plateNumber && (
              <View className={styles.modalRow}>
                <Text className={styles.modalLabel}>车牌号</Text>
                <Text className={styles.modalValue}>{selectedPile.plateNumber}</Text>
              </View>
            )}
            {selectedPile.status === 'charging' && (
              <>
                <View className={styles.modalRow}>
                  <Text className={styles.modalLabel}>当前功率</Text>
                  <Text className={styles.modalValue}>{selectedPile.currentPower} / {selectedPile.maxPower} kW</Text>
                </View>
                <View className={styles.modalRow}>
                  <Text className={styles.modalLabel}>已充电量</Text>
                  <Text className={styles.modalValue}>{selectedPile.chargedKwh?.toFixed(1)} kWh</Text>
                </View>
                <View className={styles.modalRow}>
                  <Text className={styles.modalLabel}>开始时间</Text>
                  <Text className={styles.modalValue}>{selectedPile.startTime}</Text>
                </View>
                <View className={styles.modalRow}>
                  <Text className={styles.modalLabel}>预计结束</Text>
                  <Text className={styles.modalValue}>{selectedPile.estimatedEnd}</Text>
                </View>
                <View className={styles.modalRow}>
                  <Text className={styles.modalLabel}>车辆类型</Text>
                  <Text className={styles.modalValue}>
                    {selectedPile.vehicleType === 'fastCharge' && '短停快补'}
                    {selectedPile.vehicleType === 'slowCharge' && '长停慢充'}
                    {selectedPile.vehicleType === 'vip' && 'VIP车辆'}
                    {selectedPile.vehicleType === 'accessible' && '无障碍车辆'}
                  </Text>
                </View>
              </>
            )}
            {selectedPile.isVip && (
              <View className={styles.modalRow}>
                <Text className={styles.modalLabel}>VIP保障</Text>
                <Text className={styles.modalValue}>最低60kW预留</Text>
              </View>
            )}

            <View className={styles.modalActions}>
              <View className={styles.modalBtn} onClick={closeModal}>
                <Text>关闭</Text>
              </View>
              {selectedPile.status === 'occupied' && (
                <View className={classnames(styles.modalBtn, styles.modalBtnWarning)} onClick={handleHandleOccupancy}>
                  <Text>通知处置</Text>
                </View>
              )}
              {selectedPile.status === 'charging' && (
                <View className={classnames(styles.modalBtn, styles.modalBtnPrimary)} onClick={handleAuthorizeBoost}>
                  <Text>授权提功率</Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default HeatmapPage;
