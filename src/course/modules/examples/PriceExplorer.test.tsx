import { fireEvent, render, screen } from '@testing-library/react';
import { PriceExplorer } from './PriceExplorer';

describe('PriceExplorer', () => {
  it('updates the total when a parameter changes', () => {
    render(<PriceExplorer />);

    expect(screen.getByText('44 kr', { selector: '.live-readout strong' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Price per hour'), { target: { value: '10' } });
    expect(screen.getByText('50 kr', { selector: '.live-readout strong' })).toBeInTheDocument();
  });
});
