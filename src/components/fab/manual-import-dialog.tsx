"use client";

import { BookOpen, Download, Link, Loader2, Upload, X } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { CapturedTab } from '@/lib/extension/bridge';
import { parseBookmarksHtml } from '@/lib/import/parse-bookmarks-html';
import { parseUrlsFromText } from '@/lib/import/parse-urls-text';

interface ManualImportDialogProps {
	readonly open: boolean;
	readonly onOpenChange: (open: boolean) => void;
	readonly onSubmit: (tabs: CapturedTab[]) => Promise<void>;
}

type ImportMethod = 'bookmarks' | 'urls' | 'guide';

export function ManualImportDialog({ open, onOpenChange, onSubmit }: ManualImportDialogProps) {
	const [method, setMethod] = useState<ImportMethod>('guide');
	const [isLoading, setIsLoading] = useState(false);
	const [urlsText, setUrlsText] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleBookmarkUpload = async (file: File) => {
		try {
			setIsLoading(true);
			const tabs = await parseBookmarksHtml(file);
			if (tabs.length === 0) {
				alert('No valid URLs found in the bookmark file.');
				return;
			}
			await onSubmit(tabs);
			onOpenChange(false);
		} catch (error) {
			console.error('Error parsing bookmark file:', error);
			alert('Error parsing bookmark file. Please check the file format.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleUrlsSubmit = async () => {
		if (!urlsText.trim()) return;

		try {
			setIsLoading(true);
			const tabs = parseUrlsFromText(urlsText);
			if (tabs.length === 0) {
				alert('No valid URLs found in the text.');
				return;
			}
			await onSubmit(tabs);
			onOpenChange(false);
		} catch (error) {
			console.error('Error parsing URLs:', error);
			alert('Error parsing URLs.');
		} finally {
			setIsLoading(false);
		}
	};

	if (!open) return null;

	return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-background p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Import Tabs</h2>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </div>

        {method === 'guide' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to import your tabs:
            </p>

            <button
              className="flex w-full items-center gap-3 rounded-md border p-3 text-left hover:bg-accent"
              onClick={() => setMethod('bookmarks')}
            >
              <BookOpen className="size-5 text-primary" />
              <div>
                <div className="font-medium">Import from Bookmarks</div>
                <div className="text-xs text-muted-foreground">
                  Recommended: Upload a bookmark HTML file
                </div>
              </div>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-md border p-3 text-left hover:bg-accent"
              onClick={() => setMethod('urls')}
            >
              <Link className="size-5 text-primary" />
              <div>
                <div className="font-medium">Paste URLs</div>
                <div className="text-xs text-muted-foreground">
                  Quick: Paste multiple URLs (one per line)
                </div>
              </div>
            </button>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-start gap-2">
                <Download className="mt-0.5 size-4 text-amber-600" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Extension recommended</p>
                  <p>Install the TabSeed extension for automatic tab capture and closing.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {method === 'bookmarks' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Upload className="mr-2 size-4" />
                Choose Bookmark File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBookmarkUpload(file);
                }}
              />
            </div>

            <div className="rounded-md bg-muted p-3 text-xs">
              <p className="mb-1 font-medium">How to export bookmarks:</p>
              <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                <li>Open your browser's bookmark manager</li>
                <li>Find "Export bookmarks" or "Export" option</li>
                <li>Save as HTML file</li>
                <li>Upload the file here</li>
              </ol>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setMethod('guide')}>
                Back
              </Button>
            </div>
          </div>
        )}

        {method === 'urls' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste URLs (one per line)</label>
              <textarea
                value={urlsText}
                onChange={(e) => setUrlsText(e.target.value)}
                placeholder="https://example.com Optional Title
https://another-site.com Another Title
..."
                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Each line can contain a URL optionally followed by a title.
              </p>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setMethod('guide')}>
                Back
              </Button>
              <Button onClick={handleUrlsSubmit} disabled={isLoading || !urlsText.trim()}>
                {isLoading ? (
                  <Fragment>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Importing
                  </Fragment>
                ) : (
                  'Import URLs'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
