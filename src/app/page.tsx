'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Markdown } from '@/components/ui/markdown';

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(`# TabSeed Design System Test

Welcome to **TabSeed**! This page demonstrates our Tailwind CSS configuration with brand colors and components.

## Brand Colors
- Primary: \`#86C166\` (Green)
- Secondary: \`#FAD689\` (Yellow)

## Features
- ✅ HSL-based design tokens
- ✅ Dark mode support
- ✅ Typography plugin
- ✅ shadcn/ui components
- ✅ Markdown rendering

### Code Example
\`\`\`javascript
const greeting = "Hello TabSeed!";
console.log(greeting);
\`\`\`

> This is a blockquote demonstrating the **markdown** capabilities.

[External Link](https://example.com) - Opens in new tab safely.`);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto space-y-8 p-8">
          {/* Header */}
          <header className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-primary">TabSeed</h1>
            <p className="text-muted-foreground">Design System & Tailwind Configuration Test</p>
          </header>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button onClick={toggleDarkMode} variant="outline">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
          </div>

          {/* Input Test */}
          <div className="mx-auto max-w-md space-y-2">
            <label className="block text-sm font-medium">Input Component Test</label>
            <Input placeholder="Type something..." />
          </div>

          {/* Color Palette */}
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="h-16 rounded border bg-primary" />
              <p className="text-center text-xs">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded border bg-secondary" />
              <p className="text-center text-xs">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded border bg-accent" />
              <p className="text-center text-xs">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded border bg-muted" />
              <p className="text-center text-xs">Muted</p>
            </div>
          </div>

          {/* Markdown Test */}
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-2xl font-semibold">Markdown Rendering Test</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-medium">Source</h3>
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="h-64 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm"
                />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-medium">Rendered</h3>
                <div className="h-64 overflow-auto rounded-md border p-3">
                  <Markdown content={markdownContent} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t pt-8 text-center text-sm text-muted-foreground">
            TabSeed - Built with Next.js, Tailwind CSS, and shadcn/ui
          </footer>
        </div>
      </div>
    </div>
  );
}
