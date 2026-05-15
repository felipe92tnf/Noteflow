import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

import { NotesList } from '../../../components/lists/NotesList';
import { spacing } from '../../../constants/theme';

export default function IdeasIndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <NotesList type="idea" />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/nueva-nota')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
});
