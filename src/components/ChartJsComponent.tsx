import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DataSimulator, ServerMetrics } from '../utils/dataSimulator';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartJsComponentProps {
  metric: keyof Omit<ServerMetrics, 'timestamp'>;
  title: string;
}

const ChartJsComponent: React.FC<ChartJsComponentProps> = ({ metric, title }) => {
  const [data, setData] = useState(DataSimulator.getInstance().getChartJsData(metric));
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const simulator = DataSimulator.getInstance();
    
    const updateData = () => {
      setData(simulator.getChartJsData(metric));
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '시간'
        },
        ticks: {
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: data.datasets[0].label
        },
        beginAtZero: true,
        max: metric.includes('Usage') ? 100 : undefined
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6
      },
      line: {
        borderWidth: 2
      }
    },
    fill: true
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
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ChartJsComponent;
