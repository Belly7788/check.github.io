import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const DonutChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    const option = {
      title: {
        text: '35000.000$',
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937',
        },
        subtextStyle: {
          fontSize: 14,
          color: '#6b7280',
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: true,
        orient: 'vertical', // Vertical legend
        right: 0,
        top: 'center',
        icon: 'circle',
        itemGap: 20,
        textStyle: {
          color: '#4B5563',
          fontSize: 13,
        },
        selectedMode: 'multiple',
      },
      series: [
        {
          name: 'Progress',
          type: 'pie',
          radius: ['60%', '80%'],
          padAngle: 5,
          center: ['40%', '50%'], // Shift chart left for legend room
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          data: [
            { value: 10000, name: 'Done', itemStyle: { color: '#3B82F6' } },
            { value: 10000, name: 'In Progress', itemStyle: { color: '#FACC15' } },
            { value: 15000, name: 'Review', itemStyle: { color: '#FB7185' } },
          ],
        },
      ],
    };

    chart.setOption(option);
    return () => chart.dispose();
  }, []);

  return (
    <div className="flex justify-center items-center">
      <div ref={chartRef} className="w-[320px] h-[240px]" />
    </div>
  );
};

export default DonutChart;
