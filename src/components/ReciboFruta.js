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

const initialRows = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  tamano: '',
  color: '',
  trans: '',
  golInc: '',
  golSev: '',
  sem: '',
  mord: '',
  ifc: '',
  larCor: '',
  larFtr: '',
  mb: '',
  ss: '',
  enf: '',
}));

const defaultForm = {
  rate: '3116',
  place: '24',
  encargado: 'Ader',
  turno: '11',
  lote: '25549',
  block: '139',
  grupo: 'N2',
  cant: '1',
  pase: '1',
  prem: '',
  asm: '',
  p1: '1',
  p2: '',
  p3: '',
  p4: '',
  p5: '',
  p6: '',
  p7: '',
  p8: '',
  fecha1: '06/11',
  hora1: '12:15',
  fecha2: '06/11',
  hora2: '16:00',
  tractor: '4502',
  operario: 'Ader',
  option: '1',
  colorBajo: '0',
  colorNormal: '0',
  colorAlto: '0',
  observacion: '',
};

const STORAGE_KEY = '@cosecha_app_receipts';

const columns = [
  { key: 'tamano', label: 'TAMAÑO' },
  { key: 'color', label: 'COLOR' },
  { key: 'trans', label: 'TRANS' },
  { key: 'golInc', label: 'GOL-INC' },
  { key: 'golSev', label: 'GOL-SEV' },
  { key: 'sem', label: 'SEM' },
  { key: 'mord', label: 'MORD' },
  { key: 'ifc', label: 'IFC' },
  { key: 'larCor', label: 'LAR. COR.' },
  { key: 'larFtr', label: 'LAR. FTR.' },
  { key: 'mb', label: 'MB' },
  { key: 'ss', label: 'SS' },
  { key: 'enf', label: 'ENF' },
];

