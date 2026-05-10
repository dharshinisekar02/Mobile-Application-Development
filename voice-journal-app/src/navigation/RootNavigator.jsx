import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import JournalScreen from '../screens/JournalScreen';
import RemindersScreen from '../screens/RemindersScreen';

const Tab = createBottomTabNavigator();
const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
);

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0c29', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: { backgroundColor: '#12122a', borderTopWidth: 0.5, borderTopColor: '#2d2d44', paddingBottom: 8, height: 60 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="Record"    component={RecordScreen}    options={{ title: 'New Entry',  tabBarIcon: ({ focused }) => <TabIcon emoji="🎙️" focused={focused} /> }} />
      <Tab.Screen name="Journal"   component={JournalScreen}   options={{ title: 'Journal',    tabBarIcon: ({ focused }) => <TabIcon emoji="📓" focused={focused} /> }} />
      <Tab.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Reminders',  tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} /> }} />
    </Tab.Navigator>
  );
}