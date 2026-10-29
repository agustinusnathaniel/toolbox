import {
  readString,
  recordToSearchParams,
  trimmed,
} from '@/lib/utils/search-params';

export interface JsonSchemaValidatorSearchParams {
  input?: string;
  schema?: string;
}

export interface JsonSchemaValidatorState {
  document: string;
  schema: string;
}

export function buildJsonSchemaParams(
  state: JsonSchemaValidatorState
): URLSearchParams {
  return recordToSearchParams({
    input: trimmed(state.document),
    schema: trimmed(state.schema),
  });
}

export function buildJsonSchemaStateFromSearch(
  search: JsonSchemaValidatorSearchParams
): JsonSchemaValidatorState {
  return {
    document: readString(search.input),
    schema: readString(search.schema),
  };
}
