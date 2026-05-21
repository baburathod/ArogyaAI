import React from 'react';
import { render, screen } from '@testing-library/react';
import SymptomTrendsChart from './SymptomTrendsChart';

describe('SymptomTrendsChart', () => {
  it('renders chart heading', () => {
    render(<SymptomTrendsChart /> as any);
    expect(screen.getByText(/Symptom Trends/i)).toBeInTheDocument();
  });
});
