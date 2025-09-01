import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Surface } from '@/components/ui/surface';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Heading, Text } from '@/components/ui/typography';

export default function DesignSystemPage() {
  return (
    <main className="container space-y-8 py-8">
      <Heading as="h1">Design System</Heading>
      <div className="flex items-center gap-4">
        <Text muted>Tokens, components and patterns preview.</Text>
        <ThemeToggle />
      </div>

      <section className="space-y-4">
        <Heading as="h2">Theme Tokens Preview</Heading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Surface className="space-y-3 p-4">
            <Heading as="h3">Surfaces</Heading>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-10 rounded bg-background" />
              <div className="h-10 rounded bg-card" />
              <div className="h-10 rounded bg-popover" />
            </div>
            <Text size="sm" muted>
              background / card / popover
            </Text>
          </Surface>
          <Surface className="space-y-3 p-4">
            <Heading as="h3">Text</Heading>
            <div className="flex items-center gap-2">
              <span className="rounded px-2 py-1 text-foreground ring-1 ring-border">foreground</span>
              <span className="rounded px-2 py-1 text-muted-foreground ring-1 ring-border">muted-foreground</span>
            </div>
            <Text size="sm" muted>
              foreground / muted-foreground
            </Text>
          </Surface>
          <Surface className="space-y-3 p-4">
            <Heading as="h3">Brand & Accents</Heading>
            <div className="grid grid-cols-4 gap-2">
              <div className="h-10 rounded bg-primary" />
              <div className="h-10 rounded bg-secondary" />
              <div className="h-10 rounded bg-success" />
              <div className="h-10 rounded bg-warning" />
              <div className="h-10 rounded bg-info" />
              <div className="h-10 rounded bg-destructive" />
              <div className="h-10 rounded bg-accent" />
              <div className="h-10 rounded bg-ring" />
            </div>
            <Text size="sm" muted>
              primary / secondary / success / warning / info / destructive / accent / ring
            </Text>
          </Surface>
        </div>
      </section>

      <section className="space-y-4">
        <Heading as="h2">Buttons</Heading>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="info">Info</Button>
          <Button variant="soft">Soft</Button>
        </div>
      </section>

      <section className="space-y-4">
        <Heading as="h2">Badges</Heading>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="destructive">Destructive</Badge>
          <Badge tone="info">Info</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="soft" tone="primary">
            Soft Primary
          </Badge>
        </div>
      </section>

      <section className="space-y-4">
        <Heading as="h2">Surface & Skeleton</Heading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Surface className="space-y-2 p-4">
            <Heading as="h3">Card Title</Heading>
            <Text>Some quick content inside a Surface.</Text>
          </Surface>
          <Surface className="space-y-2 p-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </Surface>
          <Surface className="space-y-2 p-4">
            <Text muted>Uses shadow-elev-1 and card tokens.</Text>
            <Text size="sm">Check dark mode with your OS or a theme toggle.</Text>
          </Surface>
        </div>
      </section>

      <section className="space-y-4">
        <Heading as="h2">Typography</Heading>
        <div className="space-y-3">
          <Heading as="display">Display (700)</Heading>
          <Heading as="h1">H1 Heading (700)</Heading>
          <Heading as="h2">H2 Heading (700)</Heading>
          <Heading as="h3">H3 Heading (600)</Heading>
          <Text>Body md (400)</Text>
          <Text size="sm">Small text (400)</Text>
          <Text size="xs">Tiny text (400)</Text>
          <Text muted>
            Muted text (400) — Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </Text>
          <Text className="font-medium">Body medium (500)</Text>
          <Text className="font-bold">Body bold (700)</Text>
        </div>
      </section>
    </main>
  );
}
