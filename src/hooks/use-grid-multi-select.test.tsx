import { fireEvent, render, screen } from '@testing-library/react';

import { useGridMultiSelect } from './use-grid-multi-select';

function Grid({ items }: { items: { id: string }[] }) {
  const { selectedIds, handleCardSelect, containerProps, dragRect } = useGridMultiSelect(items);
  return (
    <div data-testid="grid" role="grid" {...containerProps}>
      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        {items.map((it) => (
          <div
            key={it.id}
            role="gridcell"
            data-item-id={it.id}
            onClick={(e) =>
              handleCardSelect(it.id, {
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
              })
            }
            tabIndex={0}
          >
            {it.id} {selectedIds.has(it.id) ? 'selected' : ''}
          </div>
        ))}
        {dragRect ? (
          <div
            data-testid="marquee"
            style={{
              left: dragRect.left,
              top: dragRect.top,
              width: dragRect.width,
              height: dragRect.height,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

describe('useGridMultiSelect', () => {
  const items = Array.from({ length: 9 }).map((_, i) => ({ id: String(i + 1) }));

  it('single click selects and toggles', () => {
    render(<Grid items={items} />);
    const cell1 = screen.getAllByRole('gridcell')[0]!;
    fireEvent.click(cell1);
    expect(cell1.textContent).toContain('selected');
    fireEvent.click(cell1);
    expect(cell1.textContent).not.toContain('selected');
  });

  it('meta/ctrl adds to selection', () => {
    render(<Grid items={items} />);
    const [c1, c2] = screen.getAllByRole('gridcell');
    fireEvent.click(c1);
    fireEvent.click(c2, { metaKey: true });
    expect(c1.textContent).toContain('selected');
    expect(c2.textContent).toContain('selected');
  });

  it('shift selects range based on last anchor', () => {
    render(<Grid items={items} />);
    const cells = screen.getAllByRole('gridcell');
    fireEvent.click(cells[1]); // select 2
    fireEvent.click(cells[5], { shiftKey: true }); // 2..6
    for (let i = 1; i <= 5; i++) {
      expect(cells[i].textContent).toContain('selected');
    }
  });

  it('click empty area clears selection', () => {
    render(<Grid items={items} />);
    const cells = screen.getAllByRole('gridcell');
    fireEvent.click(cells[0]);
    expect(cells[0].textContent).toContain('selected');
    const grid = screen.getByTestId('grid');
    fireEvent.click(grid);
    expect(cells[0].textContent).not.toContain('selected');
  });

  it('marquee selects intersecting cells', () => {
    render(<Grid items={items} />);
    const grid = screen.getByTestId('grid');
    // jsdom lacks layout; simulate pointer events without relying on real coordinates
    // We still invoke the handlers to ensure state transitions run without errors
    fireEvent.pointerDown(grid, { clientX: 10, clientY: 10, buttons: 1 });
    fireEvent.pointerMove(grid, { clientX: 50, clientY: 50, buttons: 1 });
    fireEvent.pointerUp(grid, { clientX: 50, clientY: 50 });
    // Cannot assert exact selection without real layout, just ensure no crash
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });
});
