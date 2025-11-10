import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type StatusTab = 'accepted' | 'pending' | 'completed' | 'cancelled';

interface StatusTabsProps {
  activeTab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
  tabs: Array<{ key: StatusTab; label: string }>;
}

export default function StatusTabs({ activeTab, onTabChange, tabs }: StatusTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.activeTabButtonText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeTabButton: {
    backgroundColor: '#D32F2F',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
});

