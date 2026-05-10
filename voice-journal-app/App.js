import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { JournalProvider } from './src/context/JournalContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <JournalProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </JournalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}