import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useContainerSize } from '@/hooks/useContainerSize';

// ---- Constants ----

const WORLD_W = 2400;
const WORLD_H = 400;
const TIMELINE_Y = 200;
const CARD_W = 160;
const CARD_H = 70;
const TOOLTIP_W = 220;
const TOOLTIP_H = 90;

// ---- Data ----

interface Milestone {
  year: number;
  title: string;
  description: string;
}

interface AIWinter {
  startYear: number;
  endYear: number;
  label: string;
}

const MILESTONES: Milestone[] = [
  { year: 1943, title: 'McCulloch-Pitts', description: 'First mathematical model of a neuron' },
  { year: 1950, title: "Turing's Paper", description: 'Can machines think?' },
  { year: 1956, title: 'Dartmouth Conference', description: 'AI born as a field' },
  { year: 1966, title: 'ELIZA', description: 'First chatbot' },
  { year: 1969, title: 'Shakey', description: 'First mobile robot' },
  { year: 1980, title: 'Expert Systems', description: 'Rule-based AI boom' },
  { year: 1997, title: 'Deep Blue', description: 'Beats world chess champion' },
  { year: 2011, title: 'Watson', description: 'Wins Jeopardy!' },
  { year: 2012, title: 'AlexNet', description: 'Deep learning revolution' },
  { year: 2016, title: 'AlphaGo', description: 'Beats Go world champion' },
  { year: 2020, title: 'GPT-3', description: 'Large language models arrive' },
  { year: 2023, title: 'ChatGPT / Claude', description: 'AI goes mainstream' },
];

const AI_WINTERS: AIWinter[] = [
  { startYear: 1974, endYear: 1980, label: 'AI Winter 1' },
  { startYear: 1987, endYear: 1993, label: 'AI Winter 2' },
];

// Map a year to world X coordinate
const YEAR_MIN = 1940;
const YEAR_MAX = 2025;
const MARGIN = 80;

// ---- Component ----

