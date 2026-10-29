'use client';

import { createFileRoute, useSearch } from '@tanstack/react-router';
import { z } from 'zod';

import { useToolTracking } from '@/lib/analytics/use-analytics';
import { Card, CardContent } from '@/lib/components/ui/card';
import { JSON_SCHEMA_EXAMPLES } from '@/lib/tools/json-schema-validator/adapters/json-schema-validator';
import { createToolRouteMetadata } from '@/lib/utils/metadata';

import {
  JsonSchemaActions,
  JsonSchemaExamples,
  JsonSchemaHelp,
  JsonSchemaInputs,
  JsonSchemaOutput,
} from './-components/json-schema-sections';
import { useJsonSchemaPage } from './-components/use-json-schema-page';
import { meta } from './-meta';

const searchSchema = z.object({
  input: z.string().optional(),
  schema: z.string().optional(),
});

export const Route = createFileRoute('/_tools/json-schema-validator/')({
  component: JsonSchemaValidatorPage,
  ...createToolRouteMetadata(meta),
  validateSearch: searchSchema,
});

function JsonSchemaValidatorPage() {
  const { trackAction, trackComplete } = useToolTracking(
    'json-schema-validator',
    'JSON Schema Validator'
  );
  const search = useSearch({ from: '/_tools/json-schema-validator/' });
  const page = useJsonSchemaPage(search, trackAction, trackComplete);

  return (
    <div className="mx-auto flex w-full flex-col gap-6 md:w-[80%] md:max-w-3xl">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <JsonSchemaInputs
            document={page.state.document}
            onDocument={page.updateDocument}
            onSchema={page.updateSchema}
            schema={page.state.schema}
          />
          <JsonSchemaExamples
            examples={JSON_SCHEMA_EXAMPLES}
            onSelect={(example) =>
              page.loadExample(example.schema, example.document)
            }
          />
          <JsonSchemaActions
            computing={page.computing}
            onCopyLink={page.handleCopyLink}
            onValidate={page.runValidation}
          />
          <JsonSchemaOutput
            copied={page.copiedKey === 'copy'}
            hasInput={Boolean(
              page.state.schema.trim() || page.state.document.trim()
            )}
            onCopy={page.handleCopy}
            result={page.result}
          />
        </CardContent>
      </Card>
      <JsonSchemaHelp />
    </div>
  );
}
