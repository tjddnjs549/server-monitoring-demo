// 서버 모니터링 데이터 시뮬레이션 유틸리티
export interface ServerMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  responseTime: number;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  label?: string;
}

export class DataSimulator {
  private static instance: DataSimulator;
  private data: ServerMetrics[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private isStressTest = false;
  private stressTestStartTime = 0;
  private stressTestInterval: NodeJS.Timeout | null = null;
  private memoryStressData: any[] = [];

  private constructor() {
    this.generateInitialData();
  }

  public static getInstance(): DataSimulator {
    if (!DataSimulator.instance) {
      DataSimulator.instance = new DataSimulator();
    }
    return DataSimulator.instance;
  }

  private generateInitialData(): void {
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 1000);
      this.data.push(this.generateRandomMetrics(timestamp));
    }
  }

  private generateRandomMetrics(timestamp: Date): ServerMetrics {
    const baseTime = timestamp.getTime();
    const timeVariation = Math.sin(baseTime / 10000) * 0.3;
    
    // 과부하 테스트 중일 때 더 극단적인 값 생성
    const stressMultiplier = this.isStressTest ? 2.0 : 1;
    const stressOffset = this.isStressTest ? 30 : 0;
    
    return {
      timestamp: timestamp.toISOString(),
      cpuUsage: Math.max(0, Math.min(100, 30 + Math.random() * 40 * stressMultiplier + timeVariation * 20 + stressOffset)),
      memoryUsage: Math.max(0, Math.min(100, 40 + Math.random() * 30 * stressMultiplier + timeVariation * 15 + stressOffset)),
      diskUsage: Math.max(0, Math.min(100, 20 + Math.random() * 20 * stressMultiplier + timeVariation * 10 + stressOffset)),
      networkIn: Math.max(0, Math.random() * 1000 * stressMultiplier + timeVariation * 200 + stressOffset * 10),
      networkOut: Math.max(0, Math.random() * 800 * stressMultiplier + timeVariation * 150 + stressOffset * 8),
      activeConnections: Math.max(0, Math.floor(Math.random() * 500 * stressMultiplier + timeVariation * 100 + stressOffset * 5)),
      responseTime: Math.max(0, Math.random() * 200 * stressMultiplier + timeVariation * 50 + stressOffset * 2)
    };
  }

  public startSimulation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      const newData = this.generateRandomMetrics(new Date());
      this.data.push(newData);
      
      // 최대 60개 데이터 포인트 유지
      if (this.data.length > 60) {
        this.data.shift();
      }
    }, 1000);
  }

  public stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public startStressTest(): void {
    this.isStressTest = true;
    this.stressTestStartTime = Date.now();
    
    // CPU 집약적 작업 시작 (매 100ms마다 실행)
    this.stressTestInterval = setInterval(() => {
      this.performCpuIntensiveTask();
      this.performMemoryStress();
    }, 100);
  }

  public stopStressTest(): void {
    this.isStressTest = false;
    if (this.stressTestInterval) {
      clearInterval(this.stressTestInterval);
      this.stressTestInterval = null;
    }
    // 메모리 정리
    this.memoryStressData = [];
  }

  // CPU 집약적 작업 (실제 CPU 사용률 증가)
  private performCpuIntensiveTask(): void {
    if (!this.isStressTest) return;
    
    // 복잡한 수학 계산으로 CPU 사용률 증가 (80% 강도)
    let result = 0;
    for (let i = 0; i < 800000; i++) {
      result += Math.sqrt(Math.random() * 800000) * Math.sin(i) * Math.cos(i);
    }
    // result를 사용하여 경고 방지
    if (result > 0) {
      // CPU 집약적 작업 완료
    }
  }

  // 메모리 스트레스 (실제 메모리 사용량 증가)
  private performMemoryStress(): void {
    if (!this.isStressTest) return;
    
    // 큰 배열을 생성하여 메모리 사용량 증가 (80% 강도)
    const largeArray = new Array(80000).fill(0).map(() => ({
      id: Math.random(),
      data: new Array(80).fill(Math.random()),
      timestamp: Date.now(),
      stress: Math.random() * 800000
    }));
    
    this.memoryStressData.push(largeArray);
    
    // 메모리 사용량이 너무 커지면 일부 정리
    if (this.memoryStressData.length > 50) {
      this.memoryStressData = this.memoryStressData.slice(-30);
    }
  }

  public getStressTestTime(): number {
    if (!this.isStressTest) return 0;
    return Math.floor((Date.now() - this.stressTestStartTime) / 1000);
  }

  public isStressTestActive(): boolean {
    return this.isStressTest;
  }

  // 실제 성능 지표 가져오기
  public getPerformanceMetrics(): {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
    isStressed: boolean;
  } {
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? 
      Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100) : 0;
    
    // 간단한 CPU 사용률 추정 (실제로는 더 복잡한 방법이 필요)
    const cpuUsage = this.isStressTest ? 
      Math.min(95, 30 + Math.random() * 50 + (this.memoryStressData.length * 2)) : 
      Math.random() * 20;
    
    // 응답 시간 측정 (과부하 시 증가)
    const responseTime = this.isStressTest ? 
      Math.random() * 500 + 200 + (this.memoryStressData.length * 10) : 
      Math.random() * 100 + 50;
    
    return {
      memoryUsage,
      cpuUsage,
      responseTime,
      isStressed: this.isStressTest
    };
  }

  public getData(): ServerMetrics[] {
    return [...this.data];
  }

  public getLatestData(): ServerMetrics | null {
    return this.data.length > 0 ? this.data[this.data.length - 1] : null;
  }

  // Chart.js용 데이터 변환
  public getChartJsData(metric: keyof Omit<ServerMetrics, 'timestamp'>): {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }>;
  } {
    const labels = this.data.map(d => new Date(d.timestamp).toLocaleTimeString());
    const values = this.data.map(d => d[metric]);
    
    return {
      labels,
      datasets: [{
        label: this.getMetricLabel(metric),
        data: values,
        borderColor: this.getMetricColor(metric),
        backgroundColor: this.getMetricColor(metric, 0.1),
        tension: 0.4
      }]
    };
  }

  // ECharts용 데이터 변환
  public getEChartsData(metric: keyof Omit<ServerMetrics, 'timestamp'>): {
    xAxis: string[];
    series: Array<{
      name: string;
      data: number[];
      type: string;
      smooth: boolean;
    }>;
  } {
    const xAxis = this.data.map(d => new Date(d.timestamp).toLocaleTimeString());
    const series = [{
      name: this.getMetricLabel(metric),
      data: this.data.map(d => d[metric]),
      type: 'line',
      smooth: true
    }];

    return { xAxis, series };
  }

  // Recharts용 데이터 변환
  public getRechartsData(metric: keyof Omit<ServerMetrics, 'timestamp'>): ChartDataPoint[] {
    return this.data.map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString(),
      value: d[metric]
    }));
  }

  // Victory용 데이터 변환
  public getVictoryData(metric: keyof Omit<ServerMetrics, 'timestamp'>): Array<{x: string, y: number}> {
    return this.data.map((d, index) => ({
      x: new Date(d.timestamp).toLocaleTimeString(),
      y: d[metric]
    }));
  }

  // Nivo용 데이터 변환
  public getNivoData(metric: keyof Omit<ServerMetrics, 'timestamp'>): Array<{x: string, y: number, time: string, value: number}> {
    return this.data.map((d, index) => ({
      x: new Date(d.timestamp).toLocaleTimeString(),
      y: d[metric],
      time: new Date(d.timestamp).toLocaleTimeString(),
      value: d[metric]
    }));
  }

  private getMetricLabel(metric: keyof Omit<ServerMetrics, 'timestamp'>): string {
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
  }

  private getMetricColor(metric: keyof Omit<ServerMetrics, 'timestamp'>, alpha: number = 1): string {
    const colors: Record<keyof Omit<ServerMetrics, 'timestamp'>, string> = {
      cpuUsage: `rgba(255, 99, 132, ${alpha})`,
      memoryUsage: `rgba(54, 162, 235, ${alpha})`,
      diskUsage: `rgba(255, 205, 86, ${alpha})`,
      networkIn: `rgba(75, 192, 192, ${alpha})`,
      networkOut: `rgba(153, 102, 255, ${alpha})`,
      activeConnections: `rgba(255, 159, 64, ${alpha})`,
      responseTime: `rgba(199, 199, 199, ${alpha})`
    };
    return colors[metric];
  }
}