export default function AITimelineViz() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { width: containerW } = useContainerSize(containerRef, { width: 700, height: 350 });
  const displayW = Math.min(containerW - 16, 900);
  const displayH = 350;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node() || displayW <= 0) return;

    // Clear previous content
    svg.selectAll('*').remove();

    // Set up SVG dimensions and viewBox
    svg.attr('width', displayW).attr('height', displayH).attr('viewBox', `0 0 ${WORLD_W} ${WORLD_H}`);

    // Create D3 scale for year to X coordinate
    const xScale = d3.scaleLinear().domain([YEAR_MIN, YEAR_MAX]).range([MARGIN, WORLD_W - MARGIN]);

    // Main group for all content (will be transformed by zoom)
    const mainGroup = svg.append('g');

    // Set up zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 4])
      .translateExtent([
        [0, 0],
        [WORLD_W, WORLD_H],
      ])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform.toString());
      });

    svg.call(zoom as unknown as (selection: typeof svg) => void);

    // Fit to view on mount
    const initialScale = Math.min(displayW / WORLD_W, displayH / WORLD_H);
    const initialTransform = d3.zoomIdentity.scale(initialScale);
    svg.call(zoom.transform as unknown as (selection: typeof svg, transform: d3.ZoomTransform) => void, initialTransform);

    // Background
    mainGroup
      .append('rect')
      .attr('x', -200)
      .attr('y', -200)
      .attr('width', WORLD_W + 400)
      .attr('height', WORLD_H + 400)
      .attr('class', 'fill-background');

    // AI Winter shaded regions
    const winterGroup = mainGroup.append('g').attr('class', 'ai-winters');

    AI_WINTERS.forEach((winter) => {
      const x1 = xScale(winter.startYear);
      const x2 = xScale(winter.endYear);
      const winterWidth = x2 - x1;

      // Shaded region
      winterGroup
        .append('rect')
        .attr('x', x1)
        .attr('y', 20)
        .attr('width', winterWidth)
        .attr('height', WORLD_H - 40)
        .attr('fill', 'rgba(239, 68, 68, 0.10)');

      // Dashed border
      winterGroup
        .append('rect')
        .attr('x', x1)
        .attr('y', 20)
        .attr('width', winterWidth)
        .attr('height', WORLD_H - 40)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(239, 68, 68, 0.25)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '6,4');

      // Label
      winterGroup
        .append('text')
        .attr('x', (x1 + x2) / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'rgba(239, 68, 68, 0.6)')
        .attr('font-size', '12px')
        .attr('font-style', 'italic')
        .attr('class', 'font-sans')
        .text(winter.label);
    });

    // Timeline line
    mainGroup
      .append('line')
      .attr('x1', xScale(YEAR_MIN))
      .attr('y1', TIMELINE_Y)
      .attr('x2', xScale(YEAR_MAX))
      .attr('y2', TIMELINE_Y)
      .attr('class', 'stroke-border')
      .attr('stroke-width', 2);

    // Year markers
    const yearMarks: number[] = [];
    for (let y = 1940; y <= 2020; y += 10) yearMarks.push(y);
    yearMarks.push(2025);

    const yearMarkersGroup = mainGroup.append('g').attr('class', 'year-markers');

    yearMarks.forEach((year) => {
      const x = xScale(year);

      // Tick line
      yearMarkersGroup
        .append('line')
        .attr('x1', x)
        .attr('y1', TIMELINE_Y - 8)
        .attr('x2', x)
        .attr('y2', TIMELINE_Y + 8)
        .attr('class', 'stroke-muted-foreground')
        .attr('stroke-width', 1);

      // Year label
      yearMarkersGroup
        .append('text')
        .attr('x', x)
        .attr('y', TIMELINE_Y + 22)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'fill-muted-foreground font-sans')
        .attr('font-size', '11px')
        .text(String(year));
    });

    // Milestones
    const milestonesGroup = mainGroup.append('g').attr('class', 'milestones');

    MILESTONES.forEach((milestone, i) => {
      const cx = xScale(milestone.year);
      const above = i % 2 === 0;
      const cardX = cx - CARD_W / 2;
      const cardY = above ? TIMELINE_Y - 50 - CARD_H : TIMELINE_Y + 50;

      const milestoneGroup = milestonesGroup.append('g').attr('class', `milestone milestone-${i}`);

      // Connector line from timeline dot to card
      const connectorEndY = above ? cardY + CARD_H : cardY;
      milestoneGroup
        .append('line')
        .attr('x1', cx)
        .attr('y1', TIMELINE_Y)
        .attr('x2', cx)
        .attr('y2', connectorEndY)
        .attr('class', 'stroke-border connector-line')
        .attr('stroke-width', 1);

      // Timeline dot
      milestoneGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', TIMELINE_Y)
        .attr('r', 5)
        .attr('class', 'fill-foreground timeline-dot')
        .attr('stroke-width', 2);

      // Card background
      milestoneGroup
        .append('rect')
        .attr('x', cardX)
        .attr('y', cardY)
        .attr('width', CARD_W)
        .attr('height', CARD_H)
        .attr('rx', 6)
        .attr('class', 'fill-card stroke-border card-bg')
        .attr('stroke-width', 1);

      // Card text - year
      milestoneGroup
        .append('text')
        .attr('x', cx)
        .attr('y', cardY + 16)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'fill-muted-foreground font-sans card-year')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(String(milestone.year));

      // Card text - title
      milestoneGroup
        .append('text')
        .attr('x', cx)
        .attr('y', cardY + 34)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'fill-foreground font-sans card-title')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .text(milestone.title);

      // Card text - description
      milestoneGroup
        .append('text')
        .attr('x', cx)
        .attr('y', cardY + 52)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'fill-muted-foreground font-sans card-description')
        .attr('font-size', '10px')
        .text(milestone.description);

      // Interactive overlay for hover
      milestoneGroup
        .append('rect')
        .attr('x', cardX)
        .attr('y', cardY)
        .attr('width', CARD_W)
        .attr('height', CARD_H)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoverIndex(i))
        .on('mouseleave', () => setHoverIndex(null));

      // Also make the dot interactive
      milestoneGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', TIMELINE_Y)
        .attr('r', 10)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', () => setHoverIndex(i))
        .on('mouseleave', () => setHoverIndex(null));
    });
  }, [displayW, displayH]);

  // Update hover styles
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Reset all milestones
    svg.selectAll('.milestone').each(function () {
      const group = d3.select(this);
      group.select('.timeline-dot').attr('r', 5).attr('class', 'fill-foreground timeline-dot').attr('stroke', 'none');
      group.select('.card-bg').attr('class', 'fill-card stroke-border card-bg');
      group.select('.card-year').attr('class', 'fill-muted-foreground font-sans card-year');
      group.select('.card-title').attr('class', 'fill-foreground font-sans card-title');
      group.select('.card-description').attr('class', 'fill-muted-foreground font-sans card-description');
    });

    // Update hovered milestone
    if (hoverIndex !== null) {
      const hoveredGroup = svg.select(`.milestone-${hoverIndex}`);
      hoveredGroup.select('.timeline-dot').attr('r', 7).attr('class', 'fill-primary timeline-dot').attr('stroke', 'hsl(var(--background))');
      hoveredGroup.select('.card-bg').attr('class', 'fill-primary stroke-primary card-bg');
      hoveredGroup.select('.card-year').attr('class', 'fill-primary-foreground font-sans card-year');
      hoveredGroup.select('.card-title').attr('class', 'fill-primary-foreground font-sans card-title');
      hoveredGroup.select('.card-description').attr('class', 'fill-primary-foreground font-sans card-description');
    }
  }, [hoverIndex]);

  // Render tooltip
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('.tooltip').remove();

    if (hoverIndex !== null) {
      const milestone = MILESTONES[hoverIndex];
      const xScale = d3.scaleLinear().domain([YEAR_MIN, YEAR_MAX]).range([MARGIN, WORLD_W - MARGIN]);
      const cx = xScale(milestone.year);
      const above = hoverIndex % 2 === 0;
      const cardX = cx - CARD_W / 2;
      const cardY = above ? TIMELINE_Y - 50 - CARD_H : TIMELINE_Y + 50;

      const tooltipX = cardX + CARD_W / 2 - TOOLTIP_W / 2;
      const tooltipY = above ? cardY - TOOLTIP_H - 10 : cardY + CARD_H + 10;

      // Clamp to world bounds
      const clampedX = Math.max(10, Math.min(WORLD_W - TOOLTIP_W - 10, tooltipX));
      const clampedY = Math.max(10, Math.min(WORLD_H - TOOLTIP_H - 10, tooltipY));

      const tooltipGroup = svg.append('g').attr('class', 'tooltip').style('pointer-events', 'none');

      // Shadow effect using filter
      const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
      const filterId = 'tooltip-shadow';
      if (defs.select(`#${filterId}`).empty()) {
        const filter = defs.append('filter').attr('id', filterId).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
        filter.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', 3);
        filter.append('feOffset').attr('dx', 0).attr('dy', 2).attr('result', 'offsetblur');
        filter.append('feComponentTransfer').append('feFuncA').attr('type', 'linear').attr('slope', 0.3);
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
      }

      // Tooltip background
      tooltipGroup
        .append('rect')
        .attr('x', clampedX)
        .attr('y', clampedY)
        .attr('width', TOOLTIP_W)
        .attr('height', TOOLTIP_H)
        .attr('rx', 8)
        .attr('class', 'fill-card stroke-primary')
        .attr('stroke-width', 2)
        .attr('filter', `url(#${filterId})`);

      // Tooltip text - year
      tooltipGroup
        .append('text')
        .attr('x', clampedX + TOOLTIP_W / 2)
        .attr('y', clampedY + 18)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'fill-primary font-sans')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(String(milestone.year));

      // Tooltip text - title
      tooltipGroup
        .append('text')
        .attr('x', clampedX + TOOLTIP_W / 2)
        .attr('y', clampedY + 38)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'fill-foreground font-sans')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .text(milestone.title);

      // Tooltip text - description (word-wrapped)
      const desc = milestone.description;
      const maxChars = 34;
      if (desc.length <= maxChars) {
        tooltipGroup
          .append('text')
          .attr('x', clampedX + TOOLTIP_W / 2)
          .attr('y', clampedY + 58)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'fill-muted-foreground font-sans')
          .attr('font-size', '12px')
          .text(desc);
      } else {
        const words = desc.split(' ');
        let line1 = '';
        let line2 = '';
        let onSecond = false;
        for (const word of words) {
          if (!onSecond && (line1 + ' ' + word).trim().length <= maxChars) {
            line1 = (line1 + ' ' + word).trim();
          } else {
            onSecond = true;
            line2 = (line2 + ' ' + word).trim();
          }
        }
        tooltipGroup
          .append('text')
          .attr('x', clampedX + TOOLTIP_W / 2)
          .attr('y', clampedY + 54)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'fill-muted-foreground font-sans')
          .attr('font-size', '12px')
          .text(line1);
        tooltipGroup
          .append('text')
          .attr('x', clampedX + TOOLTIP_W / 2)
          .attr('y', clampedY + 70)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('class', 'fill-muted-foreground font-sans')
          .attr('font-size', '12px')
          .text(line2);
      }
    }
  }, [hoverIndex]);

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden" ref={containerRef}>
      <div className="text-sm font-medium text-muted-foreground mb-2">
        History of AI (1943 - 2025) &mdash; drag to pan, scroll to zoom
      </div>
      <svg ref={svgRef} className="w-full" style={{ cursor: hoverIndex !== null ? 'pointer' : 'grab' }} />
    </div>
  );
}
