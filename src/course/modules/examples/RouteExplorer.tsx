import { useState } from 'react';

const ROUTES = [
  { id: 'park', label: 'Through the park', distance: 8, points: '75,225 275,70 545,150', color: 'route-a' },
  { id: 'bridge', label: 'Across the bridge', distance: 5, points: '75,225 300,235 545,150', color: 'route-b' },
  { id: 'market', label: 'Past the market', distance: 9, points: '75,225 285,360 545,150', color: 'route-c' },
] as const;

export function RouteExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const route = ROUTES.find((item) => item.id === selected);

  return (
    <section className="visual-lab" aria-labelledby="route-explorer-title">
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Map explorer</p>
          <h3 id="route-explorer-title">Which route is shortest?</h3>
        </div>
        <p className="visual-prompt">Choose a route before checking its full distance.</p>
      </div>

      <div className="route-map-frame">
        <svg viewBox="0 0 620 430" role="img" aria-labelledby="route-map-title route-map-description">
          <title id="route-map-title">Three routes from home to the studio</title>
          <desc id="route-map-description">The park route is eight kilometres, the bridge route is five kilometres, and the market route is nine kilometres.</desc>
          <path className="map-river" d="M 0 300 C 120 250, 175 330, 260 285 S 420 245, 620 290" />
          {ROUTES.map((item) => (
            <polyline
              className={`map-route ${item.color} ${selected === item.id ? 'is-selected' : ''}`}
              key={item.id}
              points={item.points}
            />
          ))}
          <MapPlace x={75} y={225} label="Home" />
          <MapPlace x={275} y={70} label="Park" />
          <MapPlace x={300} y={235} label="Bridge" />
          <MapPlace x={285} y={360} label="Market" />
          <MapPlace x={545} y={150} label="Studio" goal />
        </svg>
      </div>

      <div className="route-options" aria-label="Route choices">
        {ROUTES.map((item) => (
          <button
            className={selected === item.id ? 'route-choice is-selected' : 'route-choice'}
            key={item.id}
            onClick={() => setSelected(item.id)}
          >
            <span>{item.label}</span>
            <strong>{selected === item.id ? `${item.distance} km` : 'Check distance'}</strong>
          </button>
        ))}
      </div>

      {route && (
        <div className={route.id === 'bridge' ? 'route-feedback is-correct' : 'route-feedback'} role="status">
          <strong>{route.id === 'bridge' ? 'This is the shortest route.' : 'This route is longer.'}</strong>
          <p>
            {route.id === 'bridge'
              ? 'Its two road sections add up to 5 km. The first section is not the shortest, but the complete route is.'
              : `${route.label} covers ${route.distance} km. Compare the complete distance with the bridge route.`}
          </p>
        </div>
      )}
    </section>
  );
}

function MapPlace({ x, y, label, goal = false }: { x: number; y: number; label: string; goal?: boolean }) {
  return (
    <g className={goal ? 'map-place is-goal' : 'map-place'} transform={`translate(${x} ${y})`}>
      <circle r="24" />
      <circle r="8" />
      <text y="43" textAnchor="middle">{label}</text>
    </g>
  );
}
