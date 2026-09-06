import { fireEvent, render, screen } from '@testing-library/react';
import { RouteExplorer } from './RouteExplorer';

describe('RouteExplorer', () => {
  it('explains both a longer route and the shortest route', () => {
    render(<RouteExplorer />);

    fireEvent.click(screen.getByRole('button', { name: /through the park/i }));
    expect(screen.getByRole('status')).toHaveTextContent('This route is longer.');

    fireEvent.click(screen.getByRole('button', { name: /across the bridge/i }));
    expect(screen.getByRole('status')).toHaveTextContent('This is the shortest route.');
  });
});
