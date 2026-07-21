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
        automaticLayout: true,
        fontSize: 13,
        lineNumbers: 'on',
        minimap: { enabled: false },
        padding: { top: 8 },
        scrollBeyondLastLine: false,
        tabSize: 2,
        wordWrap: 'on',
      }}
      theme="vs-dark"
      value={value}
    />
  );
}
