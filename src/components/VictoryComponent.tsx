import React, { useEffect, useState } from 'react';
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer
} from 'victory';
import { DataSimulator, ServerMetrics } from '../utils/dataSimulator';

interface VictoryComponentProps {
  metric: keyof Omit<ServerMetrics, 'timestamp'>;
  title: string;
}

const VictoryComponent: React.FC<VictoryComponentProps> = ({ metric, title }) => {
  const [data, setData] = useState(DataSimulator.getInstance().getVictoryData(metric));
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const simulator = DataSimulator.getInstance();
    
    const updateData = () => {
      setData(simulator.getVictoryData(metric));
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

  const getColor = () => {
    const colors: Record<keyof Omit<ServerMetrics, 'timestamp'>, string> = {
      cpuUsage: '#ff6384',
      memoryUsage: '#36a2eb',
      diskUsage: '#ffcd56',
      networkIn: '#4bc0c0',
      networkOut: '#9966ff',
      activeConnections: '#ff9f40',
      responseTime: '#c7c7c7'
    };
    return colors[metric];
  };

  const getMetricLabel = () => {
    const labels: Record<keyof Omit<ServerMetrics, 'timestamp'>, string> = {
      cpuUsage: 'CPU 사용률 (%)',
      memoryUsage: '메모리 사용률 (%)',
      diskUsage: '디스크 사용률 (%)',
      networkIn: '네트워크 입력 (MB/s)',
      networkOut: '네트워크 출력 (MB/s)',
      activeConnections: '활성 연결 수',
      responseTime: '응답 시간 (ms)'
    };
    return labels[metric];
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
        {/* @ts-ignore */}
        <VictoryChart
          theme={VictoryTheme.material}
          height={400}
          width={800}
          padding={{ left: 80, right: 50, top: 50, bottom: 80 }}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => `${getMetricLabel()}: ${datum.y.toFixed(2)}`}
              labelComponent={
                <VictoryTooltip
                  style={{ fontSize: 12 }}
                  flyoutStyle={{
                    stroke: getColor(),
                    strokeWidth: 1,
                    fill: 'white',
                    fillOpacity: 0.9
                  }}
                />
              }
            />
          }
        >
          <VictoryAxis
            dependentAxis
            label={getMetricLabel()}
            style={{
              axis: { stroke: '#666' },
              axisLabel: { fontSize: 12, padding: 35 },
              ticks: { stroke: '#666' },
              tickLabels: { fontSize: 10, fill: '#666' }
            }}
            domain={metric.includes('Usage') ? [0, 100] : undefined}
          />
          <VictoryAxis
            label="시간"
            style={{
              axis: { stroke: '#666' },
              axisLabel: { fontSize: 12, padding: 35 },
              ticks: { stroke: '#666' },
              tickLabels: { 
                fontSize: 10, 
                fill: '#666'
              }
            }}
            tickFormat={(t) => {
              // 시간 라벨을 간소화
              const index = parseInt(t);
              if (index % 10 === 0) {
                return data[index]?.x || '';
              }
              return '';
            }}
          />
          <VictoryArea
            data={data}
            style={{
              data: {
                fill: getColor(),
                fillOpacity: 0.1,
                stroke: getColor(),
                strokeWidth: 2
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 1000 }
            }}
          />
          <VictoryLine
            data={data}
            style={{
              data: {
                stroke: getColor(),
                strokeWidth: 2
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 1000 }
            }}
          />
        </VictoryChart>
      </div>
    </div>
  );
};

export default VictoryComponent;
