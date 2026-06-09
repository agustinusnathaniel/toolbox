import { lazy } from 'react';

const Editor = lazy(() =>
  import('@monaco-editor/react').then((module) => ({ default: module.Editor }))
);

export function MonacoEditor({
  value,
  onChange,
  language,
  height,
}: {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  height: string;
}) {
  return (
    <Editor
      height={height}
      language={language}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 8 },
      }}
      theme="vs-dark"
      value={value}
    />
  );
}
