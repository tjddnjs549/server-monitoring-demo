import React, { useEffect, useState, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { DataSimulator, ServerMetrics } from '../utils/dataSimulator';

interface EChartsComponentProps {
  metric: keyof Omit<ServerMetrics, 'timestamp'>;
  title: string;
}

const EChartsComponent: React.FC<EChartsComponentProps> = ({ metric, title }) => {
  const [data, setData] = useState(DataSimulator.getInstance().getEChartsData(metric));
  const [isRunning, setIsRunning] = useState(false);
  const chartRef = useRef<ReactECharts>(null);

  useEffect(() => {
    const simulator = DataSimulator.getInstance();
    
    const updateData = () => {
      setData(simulator.getEChartsData(metric));
    };

    // 초기 데이터 설정
    updateData();

    // 시뮬레이션 시작
    simulator.startSimulation();
    setIsRunning(true);

    // 1초마다 데이터 업데이트
    const interval = setInterval(updateData, 1000);

    return () => {
      clearInterval(interval);
      simulator.stopSimulation();
      setIsRunning(false);
    };
  }, [metric]);

  const getOption = () => {
    const colors = {
      cpuUsage: '#ff6384',
      memoryUsage: '#36a2eb',
      diskUsage: '#ffcd56',
      networkIn: '#4bc0c0',
      networkOut: '#9966ff',
      activeConnections: '#ff9f40',
      responseTime: '#c7c7c7'
    };

    return {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        formatter: function(params: any) {
          const param = params[0];
          return `${param.axisValue}<br/>${param.seriesName}: ${param.value.toFixed(2)}`;
        }
      },
      legend: {
        data: [data.series[0].name],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.xAxis,
        axisLabel: {
          rotate: 45,
          interval: 'auto'
        }
      },
      yAxis: {
        type: 'value',
        name: data.series[0].name,
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        max: metric.includes('Usage') ? 100 : undefined
      },
      series: [
        {
          name: data.series[0].name,
          type: 'line',
          data: data.series[0].data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          lineStyle: {
            width: 2,
            color: colors[metric as keyof typeof colors]
          },
          itemStyle: {
            color: colors[metric as keyof typeof colors]
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: colors[metric as keyof typeof colors] + '40'
                },
                {
                  offset: 1,
                  color: colors[metric as keyof typeof colors] + '10'
                }
              ]
            }
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              borderWidth: 2,
              borderColor: '#fff',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    };
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className={`status-indicator ${isRunning ? 'running' : 'stopped'}`}>
          {isRunning ? '실시간 업데이트 중' : '중지됨'}
        </div>
      </div>
      <div className="chart-wrapper">
        <ReactECharts
          ref={chartRef}
          option={getOption()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
};

export default EChartsComponent;
