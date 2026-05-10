import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalContext = createContext();

export function JournalProvider({ children }) {
  const [entries, setEntries]     = useState([]);
  const [reminders, setReminders] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const e = await AsyncStorage.getItem('journal_entries');
      const r = await AsyncStorage.getItem('reminders');
      if (e) setEntries(JSON.parse(e));
      if (r) setReminders(JSON.parse(r));
    } catch (err) { console.log('Load error:', err); }
  };

  const saveEntry = async (entry) => {
    const newEntry = { ...entry, id: Date.now().toString(), createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
    const updated  = [newEntry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem('journal_entries', JSON.stringify(updated));
    return newEntry;
  };

  const saveReminders = async (newRems, entryDate) => {
    const tagged   = newRems.map(r => ({ ...r, id: Date.now().toString() + Math.random(), done: false, source: entryDate }));
    const updated  = [...tagged, ...reminders];
    setReminders(updated);
    await AsyncStorage.setItem('reminders', JSON.stringify(updated));
  };

  const toggleReminder = async (id) => {
    const updated = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
    setReminders(updated);
    await AsyncStorage.setItem('reminders', JSON.stringify(updated));
  };

  const deleteEntry = async (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    await AsyncStorage.setItem('journal_entries', JSON.stringify(updated));
  };

  return (
    <JournalContext.Provider value={{ entries, reminders, saveEntry, saveReminders, toggleReminder, deleteEntry }}>
      {children}
    </JournalContext.Provider>
  );
}

export const useJournal = () => useContext(JournalContext);