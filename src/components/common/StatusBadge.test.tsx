import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renderizza lo stato', () => {
    render(<StatusBadge status="Chiusa" />);
    expect(screen.getByText('Chiusa')).toBeInTheDocument();
  });
  it('gestisce stati sconosciuti senza rompere', () => {
    render(<StatusBadge status="StatoNuovo" />);
    expect(screen.getByText('StatoNuovo')).toBeInTheDocument();
  });
});
