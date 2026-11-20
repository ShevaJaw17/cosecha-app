import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const STORAGE_KEY = '@cosecha_app_danos_herramientas';

const HERRAMIENTAS = [
  'Carreta',
  'Bin / Cajón',
  'Cosechadora',
  'Tractor',
  'Otra',
];

const TIPOS_DANO = [
  'Mecánico',
  'Eléctrico',
  'Hidráulico',
  'Desgaste',
  'Estructural',
  'Neumático',
  'Otro',
];

const SEVERIDADES = [
  { id: 'Baja', label: 'Baja', color: '#2e7d32', bg: '#e8f5e9' },
  { id: 'Media', label: 'Media', color: '#ed6c02', bg: '#fff3e0' },
  { id: 'Alta', label: 'Alta', color: '#d32f2f', bg: '#ffebee' },
  { id: 'Crítica', label: 'Crítica', color: '#9c27b0', bg: '#f3e5f5' },
];

const initialForm = {
  inspector: 'Ader',
  herramienta: 'Carreta',
  codigoEquipo: '',
  operador: '',
  tipoDano: 'Mecánico',
  severidad: 'Baja',
  observaciones: '',
};

export default function ReporteDanos() {
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setHistory(JSON.parse(raw));
        }
      } catch (error) {
        console.warn('Error al cargar historial de daños:', error);
      }
    };
    loadHistory();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const guardarReporte = async () => {
    if (!form.herramienta.trim()) {
      Alert.alert('Campo requerido', 'Por favor selecciona la herramienta dañada.');
      return;
    }

    const nuevoReporte = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...form,
    };

    const nextHistory = [nuevoReporte, ...history];
    setHistory(nextHistory);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      Alert.alert('Éxito', 'Reporte de daño registrado correctamente.');
      setForm((prev) => ({
        ...prev,
        codigoEquipo: '',
        operador: '',
        observaciones: '',
      }));
    } catch (_error) {
      Alert.alert('Error', 'No se pudo guardar el reporte.');
    }
  };

  const eliminarReporte = async (id) => {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    } catch (error) {
      console.warn('Error al eliminar reporte:', error);
    }
  };

  const limpiarTodo = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar todo el historial de daños?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setHistory([]);
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
            } catch (error) {
              console.warn('Error al limpiar historial:', error);
            }
          },
        },
      ]
    );
  };

  const resumenSeveridades = useMemo(() => {
    const counts = { Baja: 0, Media: 0, Alta: 0, Crítica: 0 };
    history.forEach((item) => {
      if (counts[item.severidad] !== undefined) {
        counts[item.severidad] += 1;
      }
    });
    return counts;
  }, [history]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>🛠️ REPORTE DE DAÑOS EN HERRAMIENTAS</Text>
        <Text style={styles.headerSubtitle}>
          Registro de daños en carretas, bines, cosechadora, tractor y otros equipos
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>NUEVO REPORTE</Text>

        <View style={styles.rowGroup}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>INSPECTOR / REPORTA</Text>
            <TextInput
              style={styles.input}
              value={form.inspector}
              onChangeText={(v) => updateField('inspector', v)}
            />
          </View>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>OPERADOR A CARGO</Text>
            <TextInput
              style={styles.input}
              value={form.operador}
              onChangeText={(v) => updateField('operador', v)}
            />
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.label}>HERRAMIENTA DAÑADA</Text>
          <View style={styles.pillContainer}>
            {HERRAMIENTAS.map((h) => {
              const selected = form.herramienta === h;
              return (
                <Pressable
                  key={h}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => updateField('herramienta', h)}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {h}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldFlex}>
          <Text style={styles.label}>CÓDIGO / ID DEL EQUIPO</Text>
          <TextInput
            style={styles.input}
            value={form.codigoEquipo}
            onChangeText={(v) => updateField('codigoEquipo', v)}
            placeholder="Ej: TR-4502, CR-12"
          />
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.label}>TIPO DE DAÑO</Text>
          <View style={styles.pillContainer}>
            {TIPOS_DANO.map((tipo) => {
              const selected = form.tipoDano === tipo;
              return (
                <Pressable
                  key={tipo}
                  style={[styles.pill, selected && styles.pillSelected]}
                  onPress={() => updateField('tipoDano', tipo)}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                    {tipo}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.label}>NIVEL DE SEVERIDAD</Text>
          <View style={styles.severityRow}>
            {SEVERIDADES.map((sev) => {
              const selected = form.severidad === sev.id;
              return (
                <Pressable
                  key={sev.id}
                  style={[
                    styles.severityBtn,
                    { backgroundColor: sev.bg, borderColor: sev.color },
                    selected && { borderWidth: 2.5, backgroundColor: sev.color },
                  ]}
                  onPress={() => updateField('severidad', sev.id)}
                >
                  <Text
                    style={[
                      styles.severityBtnText,
                      { color: sev.color },
                      selected && { color: '#ffffff', fontWeight: 'bold' },
                    ]}
                  >
                    {sev.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.label}>DESCRIPCIÓN / OBSERVACIONES</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.observaciones}
            onChangeText={(v) => updateField('observaciones', v)}
            multiline
            numberOfLines={3}
            placeholder="Describe el daño, causa probable y estado del equipo..."
          />
        </View>

        <Pressable style={styles.saveBtn} onPress={guardarReporte}>
          <Text style={styles.saveBtnText}>💾 GUARDAR REPORTE DE DAÑO</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>RESUMEN DE DAÑOS REGISTRADOS</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{history.length}</Text>
            <Text style={styles.summaryLabel}>Total Reportes</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[styles.summaryNumber, { color: '#2e7d32' }]}>{resumenSeveridades.Baja}</Text>
            <Text style={styles.summaryLabel}>Baja</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.summaryNumber, { color: '#ed6c02' }]}>{resumenSeveridades.Media}</Text>
            <Text style={styles.summaryLabel}>Media</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#ffebee' }]}>
            <Text style={[styles.summaryNumber, { color: '#d32f2f' }]}>{resumenSeveridades.Alta}</Text>
            <Text style={styles.summaryLabel}>Alta</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#f3e5f5' }]}>
            <Text style={[styles.summaryNumber, { color: '#9c27b0' }]}>{resumenSeveridades.Crítica}</Text>
            <Text style={styles.summaryLabel}>Crítica</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>HISTORIAL DE REPORTES</Text>
          {history.length > 0 && (
            <Pressable onPress={limpiarTodo}>
              <Text style={styles.clearLink}>Limpiar Todo</Text>
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>No hay reportes de daños registrados.</Text>
        ) : (
          history.map((item) => {
            const sevInfo = SEVERIDADES.find((s) => s.id === item.severidad) || SEVERIDADES[0];
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle}>{item.herramienta}</Text>
                    <View style={[styles.badge, { backgroundColor: sevInfo.bg, borderColor: sevInfo.color }]}>
                      <Text style={[styles.badgeText, { color: sevInfo.color }]}>
                        {item.severidad}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => eliminarReporte(item.id)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </Pressable>
                </View>

                <Text style={styles.itemMeta}>
                  🔧 Tipo: <Text style={styles.bold}>{item.tipoDano}</Text>
                  {item.codigoEquipo ? ` | Código: ${item.codigoEquipo}` : ''}
                </Text>
                <Text style={styles.itemMeta}>
                  👤 Reportó: {item.inspector}
                  {item.operador ? ` | Operador: ${item.operador}` : ''}
                </Text>
                <Text style={styles.itemMeta}>
                  📅 {new Date(item.createdAt).toLocaleString()}
                </Text>

                {item.observaciones ? (
                  <View style={styles.obsBox}>
                    <Text style={styles.obsText}>&quot;{item.observaciones}&quot;</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5d0b5',
  },
  content: {
    padding: 14,
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#1b4d2e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#c8e6c9',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1c1c1c',
    padding: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  fieldFlex: {
    flex: 1,
    marginBottom: 12,
  },
  fieldSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1c1c1c',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: '#fcfcfc',
    color: '#111111',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f5f5f5',
  },
  pillSelected: {
    backgroundColor: '#1b4d2e',
    borderColor: '#1b4d2e',
  },
  pillText: {
    fontSize: 11,
    color: '#333333',
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
  },
  severityBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#1b4d2e',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111111',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#555555',
    fontWeight: '700',
    marginTop: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearLink: {
    fontSize: 11,
    color: '#d32f2f',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  deleteBtn: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888888',
    paddingHorizontal: 4,
  },
  itemMeta: {
    fontSize: 11,
    color: '#444444',
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
    color: '#111111',
  },
  obsBox: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#f0f4f1',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#1b4d2e',
  },
  obsText: {
    fontSize: 11,
    color: '#333333',
    fontStyle: 'italic',
  },
});
