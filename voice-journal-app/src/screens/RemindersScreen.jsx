import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useJournal } from '../context/JournalContext';

const PRIORITY_STYLES = {
  high:   { bg: '#2e0d1a', color: '#f472b6', label: 'High' },
  medium: { bg: '#2a1800', color: '#fb923c', label: 'Med'  },
  low:    { bg: '#0d2318', color: '#4ade80', label: 'Low'  },
};

export default function RemindersScreen() {
  const { reminders, toggleReminder } = useJournal();
  const [filter, setFilter]           = useState('all');

  const pending   = reminders.filter(r => !r.done);
  const completed = reminders.filter(r => r.done);
  const shown     = filter === 'pending' ? pending : filter === 'done' ? completed : reminders;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.title}>Reminders</Text>
      <Text style={styles.subtitle}>Auto-extracted from your voice entries</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: reminders.length, label: 'Total',   bg: '#12122a' },
          { value: pending.length,   label: 'Pending',  bg: '#0d1e30' },
          { value: completed.length, label: 'Done',     bg: '#0d2318' },
          { value: reminders.filter(r => r.date === 'Today' && !r.done).length, label: 'Today', bg: '#2a1800' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {[['all', 'All'], ['pending', 'Pending'], ['done', 'Done']].map(([v, l]) => (
          <TouchableOpacity key={v} style={[styles.filterTab, filter === v && styles.filterTabActive]} onPress={() => setFilter(v)}>
            <Text style={[styles.filterTabText, filter === v && styles.filterTabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {shown.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>🔔</Text>
          <Text style={styles.emptyText}>
            {reminders.length === 0
              ? 'No reminders yet.\nRecord a voice entry and say "remind me to..."'
              : 'No reminders in this category.'}
          </Text>
        </View>
      ) : shown.map(item => (
        <TouchableOpacity key={item.id} style={[styles.remCard, item.done && styles.remCardDone]} onPress={() => toggleReminder(item.id)} activeOpacity={0.85}>
          <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
            {item.done && <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>✓</Text>}
          </View>
          <View style={styles.remInfo}>
            <View style={styles.remTop}>
              <Text style={[styles.remTask, item.done && styles.remTaskDone]} numberOfLines={1}>{item.task}</Text>
              {item.priority && (
                <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_STYLES[item.priority]?.bg ?? '#1e1e3a' }]}>
                  <Text style={[styles.priorityText, { color: PRIORITY_STYLES[item.priority]?.color ?? '#a78bfa' }]}>
                    {PRIORITY_STYLES[item.priority]?.label ?? 'Med'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.remMeta}>
              <Text style={styles.remTime}>🕐 {item.time} · {item.date}</Text>
              {item.source && <Text style={styles.remSource}>from {item.source}</Text>}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={{ fontSize: 16 }}>🤖</Text>
        <Text style={styles.infoText}>Say "remind me to..." in your voice entry to auto-add reminders here.</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0a0a1a' },
  content:            { padding: 16, paddingBottom: 30 },
  title:              { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 3 },
  subtitle:           { fontSize: 12, color: '#666', marginBottom: 14 },
  statsRow:           { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard:           { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statValue:          { fontSize: 18, fontWeight: '700', color: '#fff' },
  statLabel:          { fontSize: 9, color: '#666', marginTop: 2 },
  filterRow:          { flexDirection: 'row', backgroundColor: '#12122a', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  filterTab:          { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  filterTabActive:    { backgroundColor: '#6C47FF' },
  filterTabText:      { fontSize: 12, color: '#555' },
  filterTabTextActive:{ color: '#fff', fontWeight: '700' },
  remCard:            { backgroundColor: '#12122a', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  remCardDone:        { opacity: 0.45 },
  checkbox:           { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#6C47FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkboxDone:       { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
  remInfo:            { flex: 1 },
  remTop:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  remTask:            { fontSize: 14, fontWeight: '600', color: '#ddd', flex: 1 },
  remTaskDone:        { textDecorationLine: 'line-through', color: '#444' },
  priorityBadge:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  priorityText:       { fontSize: 10, fontWeight: '700' },
  remMeta:            { flexDirection: 'row', justifyContent: 'space-between' },
  remTime:            { fontSize: 11, color: '#555' },
  remSource:          { fontSize: 10, color: '#444', fontStyle: 'italic' },
  empty:              { alignItems: 'center', paddingVertical: 40 },
  emptyText:          { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 22 },
  infoBox:            { backgroundColor: '#12122a', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 8, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)' },
  infoText:           { fontSize: 12, color: '#a78bfa', lineHeight: 20, flex: 1 },
});


