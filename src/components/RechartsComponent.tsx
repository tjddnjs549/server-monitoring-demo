import React, { useEffect, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { DataSimulator, ServerMetrics } from '../utils/dataSimulator';

interface RechartsComponentProps {
  metric: keyof Omit<ServerMetrics, 'timestamp'>;
  title: string;
}

const RechartsComponent: React.FC<RechartsComponentProps> = ({ metric, title }) => {
  const [data, setData] = useState(DataSimulator.getInstance().getRechartsData(metric));
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const simulator = DataSimulator.getInstance();
    
    const updateData = () => {
      setData(simulator.getRechartsData(metric));
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`시간: ${label}`}</p>
          <p className="tooltip-value" style={{ color: payload[0].color }}>
            {`${getMetricLabel()}: ${payload[0].value.toFixed(2)}`}
          </p>
        </div>
      );
    }
    return null;
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#666"
              fontSize={12}
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              domain={[0, metric.includes('Usage') ? 100 : 'dataMax']}
              label={{ 
                value: getMetricLabel(), 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={getColor()}
              fill={getColor()}
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6, stroke: getColor(), strokeWidth: 2 }}
              name={getMetricLabel()}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RechartsComponent;
