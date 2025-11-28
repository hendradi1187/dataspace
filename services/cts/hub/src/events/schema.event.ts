import { Schema } from '../types';

export class SchemaEventHandler {
  async onSchemaCreated(schema: Schema) {
    console.log(`[Event] Schema created: ${schema.id} (${schema.name})`);
  }

  async onSchemaPublished(schema: Schema) {
    console.log(`[Event] Schema published: ${schema.id}`);
  }
}
