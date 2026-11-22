import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../src/app/App';
import { parseHash, screenHref } from '../src/app/hooks';

/** Monday 23 Nov 2026, 6:20 a. m. in Villavicencio. */
function openAt(hash: string, clock = '2026-11-23T06:20') {
  window.history.replaceState(null, '', `/?ahora=${clock}${hash}`);
  return render(<App />);
}

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('hash routes', () => {
  it('round-trips every screen', () => {
    for (const s of [
      { name: 'home' },
      { name: 'routes' },
      { name: 'route', routeId: 'viva', direction: 'outbound' },
      { name: 'route', routeId: 'viva', direction: 'inbound' },
      { name: 'stop', stopId: 'unillanos' },
      { name: 'alerts' },
      { name: 'about' },
    ] as const) {
      expect(parseHash(screenHref(s))).toEqual(s);
    }
    expect(parseHash('#/nada')).toEqual({ name: 'home' });
  });
});

describe('home', () => {
  it('lists the next departures towards the campus with the demo clock', () => {
    openAt('#/');
    const board = screen.getByRole('list', { name: 'Próximas salidas hacia Unillanos' });
    const rows = within(board).getAllByRole('link');
    expect(rows).toHaveLength(9);
    // At 6:20 the Parque route leaves next, at 6:40.
    expect(rows[0]).toHaveTextContent('PAR');
    expect(rows[0]).toHaveTextContent('6:40 a. m.');
    expect(screen.getByLabelText('Hora local')).toHaveTextContent('lun 6:20 a. m.');
  });

  it('searches stops without accents and links to them', async () => {
    const user = userEvent.setup();
    openAt('#/');
    await user.type(screen.getByRole('searchbox'), 'jordan');
    const results = screen.getByRole('list', { name: 'Resultados de búsqueda' });
    const link = within(results).getByRole('link', { name: /Yamaha Jordán/ });
    expect(link).toHaveAttribute('href', '#/paradero/yamaha-jordan');
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'qqqq');
    expect(screen.getByText(/Sin coincidencias/)).toBeInTheDocument();
  });
});

describe('route detail', () => {
  it('shows the stop sequence with estimated times for the next departure', () => {
    openAt('#/ruta/terminal');
    expect(screen.getByRole('heading', { level: 1, name: 'Terminal' })).toBeInTheDocument();
    const selected = screen.getByRole('option', { selected: true });
    expect(selected).toHaveTextContent('7:20 a. m.');
    const stops = screen.getAllByRole('listitem').filter((li) => li.classList.contains('line-stop'));
    expect(stops).toHaveLength(10);
    expect(stops[0]).toHaveTextContent('7:20 a. m.');
    expect(stops[9]).toHaveTextContent('Unillanos · Sede Barcelona');
  });

  it('recomputes the times when another departure is chosen', async () => {
    const user = userEvent.setup();
    openAt('#/ruta/terminal');
    await user.click(screen.getByRole('option', { name: '11:30 a. m.' }));
    const first = screen.getAllByRole('listitem').find((li) => li.classList.contains('line-stop'));
    expect(first).toHaveTextContent('11:30 a. m.');
  });

  it('switches direction and remembers followed routes', async () => {
    const user = userEvent.setup();
    openAt('#/ruta/viva');
    await user.click(screen.getByRole('button', { name: 'Seguir' }));
    expect(screen.getByRole('button', { name: 'Siguiendo' })).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(window.localStorage.getItem('unitrack:rutas-seguidas') ?? '[]')).toEqual(['viva']);
    await go('#/ruta/viva?sentido=regreso');
    expect(screen.getByRole('link', { name: 'Hacia Viva' })).toHaveClass('direction-option--on');
    expect(screen.getByText(/Salidas desde Unillanos/)).toBeInTheDocument();
  });
});

describe('stop detail', () => {
  it('lists the next buses from every route at a shared stop', () => {
    openAt('#/paradero/yamaha-jordan');
    const arrivals = within(screen.getByRole('list', { name: 'Próximos buses' })).getAllByRole('listitem');
    expect(arrivals[0]).toHaveTextContent('GRA');
    expect(arrivals[0]).toHaveTextContent('llegando');
    expect(arrivals.some((a) => a.textContent?.includes('TER'))).toBe(true);
  });

  it('reports an unknown stop', () => {
    openAt('#/paradero/no-existe');
    expect(screen.getByText('Este paradero no existe.')).toBeInTheDocument();
  });
});

describe('alerts', () => {
  it('marks every notice as read and clears the badge', async () => {
    const user = userEvent.setup();
    openAt('#/avisos');
    const tabs = screen.getByRole('navigation', { name: 'Secciones' });
    expect(within(tabs).getByText('6')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Marcar todo como leído' }));
    expect(within(tabs).queryByText('6')).not.toBeInTheDocument();
    expect(screen.queryAllByLabelText('Sin leer')).toHaveLength(0);
  });

  it('filters by followed routes', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('unitrack:rutas-seguidas', JSON.stringify(['covisan']));
    openAt('#/avisos');
    await user.click(screen.getByRole('button', { name: 'Mis rutas (1)' }));
    const titles = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'));
    expect(titles).toContain('Covisán: paso alterno por lluvias');
    expect(titles).not.toContain('Desvío en la glorieta del Terminal');
  });
});
