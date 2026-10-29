import { Button } from '@/lib/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/lib/components/ui/card';

type CalendarResultCardsProps = {
  linkUrl: string;
  onCopyLink: () => void;
  onCopyShareableLink: () => void;
  onGenerateEmbed: () => void;
};

export function CalendarResultCards({
  linkUrl,
  onCopyLink,
  onCopyShareableLink,
  onGenerateEmbed,
}: CalendarResultCardsProps) {
  return (
    <div className="mt-6 flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Link</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-md bg-muted p-3">
            <code className="break-all font-mono text-xs">{linkUrl}</code>
          </div>
          <Button className="w-full" onClick={onCopyLink} variant="default">
            Copy Link
          </Button>
          <Button
            className="w-full"
            onClick={onCopyShareableLink}
            variant="outline"
          >
            Copy Shareable Link
          </Button>
          <p className="text-center text-muted-foreground text-xs">
            Shareable link opens this tool with your values pre-filled.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embed Button</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={onGenerateEmbed}
            variant="secondary"
          >
            Copy Embed Button
          </Button>
          <p className="text-center text-muted-foreground text-xs">
            Copy the embed button to your web page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
