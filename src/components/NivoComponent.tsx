import React, { useEffect, useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { DataSimulator, ServerMetrics } from '../utils/dataSimulator';

interface NivoComponentProps {
  metric: keyof Omit<ServerMetrics, 'timestamp'>;
  title: string;
}

const NivoComponent: React.FC<NivoComponentProps> = ({ metric, title }) => {
  const [data, setData] = useState(DataSimulator.getInstance().getNivoData(metric));
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const simulator = DataSimulator.getInstance();
    
    const updateData = () => {
      setData(simulator.getNivoData(metric));
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

  // 차트 타입에 따라 다른 컴포넌트 렌더링
  const renderChart = () => {
    if (metric === 'activeConnections') {
      // 막대 차트
      return (
        <ResponsiveBar
          data={data}
          keys={['value']}
          indexBy="time"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={[getColor()]}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: '시간',
            legendPosition: 'middle',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: getMetricLabel(),
            legendPosition: 'middle',
            legendOffset: -40
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          animate={true}
        />
      );
    } else if (metric === 'diskUsage') {
      // 파이 차트
      const pieData = [
        {
          id: '사용량',
          label: '사용량',
          value: data[data.length - 1]?.value || 0,
          color: getColor()
        },
        {
          id: '여유공간',
          label: '여유공간',
          value: 100 - (data[data.length - 1]?.value || 0),
          color: '#e0e0e0'
        }
      ];

      return (
        <ResponsivePie
          data={pieData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              justify: false,
              translateX: 0,
              translateY: 56,
              itemsSpacing: 0,
              itemWidth: 100,
              itemHeight: 18,
              itemTextColor: '#999',
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 18,
              symbolShape: 'circle'
            }
          ]}
        />
      );
    } else {
      // 라인 차트
      return (
        <ResponsiveLine
          data={[{ id: getMetricLabel(), data: data }]}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
          }}
          yFormat=" >-.2f"
          curve="cardinal"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: '시간',
            legendOffset: 36,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: getMetricLabel(),
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          colors={[getColor()]}
          pointSize={8}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
      );
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        <div className={`status-indicator ${isRunning ? 'running' : 'stopped'}`}>
          {isRunning ? '실시간 업데이트 중' : '중지됨'}
        </div>
      </div>
      <div className="chart-wrapper" style={{ height: '400px' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default NivoComponent;
