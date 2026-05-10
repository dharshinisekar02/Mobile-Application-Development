import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useJournal } from '../context/JournalContext';

const MOOD_STYLES = {
  Happy:      { bg: '#0d2318', color: '#4ade80', emoji: '😄' },
  Calm:       { bg: '#0d1e30', color: '#60a5fa', emoji: '😌' },
  Anxious:    { bg: '#2a1800', color: '#fb923c', emoji: '😰' },
  Sad:        { bg: '#1a0d2e', color: '#c084fc', emoji: '😢' },
  Excited:    { bg: '#2a2200', color: '#facc15', emoji: '🤩' },
  Frustrated: { bg: '#2e0d1a', color: '#f472b6', emoji: '😤' },
};

const FILTERS = ['All', 'Happy', 'Calm', 'Anxious', 'Sad', 'Excited', 'Frustrated'];

export default function JournalScreen() {
  const { entries, deleteEntry } = useJournal();
  const [search, setSearch]      = useState('');
  const [filter, setFilter]      = useState('All');

  const filtered = entries.filter(e =>
    (filter === 'All' || e.mood === filter) &&
    (search === '' || e.diary_entry?.toLowerCase().includes(search.toLowerCase()))
  );

  const confirmDelete = (id) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.title}>Your Journal</Text>
      <Text style={styles.subtitle}>{entries.length} total entries</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 14, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: entries.length,  label: 'Total',   bg: '#0d1e30' },
          { value: entries.filter(e => e.mood === 'Happy').length, label: 'Happy Days', bg: '#0d2318' },
          { value: entries.reduce((a, e) => a + (e.transcript?.split(' ').length ?? 0), 0), label: 'Total Words', bg: '#2a2200' },
        ].map((s, i) => (
          <View key={i} style={[styles.miniStat, { backgroundColor: s.bg }]}>
            <Text style={styles.miniStatVal}>{s.value}</Text>
            <Text style={styles.miniStatLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Entries */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>📝</Text>
          <Text style={styles.emptyText}>{entries.length === 0 ? 'No entries yet. Record your first voice entry!' : 'No entries match your search.'}</Text>
        </View>
      ) : filtered.map(entry => {
        const m = MOOD_STYLES[entry.mood] ?? MOOD_STYLES.Calm;
        return (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryTop}>
              <View style={[styles.moodBadge, { backgroundColor: m.bg }]}>
                <Text style={{ fontSize: 12 }}>{m.emoji}</Text>
                <Text style={[styles.moodBadgeText, { color: m.color }]}>{entry.mood}</Text>
              </View>
              <Text style={styles.entryDate}>{entry.createdAt}</Text>
              <TouchableOpacity onPress={() => confirmDelete(entry.id)} style={styles.deleteBtn}>
                <Text style={{ fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.entryText} numberOfLines={3}>{entry.diary_entry}</Text>
            {entry.transcript && (
              <Text style={styles.transcriptPreview} numberOfLines={1}>📝 {entry.transcript}</Text>
            )}
            <TouchableOpacity style={styles.readMore}>
              <Text style={styles.readMoreText}>Read full entry →</Text>
            </TouchableOpacity>
          </View>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0a0a1a' },
  content:         { padding: 16, paddingBottom: 30 },
  title:           { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 3 },
  subtitle:        { fontSize: 12, color: '#666', marginBottom: 14 },
  searchBar:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#12122a', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  searchInput:     { flex: 1, fontSize: 13, color: '#fff' },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#12122a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterBtnActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
  filterText:      { fontSize: 12, color: '#666' },
  filterTextActive:{ color: '#fff', fontWeight: '700' },
  statsRow:        { flexDirection: 'row', gap: 10, marginBottom: 16 },
  miniStat:        { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  miniStatVal:     { fontSize: 18, fontWeight: '700', color: '#fff' },
  miniStatLabel:   { fontSize: 9, color: '#666', marginTop: 2, textAlign: 'center' },
  entryCard:       { backgroundColor: '#12122a', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  entryTop:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  moodBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  moodBadgeText:   { fontSize: 11, fontWeight: '700' },
  entryDate:       { flex: 1, fontSize: 11, color: '#555' },
  deleteBtn:       { padding: 4 },
  entryText:       { fontSize: 13, color: '#ccc', lineHeight: 22, marginBottom: 8 },
  transcriptPreview:{ fontSize: 11, color: '#555', marginBottom: 8 },
  readMore:        { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 8 },
  readMoreText:    { fontSize: 12, color: '#a78bfa', fontWeight: '600' },
  empty:           { alignItems: 'center', paddingVertical: 40 },
  emptyText:       { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 22 },
});