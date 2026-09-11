interface ToolErrorProps {
  hint?: string;
  message?: string;
  title?: string;
  variant?: 'mono' | 'prose';
}

export const ToolError = ({
  hint,
  message,
  title,
  variant = 'mono',
}: ToolErrorProps) => {
  const MessageTag = variant === 'mono' ? 'pre' : 'p';
  const messageClass = `${title ? 'mt-1 ' : ''}whitespace-pre-wrap ${
    variant === 'mono' ? 'font-mono ' : ''
  }text-danger/80 text-xs`;

  return (
    <div
      className="rounded-lg border border-danger/30 bg-danger/5 p-3"
      role="alert"
    >
      {title ? (
        <p className="font-medium text-danger text-sm">{title}</p>
      ) : null}
      {message ? (
        <MessageTag className={messageClass}>{message}</MessageTag>
      ) : null}
      {hint ? <p className="mt-1 text-danger/80 text-xs">{hint}</p> : null}
    </div>
  );
};
