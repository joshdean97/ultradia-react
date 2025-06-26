'use client';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

export default function VibeScoreHistoryChart({ data }: { data: { date: string; score: number; zone: string }[] }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current as HTMLDivElement);

    const colorMap = {
      Green: '#22c55e',
      Yellow: '#eab308',
      Orange: '#f97316',
      Red: '#ef4444',
    };

    const option = {
      title: {
        text: 'Vibe Score Over Time',
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#1e293b',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          return `${p.name}<br/>Score: <strong>${p.value}</strong> (${p.data.zone})`;
        },
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}' },
      },
      series: [
        {
          type: 'line',
          data: data.map((d) => ({
            value: d.score,
            itemStyle: { color: colorMap[d.zone] || '#94a3b8' },
            zone: d.zone,
          })),
          smooth: true,
          lineStyle: { width: 3 },
          symbolSize: 10,
        },
      ],
    };

    chart.setOption(option);
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-[300px] mt-6" />;
}
