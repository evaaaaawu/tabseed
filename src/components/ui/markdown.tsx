import ReactMarkdown from 'react-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <article
      className={cn(
        'prose max-w-none dark:prose-invert',
        // Headings spacing align to DS scale
        '[&_:where(h1)]:mb-3 [&_:where(h1)]:mt-6',
        '[&_:where(h2)]:mb-2.5 [&_:where(h2)]:mt-5',
        '[&_:where(h3)]:mb-2 [&_:where(h3)]:mt-4',
        // Links color
        '[&_:where(a)]:text-primary [&_:where(a)]:no-underline hover:[&_:where(a)]:underline',
        // Code styling
        '[&_:where(code)]:rounded-[4px] [&_:where(code)]:bg-muted [&_:where(code)]:px-1.5 [&_:where(code)]:py-0.5 [&_:where(code)]:text-xs',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize], [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
