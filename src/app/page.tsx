'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Markdown } from '@/components/ui/markdown';
import { useState } from 'react';

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
        <div className="container mx-auto p-8 space-y-8">
          {/* Header */}
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">TabSeed</h1>
            <p className="text-muted-foreground">
              Design System & Tailwind Configuration Test
            </p>
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
          <div className="max-w-md mx-auto space-y-2">
            <label className="block text-sm font-medium">Input Component Test</label>
            <Input placeholder="Type something..." />
          </div>

          {/* Color Palette */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="h-16 bg-primary rounded border" />
              <p className="text-xs text-center">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-secondary rounded border" />
              <p className="text-xs text-center">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-accent rounded border" />
              <p className="text-xs text-center">Accent</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-muted rounded border" />
              <p className="text-xs text-center">Muted</p>
            </div>
          </div>

          {/* Markdown Test */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Markdown Rendering Test</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Source</h3>
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="w-full h-64 p-3 border rounded-md resize-none font-mono text-sm bg-background"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Rendered</h3>
                <div className="border rounded-md p-3 h-64 overflow-auto">
                  <Markdown content={markdownContent} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
            TabSeed - Built with Next.js, Tailwind CSS, and shadcn/ui
          </footer>
        </div>
      </div>
    </div>
  );
}