function Field({ label, value, onChangeText, width = 90, multiline = false, style }) {
  return (
    <View style={[styles.fieldBlock, { width }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

export default function ReciboFruta() {
  const [form, setForm] = useState(defaultForm);
  const [rows, setRows] = useState(initialRows);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        setHistory(JSON.parse(raw));
      } catch (error) {
        console.warn('No se pudo cargar historial', error);
      }
    };

    loadHistory();
  }, []);

  const totals = useMemo(() => {
    const agregados = columns.reduce((acc, column) => {
      acc[column.key] = rows.reduce((sum, row) => {
        const value = Number(row[column.key] || 0);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);
      return acc;
    }, {});

    return {
      ...agregados,
      registros: rows.filter((row) => Object.values(row).some((value) => String(value).trim() !== '')).length,
    };
  }, [rows]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateRow = (id, key, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const guardarFormulario = async () => {
    const nombre = form.operario || 'operador';
    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      form,
      rows,
      totals,
    };

    const nextHistory = [entry, ...history];
    setHistory(nextHistory);
    setSaved(true);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      Alert.alert('Recibo guardado', `Se registró la información para ${nombre}.`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar localmente el recibo.');
      console.warn(error);
    }
  };

  const limpiarHistorial = async () => {
    setHistory([]);
    setSaved(false);

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      Alert.alert('Historial limpio', 'Se eliminaron los registros guardados.');
    } catch (_error) {
      Alert.alert('Error', 'No se pudo borrar el historial.');
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={styles.paper}>
        <Text style={styles.title}>FORMULA PARA RECIBO DE FRUTA (Variedad: MD2)</Text>

        <View style={styles.topGrid}>
          <View style={styles.leftColumn}>
            <View style={styles.inlineFieldRow}>
              <Field label="# CRATE" value={form.rate} onChangeText={(v) => updateField('rate', v)} width={120} />
              <Field label="# PLACA" value={form.place} onChangeText={(v) => updateField('place', v)} width={110} />
            </View>

            <View style={styles.inlineFieldRow}>
              <Field label="ENCARGADO" value={form.encargado} onChangeText={(v) => updateField('encargado', v)} width={150} />
              <Field label="TURNO" value={form.turno} onChangeText={(v) => updateField('turno', v)} width={80} />
            </View>

            <View style={styles.inlineFieldRow}>
              <Field label="# PASE" value={form.pase} onChangeText={(v) => updateField('pase', v)} width={78} />
              <Field label="PREM" value={form.prem} onChangeText={(v) => updateField('prem', v)} width={70} />
              <Field label="ASM" value={form.asm} onChangeText={(v) => updateField('asm', v)} width={70} />
            </View>
          </View>

          <View style={styles.centerColumn}>
            <View style={styles.inlineFieldRow}>
              <Field label="LOTE" value={form.lote} onChangeText={(v) => updateField('lote', v)} width={140} />
              <Field label="BLOCK" value={form.block} onChangeText={(v) => updateField('block', v)} width={120} />
            </View>
            <View style={styles.inlineFieldRow}>
              <Field label="GRUPO" value={form.grupo} onChangeText={(v) => updateField('grupo', v)} width={110} />
              <Field label="CANT." value={form.cant} onChangeText={(v) => updateField('cant', v)} width={90} />
            </View>
            <View style={styles.inlineFieldRow}>
              <Field label="P1" value={form.p1} onChangeText={(v) => updateField('p1', v)} width={60} />
              <Field label="P2" value={form.p2} onChangeText={(v) => updateField('p2', v)} width={60} />
              <Field label="P3" value={form.p3} onChangeText={(v) => updateField('p3', v)} width={60} />
              <Field label="P4" value={form.p4} onChangeText={(v) => updateField('p4', v)} width={60} />
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.inlineFieldRow}>
              <Field label="COSECHA" value={form.fecha1} onChangeText={(v) => updateField('fecha1', v)} width={125} />
              <Field label="RECHAZO PARCIAL" value={form.fecha2} onChangeText={(v) => updateField('fecha2', v)} width={145} />
            </View>
            <View style={styles.inlineFieldRow}>
              <Field label="OPCION" value={form.option} onChangeText={(v) => updateField('option', v)} width={120} />
            </View>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeaderCell}>#</Text>
            {columns.map((column) => (
              <Text key={column.key} style={styles.tableHeaderCellLong}>{column.label}</Text>
            ))}
          </View>

          {rows.map((row) => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.rowNumber}>{row.id}</Text>
              {columns.map((column) => (
                <TextInput
                  key={`${row.id}-${column.key}`}
                  style={styles.gridInput}
                  value={row[column.key]}
                  onChangeText={(value) => updateRow(row.id, column.key, value)}
                  keyboardType="numeric"
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.smallCards}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateTitle}>FECHA / HORA</Text>
              <View style={styles.dateFields}>
                <Field label="FECHA Y HORA DE COSECHA" value={form.fecha1} onChangeText={(v) => updateField('fecha1', v)} width={180} />
                <Field label="FECHA Y HORA DE PROCESO" value={form.fecha2} onChangeText={(v) => updateField('fecha2', v)} width={180} />
              </View>
            </View>

            <View style={styles.statusBlock}>
              <Text style={styles.dateTitle}>COLOR</Text>
              <View style={styles.colorRow}>
                <Field label="Bajo" value={form.colorBajo} onChangeText={(v) => updateField('colorBajo', v)} width={80} />
                <Field label="Normal" value={form.colorNormal} onChangeText={(v) => updateField('colorNormal', v)} width={90} />
                <Field label="Alto" value={form.colorAlto} onChangeText={(v) => updateField('colorAlto', v)} width={80} />
              </View>
            </View>
          </View>

          <View style={styles.summaryBlock}>
            <Text style={styles.summaryTitle}>RESUMEN</Text>
            <Text style={styles.summaryText}>Registros activos: {totals.registros}</Text>
            <Text style={styles.summaryText}>Total de tamaños: {totals.tamano}</Text>
            <Text style={styles.summaryText}>Total de valores sem: {totals.sem}</Text>
            <Text style={styles.summaryText}>Total de daños: {totals.enf}</Text>
            <Pressable onPress={guardarFormulario} style={styles.saveButton}>
              <Text style={styles.saveText}>{saved ? 'Guardado' : 'Guardar recibo'}</Text>
            </Pressable>
            <Pressable onPress={limpiarHistorial} style={styles.clearButton}>
              <Text style={styles.clearText}>Limpiar historial</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>Historial local</Text>
          {history.length === 0 ? (
            <Text style={styles.historyEmpty}>No hay recibos guardados aún.</Text>
          ) : (
            history.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyItemText}>{item.form.operario || 'Operador'} • Lote {item.form.lote || '-'}</Text>
                <Text style={styles.historyItemMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerBox}>
            <Text style={styles.footerLabel}># TRACTOR</Text>
            <TextInput value={form.tractor} onChangeText={(v) => updateField('tractor', v)} style={styles.footerInput} />
          </View>
          <View style={styles.footerBoxWide}>
            <Text style={styles.footerLabel}>NOMBRE OPERADOR</Text>
            <TextInput value={form.operario} onChangeText={(v) => updateField('operario', v)} style={styles.footerInput} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#c5d0b5',
  },
  pageContent: {
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  paper: {
    backgroundColor: '#f7f7f5',
    borderWidth: 2,
    borderColor: '#1c1c1c',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginBottom: 12,
    color: '#111',
  },
  topGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  leftColumn: {
    flex: 1,
  },
  centerColumn: {
    flex: 1.2,
  },
  rightColumn: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  inlineFieldRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  fieldBlock: {
    borderWidth: 1,
    borderColor: '#1d1d1d',
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    fontSize: 14,
    color: '#111',
    minHeight: 22,
    textAlign: 'center',
  },
  tableContainer: {
    borderWidth: 1.5,
    borderColor: '#1d1d1d',
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#ecece8',
    borderBottomWidth: 1,
    borderColor: '#1d1d1d',
  },
  tableHeaderCell: {
    width: 30,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    borderRightWidth: 1,
    borderColor: '#1d1d1d',
  },
  tableHeaderCellLong: {
    width: 52,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '800',
    borderRightWidth: 1,
    borderColor: '#1d1d1d',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#1d1d1d',
    minHeight: 42,
  },
  rowNumber: {
    width: 30,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    borderRightWidth: 1,
    borderColor: '#1d1d1d',
    paddingVertical: 8,
  },
  gridInput: {
    width: 52,
    minHeight: 42,
    borderRightWidth: 1,
    borderColor: '#1d1d1d',
    textAlign: 'center',
    fontSize: 11,
    color: '#111',
  },
  bottomSection: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  smallCards: {
    flex: 1.5,
    gap: 8,
  },
  dateBlock: {
    borderWidth: 1,
    borderColor: '#1d1d1d',
    padding: 8,
    backgroundColor: '#fff',
  },
  statusBlock: {
    borderWidth: 1,
    borderColor: '#1d1d1d',
    padding: 8,
    backgroundColor: '#fff',
  },
  dateTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  dateFields: {
    gap: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryBlock: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: '#1d1d1d',
    backgroundColor: '#fff',
    padding: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 11,
    marginBottom: 4,
    color: '#222',
  },
  saveButton: {
    backgroundColor: '#1d5a2d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: '#8c2d2d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  clearText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  historyBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1d1d1d',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 14,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  historyEmpty: {
    fontSize: 11,
    color: '#555',
  },
  historyItem: {
    borderBottomWidth: 1,
    borderColor: '#e4e4e4',
    paddingVertical: 6,
  },
  historyItemText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyItemMeta: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  footerBox: {
    width: 150,
    borderWidth: 1,
    borderColor: '#1d1d1d',
    padding: 8,
    backgroundColor: '#fff',
  },
  footerBoxWide: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1d1d1d',
    padding: 8,
    backgroundColor: '#fff',
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  footerInput: {
    minHeight: 28,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111',
  },
});
