# /login/test QA Checklist

## Keyboard
- [ ] Tab order: heading → input → submit button → links
- [ ] Enter on input triggers submit
- [ ] Space/Enter on button triggers submit
- [ ] Focus ring visible on all focusable elements
- [ ] Disabled button is skipped by tab navigation

## Screen Reader / a11y
- [ ] Input has label via `label[for]`
- [ ] Error uses `role="alert"` and is referenced by `aria-describedby`
- [ ] Loading state uses `aria-busy` on input and button
- [ ] Announceable error copies for 400/401/429/5xx
- [ ] Page landmarks: implicit main is sufficient; heading present

## Error States
- [ ] 400 shows "Invalid or expired test code..."
- [ ] 401 shows "This code is not authorized yet..."
- [ ] 429 shows "Too many attempts..."
- [ ] 5xx shows "Server error..."
- [ ] Server-provided JSON error.message is surfaced when present

## Resilience
- [ ] Double-click submit is guarded (no duplicate requests)
- [ ] isLoading reset debounced to avoid flicker
- [ ] Network failure shows generic error
- [ ] Retry after backoff works

## Long Text / Edge Cases
- [ ] Error with 200+ chars wraps without layout shift
- [ ] Extremely long code pasted (100+ chars) trimmed/handled
- [ ] Empty input blocked with required + inline message

## Visual / Theming
- [ ] Warning callout contrast OK in dark/light
- [ ] Icon visible and aligned
- [ ] Button loading pulse visible in dark/light

## Links
- [ ] Waitlist link works
- [ ] Back to main login link works
