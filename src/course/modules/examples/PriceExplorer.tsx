import { useMemo, useState } from 'react';

const MAX_HOURS = 6;
const CHART = { width: 620, height: 300, left: 54, right: 24, top: 22, bottom: 46 };

export function PriceExplorer() {
  const [startFee, setStartFee] = useState(20);
  const [hourlyPrice, setHourlyPrice] = useState(8);
  const [hours, setHours] = useState(3);
  const total = startFee + hourlyPrice * hours;

  const points = useMemo(() => Array.from({ length: MAX_HOURS + 1 }, (_, hour) => ({
    hour,
    price: startFee + hourlyPrice * hour,
  })), [startFee, hourlyPrice]);
  const highestPrice = points.at(-1)?.price ?? 0;
  const maxValue = Math.ceil(Math.max(80, highestPrice) / 20) * 20;
  const verticalTicks = Array.from({ length: 5 }, (_, index) => index * (maxValue / 4));

  const x = (value: number) => CHART.left + (value / MAX_HOURS) * (CHART.width - CHART.left - CHART.right);
  const y = (value: number) => CHART.top + (1 - value / maxValue) * (CHART.height - CHART.top - CHART.bottom);
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.hour)} ${y(point.price)}`).join(' ');

  return (
    <section className="visual-lab" aria-labelledby="price-explorer-title">
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Parameter explorer</p>
          <h3 id="price-explorer-title">Build the price one part at a time</h3>
        </div>
        <div className="live-readout" aria-live="polite">
          <span>Total after {hours} hour{hours === 1 ? '' : 's'}</span>
          <strong>{total} kr</strong>
        </div>
      </div>

      <div className="control-grid">
        <label>
          <span>Starting fee <strong>{startFee} kr</strong></span>
          <input
            aria-label="Starting fee"
            type="range"
            min="0"
            max="40"
            step="5"
            value={startFee}
            onChange={(event) => setStartFee(Number(event.target.value))}
          />
          <small>Moves the whole line up or down.</small>
        </label>
        <label>
          <span>Price per hour <strong>{hourlyPrice} kr</strong></span>
          <input
            aria-label="Price per hour"
            type="range"
            min="2"
            max="12"
            step="1"
            value={hourlyPrice}
            onChange={(event) => setHourlyPrice(Number(event.target.value))}
          />
          <small>Changes how steeply the line rises.</small>
        </label>
        <label>
          <span>Ride length <strong>{hours} h</strong></span>
          <input
            aria-label="Ride length"
            type="range"
            min="0"
            max={MAX_HOURS}
            step="1"
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
          />
          <small>Chooses the point we read from the line.</small>
        </label>
      </div>

      <div className="chart-frame">
        <svg viewBox={`0 0 ${CHART.width} ${CHART.height}`} role="img" aria-labelledby="price-chart-title price-chart-description">
          <title id="price-chart-title">Bicycle hire price by ride length</title>
          <desc id="price-chart-description">The line begins at {startFee} kroner and rises by {hourlyPrice} kroner each hour. The selected total is {total} kroner after {hours} hours.</desc>
          {verticalTicks.map((tick) => (
            <g key={tick}>
              <line className="chart-grid-line" x1={CHART.left} x2={CHART.width - CHART.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-tick" x={CHART.left - 10} y={y(tick) + 4} textAnchor="end">{tick}</text>
            </g>
          ))}
          {points.map((point) => (
            <text className="chart-tick" key={point.hour} x={x(point.hour)} y={CHART.height - 17} textAnchor="middle">{point.hour}</text>
          ))}
          <line className="chart-axis" x1={CHART.left} x2={CHART.left} y1={CHART.top} y2={CHART.height - CHART.bottom} />
          <line className="chart-axis" x1={CHART.left} x2={CHART.width - CHART.right} y1={CHART.height - CHART.bottom} y2={CHART.height - CHART.bottom} />
          <path className="chart-data-line" d={path} />
          <line className="chart-guide" x1={x(hours)} x2={x(hours)} y1={y(total)} y2={CHART.height - CHART.bottom} />
          <circle className="chart-focus" cx={x(hours)} cy={y(total)} r="8" />
          <text className="chart-label" x={x(hours)} y={Math.max(y(total) - 16, CHART.top + 14)} textAnchor="middle">{total} kr</text>
          <text className="chart-axis-label" x={(CHART.left + CHART.width - CHART.right) / 2} y={CHART.height - 2} textAnchor="middle">hours</text>
          <text className="chart-axis-label" x="14" y={CHART.height / 2} textAnchor="middle" transform={`rotate(-90 14 ${CHART.height / 2})`}>price in kroner</text>
        </svg>
      </div>

      <p className="formula-strip">
        <span>Total price</span>
        <strong>{startFee}</strong>
        <span>+</span>
        <strong>{hourlyPrice} × {hours}</strong>
        <span>=</span>
        <strong>{total} kr</strong>
      </p>
    </section>
  );
}
