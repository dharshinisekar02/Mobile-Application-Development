import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { processVoiceEntry } from '../services/gemini';
import { useJournal } from '../context/JournalContext';
import { useNavigation } from '@react-navigation/native';

const STEPS = ['Record', 'Transcribe', 'AI Process', 'Save'];
const MOOD_STYLES = {
  Happy:      { bg: '#0d2318', border: '#1a5c30', text: '#4ade80', emoji: '😄' },
  Calm:       { bg: '#0d1e30', border: '#1a3d5c', text: '#60a5fa', emoji: '😌' },
  Anxious:    { bg: '#2a1800', border: '#5c3800', text: '#fb923c', emoji: '😰' },
  Sad:        { bg: '#1a0d2e', border: '#3d1a6b', text: '#c084fc', emoji: '😢' },
  Excited:    { bg: '#2a2200', border: '#5c4a00', text: '#facc15', emoji: '🤩' },
  Frustrated: { bg: '#2e0d1a', border: '#6b1a3d', text: '#f472b6', emoji: '😤' },
};

export default function RecordScreen() {
  const navigation                      = useNavigation();
  const { saveEntry, saveReminders }    = useJournal();
  const [status, setStatus]             = useState('idle');
  const [activeStep, setActiveStep]     = useState(-1);
  const [result, setResult]             = useState(null);
  const [duration, setDuration]         = useState(0);
  const [saved, setSaved]               = useState(false);
  const recordingRef                    = useRef(null);
  const timerRef                        = useRef(null);
  const pulseAnim                       = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])).start();
    } else {
      clearInterval(timerRef.current);
      setDuration(0);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) { Alert.alert('Permission Denied', 'Microphone access is required.'); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setStatus('recording'); setActiveStep(0); setResult(null); setSaved(false);
    } catch (err) { Alert.alert('Error', err.message); }
  };

  const stopAndProcess = async () => {
    try {
      setStatus('processing'); setActiveStep(1);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setActiveStep(2);
      const data = await processVoiceEntry(uri);
      setActiveStep(3);
      setResult(data);
      setStatus('done');
    } catch (err) {
      setStatus('idle'); setActiveStep(-1);
      Alert.alert('Processing Failed', err.message);
    }
  };

  const handleSave = async () => {
    if (!result || saved) return;
    try {
      const entry = await saveEntry({
        transcript:  result.transcript,
        diary_entry: result.diary_entry,
        mood:        result.mood,
      });
      if (result.reminders?.length > 0) {
        await saveReminders(result.reminders, entry.createdAt);
      }
      setSaved(true);
      Alert.alert('Saved! ✅', 'Entry saved to Journal' + (result.reminders?.length > 0 ? ` and ${result.reminders.length} reminder(s) added.` : '.'), [
        { text: 'View Journal', onPress: () => navigation.navigate('Journal') },
        { text: 'OK' },
      ]);
    } catch (err) {
      Alert.alert('Save Failed', err.message);
    }
  };

  const mood = result ? (MOOD_STYLES[result.mood] ?? MOOD_STYLES.Calm) : null;
  const btnColor = status === 'idle' ? '#6C47FF' : status === 'recording' ? '#e53935' : status === 'processing' ? '#FB8C00' : '#16a34a';
  const btnEmoji = status === 'idle' ? '🎙️' : status === 'recording' ? '⏹️' : status === 'processing' ? '⏳' : '✅';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.title}>New Entry</Text>
      <Text style={styles.subtitle}>Speak — AI transcribes, formats and saves for you</Text>

      {/* Record Button */}
      <View style={styles.recordCard}>
        {status === 'recording' && (
          <View style={styles.timerRow}>
            <View style={styles.recDot} />
            <Text style={styles.timerText}>{fmt(duration)}</Text>
          </View>
        )}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.micBtn, { backgroundColor: btnColor }]}
            onPress={() => {
              if (status === 'idle' || status === 'done') startRecording();
              else if (status === 'recording') stopAndProcess();
            }}
            disabled={status === 'processing'}
            activeOpacity={0.85}
          >
            <Text style={styles.micEmoji}>{btnEmoji}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.micLabel}>
          {status === 'idle'       ? 'Tap to start recording'      :
           status === 'recording'  ? 'Recording... tap to stop'    :
           status === 'processing' ? 'AI is processing...'         :
                                     'Done! Tap to record again'}
        </Text>
      </View>

      {/* Pipeline Steps */}
      <View style={styles.stepsCard}>
        {STEPS.map((step, i) => (
          <View key={i} style={[styles.stepItem, i < STEPS.length - 1 && styles.stepBorder]}>
            <View style={[styles.stepDot,
              i < activeStep  && { backgroundColor: '#16a34a' },
              i === activeStep && { backgroundColor: '#6C47FF' },
            ]}>
              <Text style={{ fontSize: i < activeStep ? 10 : 11, color: i <= activeStep ? '#fff' : '#555' }}>
                {i < activeStep ? '✓' : ['🎙️','📝','🤖','💾'][i]}
              </Text>
            </View>
            <Text style={[styles.stepLabel, i === activeStep && { color: '#a78bfa' }]}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Result */}
      {result ? (
        <View style={{ gap: 10 }}>

          <View style={[styles.moodCard, { backgroundColor: mood.bg, borderColor: mood.border }]}>
            <Text style={{ fontSize: 28 }}>{mood.emoji}</Text>
            <View>
              <Text style={[styles.moodLabel, { color: mood.text }]}>Mood Detected</Text>
              <Text style={[styles.moodValue, { color: mood.text }]}>{result.mood}</Text>
            </View>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>📔 Diary Entry</Text>
            <Text style={styles.resultCardText}>{result.diary_entry}</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>📝 Transcript</Text>
            <Text style={styles.resultCardText}>{result.transcript}</Text>
          </View>

          {result.reminders?.length > 0 && (
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>⏰ Reminders ({result.reminders.length})</Text>
              {result.reminders.map((r, i) => (
                <View key={i} style={styles.remRow}>
                  <View style={styles.remDot} />
                  <Text style={styles.remTask}>{r.task}</Text>
                  <Text style={styles.remTime}>{r.time}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            disabled={saved}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saved ? '✅ Saved to Journal' : '💾 Save to Journal'}</Text>
          </TouchableOpacity>

        </View>
      ) : (
        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>💡 Try saying...</Text>
          <Text style={styles.hintText}>
            "Today was amazing. I finished the project and felt proud. Remind me to call mom at 7pm."
          </Text>
          <View style={styles.tags}>
            {['Mood detection', 'Auto reminders', 'Diary format'].map(t => (
              <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0a0a1a' },
  content:        { padding: 16, paddingBottom: 30 },
  title:          { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 3 },
  subtitle:       { fontSize: 12, color: '#666', marginBottom: 16 },
  recordCard:     { backgroundColor: '#12122a', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)' },
  timerRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  recDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e53935' },
  timerText:      { fontSize: 20, fontWeight: '700', color: '#e53935' },
  micBtn:         { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  micEmoji:       { fontSize: 36 },
  micLabel:       { fontSize: 13, color: '#888', textAlign: 'center' },
  stepsCard:      { backgroundColor: '#12122a', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 12, flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  stepItem:       { flex: 1, alignItems: 'center', paddingVertical: 10 },
  stepBorder:     { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)' },
  stepDot:        { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e1e3a', alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  stepLabel:      { fontSize: 9, color: '#555' },
  moodCard:       { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  moodLabel:      { fontSize: 10, fontWeight: '600', opacity: 0.8 },
  moodValue:      { fontSize: 18, fontWeight: '700' },
  resultCard:     { backgroundColor: '#12122a', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  resultCardTitle:{ fontSize: 13, fontWeight: '700', color: '#a78bfa', marginBottom: 8 },
  resultCardText: { fontSize: 13, color: '#ccc', lineHeight: 22 },
  remRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  remDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a78bfa' },
  remTask:        { flex: 1, fontSize: 13, color: '#ddd' },
  remTime:        { fontSize: 11, color: '#666' },
  saveBtn:        { backgroundColor: '#6C47FF', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveBtnDone:    { backgroundColor: '#16a34a' },
  saveBtnText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  hintCard:       { backgroundColor: '#12122a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  hintTitle:      { fontSize: 14, fontWeight: '700', color: '#a78bfa', marginBottom: 8 },
  hintText:       { fontSize: 13, color: '#666', lineHeight: 22, fontStyle: 'italic', marginBottom: 12 },
  tags:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:            { backgroundColor: '#1e1e3a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText:        { fontSize: 11, color: '#a78bfa' },
});