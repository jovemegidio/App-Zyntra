import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/auth';
import { Colors } from '@/lib/constants';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href="/(public)/login" />;
}
