import { fireEvent, render, screen } from '@testing-library/react';

import { TabCard } from './tab-card';

describe('TabCard', () => {
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
