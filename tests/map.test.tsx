import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TransitMap } from '../src/map/TransitMap';

beforeEach(() => {
  // jsdom has no layout: give the map container a size.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 300, width: 400, height: 300, toJSON: () => ({}),
  } as DOMRect);
});

afterEach(() => vi.restoreAllMocks());

describe('TransitMap', () => {
  it('draws every route, every stop and the OpenStreetMap credit', () => {
    const { container } = render(<TransitMap focus={{ kind: 'all' }} onSelectStop={() => {}} />);
    expect(container.querySelectorAll('[data-route]')).toHaveLength(9);
    expect(container.querySelectorAll('.map-stop')).toHaveLength(58);
    expect(screen.getByRole('button', { name: 'Unillanos · Sede Barcelona' })).toBeInTheDocument();
    expect(screen.getByText('© OpenStreetMap contributors')).toBeInTheDocument();
  });

  it('opens a stop on tap but not at the end of a drag', () => {
    const onSelectStop = vi.fn();
    render(<TransitMap focus={{ kind: 'all' }} onSelectStop={onSelectStop} />);
    const stop = screen.getByRole('button', { name: 'Unicentro' });
    fireEvent.click(stop);
    expect(onSelectStop).toHaveBeenCalledWith('unicentro');

    onSelectStop.mockClear();
    const map = screen.getByRole('region');
    fireEvent.pointerDown(map, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(map, { pointerId: 1, clientX: 160, clientY: 130 });
    fireEvent.pointerUp(map, { pointerId: 1, clientX: 160, clientY: 130 });
    fireEvent.click(stop);
    expect(onSelectStop).not.toHaveBeenCalled();
  });

  it('dims the routes that do not serve the focused route', () => {
    const { container } = render(
      <TransitMap focus={{ kind: 'route', routeId: 'viva', direction: 'inbound' }} onSelectStop={() => {}} />,
    );
    expect(container.querySelectorAll('.map-route--muted')).toHaveLength(8);
    expect(container.querySelector('[data-route="viva"]')).not.toHaveClass('map-route--muted');
    expect(container.querySelectorAll('.map-stop')).toHaveLength(6);
  });

  it('zooms in with the + control and shows a scale bar', () => {
    render(<TransitMap focus={{ kind: 'all' }} onSelectStop={() => {}} />);
    const svg = screen.getByRole('region').querySelector('svg')!;
    const before = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }));
    const after = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
    expect(after).toBeCloseTo(before / 1.6);
    expect(screen.getByText(/\d+ (m|km)$/)).toBeInTheDocument();
  });
});
