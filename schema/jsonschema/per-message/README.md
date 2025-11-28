# JSON Schema Definitions

This directory contains individual JSON Schema files for each message type used in the Dataspace platform.

## File Naming Convention

Each schema file should be named after the message type:
- `DeliveryAttestation.json`
- `ContractNegotiation.json`
- `PolicyOffer.json`
- etc.

## Schema Structure

Each schema should follow JSON Schema Draft 2020-12:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://dataspace.example/schemas/MessageType.json",
  "title": "Message Type",
  "description": "Description of the message type",
  "type": "object",
  "properties": {
    // Define properties here
  },
  "required": ["prop1", "prop2"],
  "additionalProperties": false
}
```

## Validation

All schemas are validated using AJV in `/libs/validation/`

## References

Schemas can reference other schemas using `$ref`:

```json
{
  "properties": {
    "contract": {
      "$ref": "ContractNegotiation.json"
    }
  }
}
```

## Master Bundle

A master bundle combining all schemas is available in:
`/schema/jsonschema/master/`
