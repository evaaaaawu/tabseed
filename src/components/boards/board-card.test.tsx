import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { BoardCard } from './board-card';

describe('BoardCard', () => {
  it('renders gridcell and toggles aria-selected', () => {
    const onSelect = vi.fn();
    render(<BoardCard id="b1" name="Board" selected={true} onSelect={onSelect} />);
    const cell = screen.getByRole('gridcell');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute('data-item-id', 'b1');
    expect(cell).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect on Space and on click', () => {
    const onSelect = vi.fn();
    render(<BoardCard id="b1" name="Board" onSelect={onSelect} />);
    const cell = screen.getByRole('gridcell');
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onSelect).toHaveBeenCalledWith('b1', expect.objectContaining({ via: 'space' }));
    fireEvent.click(cell);
    expect(onSelect).toHaveBeenCalledWith('b1', expect.objectContaining({ via: 'click' }));
  });

  it('calls onOpen on Enter and double click', () => {
    const onOpen = vi.fn();
    const onSelect = vi.fn();
    render(<BoardCard id="b1" name="Board" onOpen={onOpen} onSelect={onSelect} />);
    const cell = screen.getByRole('gridcell');
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledWith('b1');
    fireEvent.doubleClick(cell);
    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
