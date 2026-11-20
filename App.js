import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, StatusBar } from 'react-native';
import ReciboFruta from './src/components/ReciboFruta';
import ReporteDanos from './src/components/ReporteDanos';
import SalidaBines from './src/components/SalidaBines';

export default function App() {
  const [activeTab, setActiveTab] = useState('danos'); // Default to damage report requested by user or receipts

  const tabs = [
    { id: 'recibo', label: '📄 Recibo Fruta' },
    { id: 'danos', label: '⚠️ Reporte Daños' },
    { id: 'bines', label: '🚜 Salida Bines' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#143b22" />

      {/* Header App */}
      <View style={styles.appHeader}>
        <Text style={styles.appTitle}>PROYECTO COSECHA</Text>
        <Text style={styles.appSubtitle}>Sistema Móvil de Gestión Agrícola</Text>
      </View>

      {/* Tabs Nav */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content View */}
      <View style={styles.contentContainer}>
        {activeTab === 'recibo' && <ReciboFruta />}
        {activeTab === 'danos' && <ReporteDanos />}
        {activeTab === 'bines' && <SalidaBines />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#143b22',
  },
  appHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#143b22',
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  appSubtitle: {
    color: '#a3d9b1',
    fontSize: 11,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1b4d2e',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#c5d0b5',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c8e6c9',
  },
  tabTextActive: {
    color: '#143b22',
    fontWeight: '900',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#c5d0b5',
  },
});
