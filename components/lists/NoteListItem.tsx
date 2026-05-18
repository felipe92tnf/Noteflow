import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

import type { AnyNote } from '../../types';
import { isChecklistNote, isIdeaNote, isTextNote } from '../../types';
import { ChecklistCard, IdeaCard, NoteCard } from '../items';

type NoteListItemProps = {
  item: AnyNote;
  onPress: () => void;
};

export function NoteListItem({ item, onPress }: NoteListItemProps) {
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutLeft}>
      {isTextNote(item) ? (
        <NoteCard note={item} onPress={() => onPress()} />
      ) : null}
      {isChecklistNote(item) ? (
        <ChecklistCard note={item} onPress={() => onPress()} />
      ) : null}
      {isIdeaNote(item) ? <IdeaCard note={item} onPress={() => onPress()} /> : null}
    </Animated.View>
  );
}
