import { Vocabulary } from '../types';

export class VocabularyEventHandler {
  async onVocabularyCreated(vocab: Vocabulary) {
    console.log(`[Event] Vocabulary created: ${vocab.id} (${vocab.name})`);
  }

  async onVocabularyPublished(vocab: Vocabulary) {
    console.log(`[Event] Vocabulary published: ${vocab.id}`);
  }
}
