import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useJournal } from '../context/JournalContext';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning!', emoji: '🌅' };
  if (h < 17) return { text: 'Good afternoon!', emoji: '☀️' };
  return { text: 'Good evening!', emoji: '🌙' };
};

const MOODS = [
  { emoji: '😄', label: 'Happy',   color: '#1a2e1a' },
  { emoji: '🙂', label: 'Okay',    color: '#1a2030' },
  { emoji: '😐', label: 'Neutral', color: '#1e1e2e' },
  { emoji: '😢', label: 'Sad',     color: '#1a1a30' },
  { emoji: '😡', label: 'Angry',   color: '#2e1a1a' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { entries, reminders } = useJournal();
  const greeting = getGreeting();
  const [selectedMood, setSelectedMood] = useState(null);

  const todayStr    = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const todayRems   = reminders.filter(r => r.date === 'Today' && !r.done);
  const recentEntry = entries[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>{greeting.text} {greeting.emoji}</Text>
        <Text style={styles.greetingSub}>Let's capture your thoughts and moments.</Text>
      </View>

      {/* Stats Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
        {[
          { icon: '📓', value: entries.length,  label: 'Entries',   sub: `+${entries.filter(e => e.createdAt === todayStr).length} today`, bg: '#0d2318' },
          { icon: '🔔', value: todayRems.length, label: 'Reminders', sub: 'Today',       bg: '#0d1e30' },
          { icon: '💛', value: entries.length ? '😊' : '–', label: 'Mood Avg',  sub: 'This week',  bg: '#2a2200' },
          { icon: '🔥', value: entries.length,  label: 'Streak',    sub: 'Days',        bg: '#2a0d18' },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statSub}>{s.sub}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Record */}
      <TouchableOpacity style={styles.recordCard} onPress={() => navigation.navigate('Record')} activeOpacity={0.9}>
        <View style={styles.recordLeft}>
          <Text style={styles.recordTitle}>Voice Journal</Text>
          <Text style={styles.recordSub}>Tap the mic to speak your thoughts...</Text>
          <View style={styles.recordBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recordBadgeText}>Not recording</Text>
          </View>
        </View>
        <View style={styles.micBtn}>
          <Text style={{ fontSize: 26 }}>🎙️</Text>
        </View>
      </TouchableOpacity>

      {/* Mood Check */}
      <View style={styles.moodCard}>
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.label}
              style={[styles.moodBtn, { backgroundColor: m.color }, selectedMood === m.label && styles.moodBtnSelected]}
              onPress={() => setSelectedMood(m.label)}
            >
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Entry */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📖 Recent Entry</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Journal')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {recentEntry ? (
          <View style={styles.entryPreview}>
            <Text style={styles.entryPreviewDate}>{recentEntry.createdAt}</Text>
            <Text style={styles.entryPreviewMood}>{recentEntry.mood}</Text>
            <Text style={styles.entryPreviewText} numberOfLines={2}>{recentEntry.diary_entry}</Text>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No entries yet. Record your first!</Text>
          </View>
        )}
      </View>

      {/* Today's Reminders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🕐 Today's Reminders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        {todayRems.length > 0 ? todayRems.slice(0, 2).map(r => (
          <View key={r.id} style={styles.remRow}>
            <View style={styles.remDot} />
            <Text style={styles.remText}>{r.task}</Text>
            <Text style={styles.remTime}>{r.time}</Text>
          </View>
        )) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reminders for today.</Text>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.qaRow}>
        {[
          { icon: '🎙️', label: 'Voice Entry', screen: 'Record' },
          { icon: '📓', label: 'Journal',     screen: 'Journal' },
          { icon: '🔔', label: 'Reminders',   screen: 'Reminders' },
        ].map(a => (
          <TouchableOpacity key={a.label} style={styles.qaBtn} onPress={() => navigation.navigate(a.screen)}>
            <Text style={styles.qaIcon}>{a.icon}</Text>
            <Text style={styles.qaLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#0a0a1a' },
  content:         { padding: 16, paddingBottom: 30 },
  greeting:        { marginBottom: 16 },
  greetingText:    { fontSize: 22, fontWeight: '700', color: '#fff' },
  greetingSub:     { fontSize: 12, color: '#666', marginTop: 3 },
  statsRow:        { marginBottom: 14, gap: 10 },
  statCard:        { width: 110, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statIcon:        { fontSize: 18, marginBottom: 4 },
  statValue:       { fontSize: 20, fontWeight: '700', color: '#fff' },
  statLabel:       { fontSize: 10, color: '#aaa', marginTop: 2 },
  statSub:         { fontSize: 9, color: '#555', marginTop: 1 },
  recordCard:      { backgroundColor: '#12122a', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)' },
  recordLeft:      { flex: 1 },
  recordTitle:     { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 3 },
  recordSub:       { fontSize: 11, color: '#666', marginBottom: 10 },
  recordBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e3a', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', gap: 6 },
  recDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#555' },
  recordBadgeText: { fontSize: 11, color: '#666' },
  micBtn:          { width: 56, height: 56, borderRadius: 28, backgroundColor: '#6C47FF', alignItems: 'center', justifyContent: 'center' },
  moodCard:        { backgroundColor: '#12122a', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(253,230,138,0.15)' },
  moodRow:         { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  moodBtn:         { flex: 1, minWidth: '18%', alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  moodBtnSelected: { borderColor: '#a78bfa', borderWidth: 2 },
  moodEmoji:       { fontSize: 20, marginBottom: 3 },
  moodLabel:       { fontSize: 9, color: '#aaa' },
  section:         { backgroundColor: '#12122a', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  sectionHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle:    { fontSize: 14, fontWeight: '700', color: '#fff' },
  seeAll:          { fontSize: 12, color: '#a78bfa' },
  entryPreview:    { gap: 4 },
  entryPreviewDate:{ fontSize: 10, color: '#666' },
  entryPreviewMood:{ fontSize: 11, color: '#a78bfa' },
  entryPreviewText:{ fontSize: 13, color: '#ccc', lineHeight: 20 },
  remRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  remDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a78bfa' },
  remText:         { flex: 1, fontSize: 13, color: '#ddd' },
  remTime:         { fontSize: 11, color: '#666' },
  empty:           { paddingVertical: 10 },
  emptyText:       { fontSize: 12, color: '#555', textAlign: 'center' },
  qaRow:           { flexDirection: 'row', gap: 10 },
  qaBtn:           { flex: 1, backgroundColor: '#12122a', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  qaIcon:          { fontSize: 20, marginBottom: 5 },
  qaLabel:         { fontSize: 10, color: '#aaa', fontWeight: '600' },
});