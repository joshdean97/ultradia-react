'use client';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

interface CycleData {
  cycle: number;
  peak_start: string;
  peak_end: string;
  trough_start: string;
  trough_end: string;
  [key: string]: any;
}

export default function UltradianChart({ data }: { data: CycleData[] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const container = chartRef.current as HTMLDivElement;
    const chart = echarts.init(container);

    const seriesData = data.flatMap((d, i) => [
      {
        value: [i, `1970-01-01T${d.peak_start}`, `1970-01-01T${d.peak_end}`, '#3b82f6'],
        label: 'Peak',
        cycle: d.cycle,
        start: d.peak_start,
        end: d.peak_end,
      },
      {
        value: [i, `1970-01-01T${d.trough_start}`, `1970-01-01T${d.trough_end}`, '#f87171'],
        label: 'Trough',
        cycle: d.cycle,
        start: d.trough_start,
        end: d.trough_end,
      },
    ]);

    const options = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const d = params.data;
          return `
            <strong>Cycle ${d.cycle}</strong><br/>
            ${d.label}: ${d.start} – ${d.end}
          `;
        },
      },
      xAxis: {
        type: 'time',
        name: 'Time',
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => `Cycle ${d.cycle}`),
        inverse: true,
      },
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(1), categoryIndex]);
            const end = api.coord([api.value(2), categoryIndex]);
            const height = 20;

            return {
              type: 'rect',
              shape: {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height,
              },
              style: {
                fill: api.value(3),
              },
            };
          },
          encode: { x: [1, 2], y: 0 },
          data: seriesData,
        },
      ],
    };

    chart.setOption(options);

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [data]);

  return (
    <>
      <div ref={chartRef} className="w-full h-[400px]" />
      <div className="mt-4 flex gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-sm" /> Peak
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-400 rounded-sm" /> Trough
        </div>
      </div>
    </>
  );
}
