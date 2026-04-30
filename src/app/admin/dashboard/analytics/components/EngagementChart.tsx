'use client';

import styles from './EngagementChart.module.css';

interface EngagementChartProps {
  months: string[];
  subscribersData: number[];
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 280;
const PADDING = { top: 20, right: 20, bottom: 40, left: 50 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export default function EngagementChart({ months, subscribersData }: EngagementChartProps) {
  const subs = subscribersData.length > 0 ? subscribersData : months.map(() => 0);
  const maxVal = Math.max(...subs) + 1;
  const yTicks = Array.from({ length: maxVal + 1 }, (_, i) => i);
  const isHistogram = months.length === 1;
  const BAR_WIDTH = PLOT_WIDTH * 0.1;
  const scaleY = (v: number) => PADDING.top + PLOT_HEIGHT - (v / maxVal) * PLOT_HEIGHT;
  const scaleX = (i: number) => PADDING.left + (i / Math.max(months.length - 1, 1)) * PLOT_WIDTH;

  const subscribersPath = subs
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(v)}`)
    .join(' ');
  const subscribersAreaPath = subs.length > 0 ? `${subscribersPath} L ${scaleX(subs.length - 1)} ${PADDING.top + PLOT_HEIGHT} L ${scaleX(0)} ${PADDING.top + PLOT_HEIGHT} Z` : '';

  return (
    <div className={styles.chartContainer}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className={styles.chartSvg}
        preserveAspectRatio="xMidYMid meet"
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={scaleY(tick)}
              x2={CHART_WIDTH - PADDING.right}
              y2={scaleY(tick)}
              className={styles.gridLine}
            />
            <text
              x={PADDING.left - 8}
              y={scaleY(tick) + 4}
              className={styles.axisLabel}
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        ))}
        {months.map((m, i) => (
          <text
            key={m}
            x={isHistogram ? PADDING.left + PLOT_WIDTH / 2 : scaleX(i)}
            y={CHART_HEIGHT - 8}
            className={styles.axisLabel}
            textAnchor="middle"
          >
            {m}
          </text>
        ))}
        {isHistogram ? (
          <rect
            x={PADDING.left + PLOT_WIDTH / 2 - BAR_WIDTH / 2}
            y={scaleY(subs[0])}
            width={BAR_WIDTH}
            height={PADDING.top + PLOT_HEIGHT - scaleY(subs[0])}
            rx={4}
            className={styles.subscribersBar}
          />
        ) : (
          <>
            {subscribersAreaPath && <path d={subscribersAreaPath} className={styles.subscribersArea} />}
            {subscribersPath && <path d={subscribersPath} className={styles.subscribersLine} fill="none" />}
          </>
        )}
      </svg>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.subscribers}`} />
          <span>Subscribers</span>
        </div>
      </div>
    </div>
  );
}
