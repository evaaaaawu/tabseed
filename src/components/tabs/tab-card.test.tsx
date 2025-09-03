import { fireEvent, render, screen } from '@testing-library/react';

import { TabCard } from './tab-card';

describe('TabCard', () => {
  it('renders gridcell role and data-item-id, toggles aria-selected with selection', () => {
    const onSelect = vi.fn();
    render(
      <TabCard
        id="abc"
        url="https://example.com"
        title="Example"
        selected={true}
        onSelect={onSelect}
      />,
    );
    const cell = screen.getByRole('gridcell');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute('data-item-id', 'abc');
    expect(cell).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles selection on Space and opens link on Enter', () => {
    const onSelect = vi.fn();
    render(<TabCard id="1" url="https://example.com" title="Example" onSelect={onSelect} />);

    const cell = screen.getByRole('gridcell');
    cell.focus();
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onSelect).toHaveBeenCalled();

    // mock window.open
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('anchor has proper target and rel', () => {
    render(<TabCard id="1" url="https://example.com" title="Example" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel');
  });
});
