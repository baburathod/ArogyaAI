import React from 'react';
import { render, screen } from '@testing-library/react';
import HealthScoreCard from './HealthScoreCard';

describe('HealthScoreCard', () => {
  it('renders score and description', () => {
    render(<HealthScoreCard score={82} trend="up" /> as any);
    expect(screen.getByText(/Health Score/i)).toBeInTheDocument();
    expect(screen.getByText(/82/)).toBeInTheDocument();
  });
});
