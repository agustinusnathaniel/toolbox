import { ToolHelp } from '@/lib/components/tool-help';

export function SqlHelp() {
  return (
    <ToolHelp
      faq={[
        {
          answer:
            'Yes. All formatting happens in your browser using sql-formatter. No data is ever sent to a server.',
          question: 'Is my data safe?',
        },
        {
          answer:
            'Supported dialects: Generic SQL, MySQL, PostgreSQL, SQLite, BigQuery, and Transact-SQL. Pick the one closest to your database.',
          question: 'Which SQL dialects are supported?',
        },
        {
          answer:
            'Use Copy link to get a shareable URL that restores your input, dialect, and action for anyone who opens it.',
          question: 'How do shareable links work?',
        },
      ]}
      howItWorks={{
        description:
          'Choose a dialect and action, paste your SQL, and format. Copy the output or share a link that restores your input and settings.',
        steps: [
          'Select a SQL dialect',
          'Choose Format or Minify',
          'Paste your SQL into the textarea',
          'Click Format or Minify',
          'Copy the output or copy a shareable link',
        ],
      }}
    />
  );
}
