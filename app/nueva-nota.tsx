import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';

import { IDEA_COLOR_LABELS, IDEA_COLOR_VALUES } from '../constants/ideaColors';
import { spacing } from '../constants/theme';
import { useNotesStore } from '../store/notesStore';
import type {
  ChecklistItem,
  ChecklistNote,
  IdeaColor,
  IdeaNote,
  NoteType,
  TextNote,
} from '../types';
import { IDEA_COLORS } from '../types';
import {
  checklistFormSchema,
  type FormErrors,
  ideaFormSchema,
  mapZodErrors,
  noteFormSchema,
} from '../validation/nuevaNotaSchemas';

type DraftChecklistItem = {
  id: string;
  text: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <HelperText type="error" visible padding="none">
      {message}
    </HelperText>
  );
}

export default function NuevaNotaScreen() {
  const router = useRouter();
  const addNote = useNotesStore((state) => state.addNote);
  const addChecklist = useNotesStore((state) => state.addChecklist);
  const addIdea = useNotesStore((state) => state.addIdea);

  const [noteType, setNoteType] = useState<NoteType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklistItems, setChecklistItems] = useState<DraftChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [color, setColor] = useState<IdeaColor | ''>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const clearErrors = useCallback(() => setErrors({}), []);

  const handleTypeChange = (value: string) => {
    setNoteType(value as NoteType);
    clearErrors();
  };

  const handleAddChecklistItem = () => {
    const text = newItemText.trim();
    if (!text) {
      return;
    }

    setChecklistItems((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, text },
    ]);
    setNewItemText('');
    setErrors((prev) => ({ ...prev, items: undefined, newItem: undefined }));
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (!tag) {
      return;
    }

    if (tags.includes(tag)) {
      setErrors((prev) => ({ ...prev, newTag: 'La etiqueta ya existe' }));
      return;
    }

    setTags((prev) => [...prev, tag]);
    setNewTag('');
    setErrors((prev) => ({ ...prev, tags: undefined, newTag: undefined }));
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleSave = () => {
    clearErrors();

    const now = new Date();
    const id = Date.now().toString();
    const timestamp = now.toISOString();

    if (noteType === 'note') {
      const result = noteFormSchema.safeParse({
        type: 'note',
        title,
        content,
      });

      if (!result.success) {
        setErrors(mapZodErrors(result.error));
        return;
      }

      const note: TextNote = {
        id,
        type: 'note',
        title: result.data.title,
        content: result.data.content,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      addNote(note);
      router.back();
      return;
    }

    if (noteType === 'checklist') {
      const result = checklistFormSchema.safeParse({
        type: 'checklist',
        title,
        items: checklistItems.map((item) => ({ text: item.text })),
      });

      if (!result.success) {
        setErrors(mapZodErrors(result.error));
        return;
      }

      const items: ChecklistItem[] = result.data.items.map((item, index) => ({
        id: `${id}-item-${index}`,
        text: item.text,
        completed: false,
      }));

      const note: ChecklistNote = {
        id,
        type: 'checklist',
        title: result.data.title,
        items,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      addChecklist(note);
      router.back();
      return;
    }

    if (!color) {
      setErrors({ color: 'Selecciona un color' });
      return;
    }

    const result = ideaFormSchema.safeParse({
      type: 'idea',
      title,
      tags,
      color,
    });

    if (!result.success) {
      setErrors(mapZodErrors(result.error));
      return;
    }

    const note: IdeaNote = {
      id,
      type: 'idea',
      title: result.data.title,
      content: result.data.tags.join(', '),
      tags: result.data.tags,
      color: result.data.color,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    addIdea(note);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.sectionLabel}>
              Tipo de contenido
            </Text>
            <SegmentedButtons
              value={noteType}
              onValueChange={handleTypeChange}
              buttons={[
                { value: 'note', label: 'Nota' },
                { value: 'checklist', label: 'Checklist' },
                { value: 'idea', label: 'Idea' },
              ]}
            />

            <TextInput
              label="Título"
              value={title}
              onChangeText={(value) => {
                setTitle(value);
                setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              mode="outlined"
              style={styles.input}
            />
            <FieldError message={errors.title} />

            {noteType === 'note' ? (
              <>
                <TextInput
                  label="Contenido"
                  value={content}
                  onChangeText={(value) => {
                    setContent(value);
                    setErrors((prev) => ({ ...prev, content: undefined }));
                  }}
                  mode="outlined"
                  multiline
                  numberOfLines={6}
                  style={[styles.input, styles.multiline]}
                />
                <FieldError message={errors.content} />
              </>
            ) : null}

            {noteType === 'checklist' ? (
              <>
                <View style={styles.row}>
                  <TextInput
                    label="Nuevo ítem"
                    value={newItemText}
                    onChangeText={setNewItemText}
                    mode="outlined"
                    style={[styles.input, styles.rowInput]}
                    onSubmitEditing={handleAddChecklistItem}
                  />
                  <Button
                    mode="contained-tonal"
                    onPress={handleAddChecklistItem}
                    style={styles.rowButton}
                  >
                    Añadir
                  </Button>
                </View>
                <FieldError message={errors.newItem ?? errors.items} />

                {checklistItems.length > 0 ? (
                  <View style={styles.list}>
                    {checklistItems.map((item) => (
                      <Chip
                        key={item.id}
                        onClose={() => handleRemoveChecklistItem(item.id)}
                        style={styles.chip}
                      >
                        {item.text}
                      </Chip>
                    ))}
                  </View>
                ) : (
                  <Text variant="bodySmall" style={styles.hint}>
                    Aún no has añadido ítems
                  </Text>
                )}
              </>
            ) : null}

            {noteType === 'idea' ? (
              <>
                <View style={styles.row}>
                  <TextInput
                    label="Nueva etiqueta"
                    value={newTag}
                    onChangeText={setNewTag}
                    mode="outlined"
                    style={[styles.input, styles.rowInput]}
                    onSubmitEditing={handleAddTag}
                  />
                  <Button
                    mode="contained-tonal"
                    onPress={handleAddTag}
                    style={styles.rowButton}
                  >
                    Añadir
                  </Button>
                </View>
                <FieldError message={errors.newTag ?? errors.tags} />

                {tags.length > 0 ? (
                  <View style={styles.list}>
                    {tags.map((tag) => (
                      <Chip key={tag} onClose={() => handleRemoveTag(tag)} style={styles.chip}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                ) : (
                  <Text variant="bodySmall" style={styles.hint}>
                    Aún no has añadido etiquetas
                  </Text>
                )}

                <Text variant="titleSmall" style={styles.sectionLabel}>
                  Color
                </Text>
                <View style={styles.colors}>
                  {IDEA_COLORS.map((option) => {
                    const selected = color === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => {
                          setColor(option);
                          setErrors((prev) => ({ ...prev, color: undefined }));
                        }}
                        accessibilityLabel={IDEA_COLOR_LABELS[option]}
                        style={[
                          styles.colorOption,
                          {
                            backgroundColor: IDEA_COLOR_VALUES[option],
                            borderColor: selected ? '#111827' : 'transparent',
                          },
                        ]}
                      />
                    );
                  })}
                </View>
                <FieldError message={errors.color} />
              </>
            ) : null}

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              Guardar
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderRadius: 12,
  },
  cardContent: {
    gap: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
  },
  input: {
    marginTop: spacing.sm,
  },
  multiline: {
    minHeight: 140,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  rowInput: {
    flex: 1,
    marginTop: 0,
  },
  rowButton: {
    marginTop: spacing.sm,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    marginBottom: spacing.xs,
  },
  hint: {
    marginTop: spacing.sm,
    opacity: 0.7,
  },
  colors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
