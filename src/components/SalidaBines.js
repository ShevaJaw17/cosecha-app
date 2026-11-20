import React, { useEffect, useState } from 'react';
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

const STORAGE_KEY = '@cosecha_app_salida_bines';

const initialForm = {
  chofer: '',
  placaTractor: '',
  numBines: '',
  loteOrigen: '',
  destino: 'Planta de Empaque',
  observaciones: '',
};

export default function SalidaBines() {
  const [form, setForm] = useState(initialForm);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch (error) {
        console.warn('Error al cargar salidas:', error);
      }
    };
    loadHistory();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const registrarSalida = async () => {
    if (!form.numBines.trim() || !form.loteOrigen.trim()) {
      Alert.alert('Campos requeridos', 'Por favor ingresa la cantidad de bines y el lote de origen.');
      return;
    }

    const registro = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...form,
    };

    const nextHistory = [registro, ...history];
    setHistory(nextHistory);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      Alert.alert('Salida registrada', `Se registraron ${form.numBines} bines para ${form.destino}.`);
      setForm((prev) => ({ ...prev, numBines: '', observaciones: '' }));
    } catch (_error) {
      Alert.alert('Error', 'No se pudo guardar la salida.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>🚜 SALIDA DE BINES / CAJONES</Text>
        <Text style={styles.headerSubtitle}>
          Control de despacho y movimiento de contenedores desde campo
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>REGISTRAR SALIDA</Text>

        <View style={styles.rowGroup}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>LOTE DE ORIGEN</Text>
            <TextInput
              style={styles.input}
              value={form.loteOrigen}
              onChangeText={(v) => updateField('loteOrigen', v)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldFlex}>
            <Text style={styles.label}>CANTIDAD DE BINES</Text>
            <TextInput
              style={styles.input}
              value={form.numBines}
              onChangeText={(v) => updateField('numBines', v)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.rowGroup}>
          <View style={styles.fieldFlex}>
            <Text style={styles.label}>OPERADOR / CHOFER</Text>
            <TextInput
              style={styles.input}
              value={form.chofer}
              onChangeText={(v) => updateField('chofer', v)}
            />
          </View>

          <View style={styles.fieldFlex}>
            <Text style={styles.label}># TRACTOR / PLACA</Text>
            <TextInput
              style={styles.input}
              value={form.placaTractor}
              onChangeText={(v) => updateField('placaTractor', v)}
            />
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.label}>DESTINO</Text>
          <View style={styles.pillContainer}>
            {['Planta de Empaque', 'Acopio Temporal', 'Mercado Local', 'Otro'].map((dest) => (
              <Pressable
                key={dest}
                style={[styles.pill, form.destino === dest && styles.pillSelected]}
                onPress={() => updateField('destino', dest)}
              >
                <Text style={[styles.pillText, form.destino === dest && styles.pillTextSelected]}>
                  {dest}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.fieldSection}>
          <Text style={styles.label}>OBSERVACIONES</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.observaciones}
            onChangeText={(v) => updateField('observaciones', v)}
            multiline
            numberOfLines={2}
          />
        </View>

        <Pressable style={styles.saveBtn} onPress={registrarSalida}>
          <Text style={styles.saveBtnText}>📦 REGISTRAR SALIDA DE BINES</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>HISTORIAL DE DESPACHOS</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No hay salidas de bines registradas.</Text>
        ) : (
          history.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemTitle}>📦 {item.numBines} Bines • Destino: {item.destino}</Text>
              <Text style={styles.itemMeta}>📍 Lote Origen: {item.loteOrigen} | Chofer: {item.chofer || '-'}</Text>
              <Text style={styles.itemMeta}>📅 {new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          ))
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
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
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
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  fieldFlex: {
    flex: 1,
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
    minHeight: 50,
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
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },
  itemMeta: {
    fontSize: 11,
    color: '#444444',
    marginTop: 2,
  },
});
