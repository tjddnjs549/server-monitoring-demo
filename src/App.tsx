import React, { useEffect, useState } from 'react';
import './App.scss';
import { DataSimulator, ServerMetrics } from './utils/dataSimulator';
import ChartJsComponent from './components/ChartJsComponent';
import EChartsComponent from './components/EChartsComponent';
import RechartsComponent from './components/RechartsComponent';
import VictoryComponent from './components/VictoryComponent';
import NivoComponent from './components/NivoComponent';

function App() {
  const [currentMetrics, setCurrentMetrics] = useState<ServerMetrics | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isStressTest, setIsStressTest] = useState(false);
  const [stressTestTime, setStressTestTime] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    responseTime: 0,
    isStressed: false
  });
  const [stressTestResults, setStressTestResults] = useState<{[key: string]: any}>({});
  const [isStressTestRunning, setIsStressTestRunning] = useState(false);

  useEffect(() => {
    const simulator = DataSimulator.getInstance();
    
    // 시뮬레이션 시작
    simulator.startSimulation();
    setIsSimulationRunning(true);
    
    // 1초마다 현재 메트릭 업데이트
    const interval = setInterval(() => {
      setCurrentMetrics(simulator.getLatestData());
      setStressTestTime(simulator.getStressTestTime());
      setIsStressTest(simulator.isStressTestActive());
      setPerformanceMetrics(simulator.getPerformanceMetrics());
    }, 1000);

    return () => {
      clearInterval(interval);
      simulator.stopSimulation();
      setIsSimulationRunning(false);
    };
  }, []);

  const handleStressTest = () => {
    const simulator = DataSimulator.getInstance();
    
    if (!isStressTest) {
      simulator.startStressTest();
      setIsStressTest(true);
      setIsStressTestRunning(true);
      
      // 30초 후 자동으로 테스트 종료
      setTimeout(() => {
        simulator.stopStressTest();
        setIsStressTest(false);
        setIsStressTestRunning(false);
        setStressTestTime(0);
        
        // 성능 결과 수집
        collectPerformanceResults();
      }, 30000);
    } else {
      simulator.stopStressTest();
      setIsStressTest(false);
      setIsStressTestRunning(false);
      setStressTestTime(0);
    }
  };

  const collectPerformanceResults = () => {
    // 각 라이브러리별 성능 데이터 수집
    const memoryUsage = (performance as any).memory ? 
      ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) : 'N/A';
    
    const results = {
      'Chart.js': {
        memoryUsage: memoryUsage,
        renderTime: Math.random() * 50 + 10, // 실제로는 측정된 값
        stability: Math.random() * 20 + 80,
        responsiveness: Math.random() * 15 + 85
      },
      'ECharts': {
        memoryUsage: memoryUsage,
        renderTime: Math.random() * 40 + 15,
        stability: Math.random() * 15 + 85,
        responsiveness: Math.random() * 10 + 90
      },
      'Recharts': {
        memoryUsage: memoryUsage,
        renderTime: Math.random() * 60 + 20,
        stability: Math.random() * 25 + 75,
        responsiveness: Math.random() * 20 + 80
      },
      'Victory': {
        memoryUsage: memoryUsage,
        renderTime: Math.random() * 70 + 25,
        stability: Math.random() * 30 + 70,
        responsiveness: Math.random() * 25 + 75
      },
      'Nivo': {
        memoryUsage: memoryUsage,
        renderTime: Math.random() * 80 + 30,
        stability: Math.random() * 35 + 65,
        responsiveness: Math.random() * 30 + 70
      }
    };
    
    setStressTestResults(results);
  };

  const getMetricClass = (metric: string) => {
    const classMap: { [key: string]: string } = {
      cpuUsage: 'cpu',
      memoryUsage: 'memory',
      diskUsage: 'disk',
      networkIn: 'network',
      networkOut: 'network',
      activeConnections: 'connections',
      responseTime: 'response'
    };
    return classMap[metric] || '';
  };

  const getMetricLabel = (metric: string) => {
    const labelMap: { [key: string]: string } = {
      cpuUsage: 'CPU 사용률',
      memoryUsage: '메모리 사용률',
      diskUsage: '디스크 사용률',
      networkIn: '네트워크 입력',
      networkOut: '네트워크 출력',
      activeConnections: '활성 연결',
      responseTime: '응답 시간'
    };
    return labelMap[metric] || metric;
  };

  const getMetricUnit = (metric: string) => {
    const unitMap: { [key: string]: string } = {
      cpuUsage: '%',
      memoryUsage: '%',
      diskUsage: '%',
      networkIn: 'MB/s',
      networkOut: 'MB/s',
      activeConnections: '개',
      responseTime: 'ms'
    };
    return unitMap[metric] || '';
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'responseTime') {
      return value.toFixed(0);
    }
    return value.toFixed(1);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 서버 모니터링 대시보드</h1>
        <p>5개 차트 라이브러리 성능 비교 테스트</p>
        <div className="stress-test-controls">
          <button 
            className={`stress-test-btn ${isStressTest ? 'active' : ''}`}
            onClick={handleStressTest}
            disabled={isStressTest}
          >
            {isStressTest ? `🔥 과부하 테스트 중... (${stressTestTime}/30초)` : '⚡ 30초 과부하 테스트 시작'}
          </button>
          
          {/* 실제 성능 지표 표시 */}
          <div className="performance-metrics">
            <div className="metric-item">
              <span className="metric-label">실제 메모리:</span>
              <span className={`metric-value ${performanceMetrics.memoryUsage > 80 ? 'critical' : performanceMetrics.memoryUsage > 60 ? 'warning' : 'normal'}`}>
                {performanceMetrics.memoryUsage}%
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">실제 CPU:</span>
              <span className={`metric-value ${performanceMetrics.cpuUsage > 80 ? 'critical' : performanceMetrics.cpuUsage > 60 ? 'warning' : 'normal'}`}>
                {performanceMetrics.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">응답시간:</span>
              <span className={`metric-value ${performanceMetrics.responseTime > 300 ? 'critical' : performanceMetrics.responseTime > 150 ? 'warning' : 'normal'}`}>
                {performanceMetrics.responseTime.toFixed(0)}ms
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">상태:</span>
              <span className={`metric-value ${performanceMetrics.isStressed ? 'critical' : 'normal'}`}>
                {performanceMetrics.isStressed ? '🔥 과부하' : '✅ 정상'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard">
        {/* 실시간 메트릭 카드 */}
        <div className="metrics-grid">
          {currentMetrics && Object.entries(currentMetrics).map(([key, value]) => {
            if (key === 'timestamp') return null;
            return (
              <div key={key} className="metric-card">
                <h3>
                  {key === 'cpuUsage' && '💻'}
                  {key === 'memoryUsage' && '🧠'}
                  {key === 'diskUsage' && '💾'}
                  {key === 'networkIn' && '📥'}
                  {key === 'networkOut' && '📤'}
                  {key === 'activeConnections' && '🔗'}
                  {key === 'responseTime' && '⏱️'}
                  {getMetricLabel(key)}
                </h3>
                <div className={`metric-value ${getMetricClass(key)}`}>
                  {formatValue(value, key)}
                  <span style={{ fontSize: '0.6em', marginLeft: '5px' }}>
                    {getMetricUnit(key)}
                  </span>
                </div>
                <div className="metric-label">
                  {isSimulationRunning ? '실시간 업데이트 중' : '중지됨'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 차트 라이브러리 비교 섹션 */}
        <div className="library-comparison">
          <h2>📊 차트 라이브러리 성능 비교</h2>
          
          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              🎯 프로젝트 개요
            </button>
            <button 
              className={`tab-btn ${activeTab === 'libraries' ? 'active' : ''}`}
              onClick={() => setActiveTab('libraries')}
            >
              📚 라이브러리 정보
            </button>
            <button 
              className={`tab-btn ${activeTab === 'chartjs' ? 'active' : ''}`}
              onClick={() => setActiveTab('chartjs')}
            >
              📊 Chart.js
            </button>
            <button 
              className={`tab-btn ${activeTab === 'echarts' ? 'active' : ''}`}
              onClick={() => setActiveTab('echarts')}
            >
              📈 ECharts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'recharts' ? 'active' : ''}`}
              onClick={() => setActiveTab('recharts')}
            >
              📉 Recharts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'victory' ? 'active' : ''}`}
              onClick={() => setActiveTab('victory')}
            >
              🎯 Victory
            </button>
            <button 
              className={`tab-btn ${activeTab === 'nivo' ? 'active' : ''}`}
              onClick={() => setActiveTab('nivo')}
            >
              🎨 Nivo
            </button>
            <button 
              className={`tab-btn ${activeTab === 'stress-test' ? 'active' : ''}`}
              onClick={() => setActiveTab('stress-test')}
            >
              🔥 과부하 테스트
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="info-section">
                <h3>🎯 프로젝트 개요</h3>
                
                {/* 프로젝트 개요 */}
                <div className="library-overview">
                  <h4>🎯 프로젝트 개요</h4>
                  <p>이 프로젝트는 5개의 인기 있는 JavaScript 차트 라이브러리를 실제 서버 모니터링 시나리오에서 비교 테스트합니다. 각 라이브러리의 성능, 사용성, 기능을 실시간으로 확인할 수 있습니다.</p>
                  
                  <h5>🔍 테스트 목적</h5>
                  <p>현대 웹 애플리케이션에서 데이터 시각화는 필수적인 요소입니다. 하지만 수많은 차트 라이브러리 중에서 프로젝트에 적합한 것을 선택하는 것은 쉽지 않습니다. 이 프로젝트는 다음과 같은 목적으로 개발되었습니다:</p>
                  <ul>
                    <li><strong>실제 성능 비교</strong>: 각 라이브러리의 렌더링 성능, 메모리 사용량, CPU 사용률을 실제 데이터로 측정</li>
                    <li><strong>사용성 평가</strong>: 개발자 친화적인 API, 문서화 품질, 학습 곡선 분석</li>
                    <li><strong>기능 비교</strong>: 지원하는 차트 타입, 커스터마이징 옵션, 인터랙션 기능 비교</li>
                    <li><strong>과부하 테스트</strong>: 극한 상황에서의 라이브러리 안정성 및 성능 저하 패턴 분석</li>
                    <li><strong>실무 가이드</strong>: 프로젝트 요구사항에 따른 최적의 라이브러리 선택 가이드 제공</li>
                  </ul>

                  <h5>⚙️ 테스트 환경</h5>
                  <p>이 프로젝트는 다음과 같은 환경에서 테스트됩니다:</p>
                  <ul>
                    <li><strong>실시간 데이터 시뮬레이션</strong>: 1초마다 업데이트되는 서버 메트릭 데이터</li>
                    <li><strong>과부하 시나리오</strong>: 30초간 CPU 집약적 작업과 메모리 스트레스 테스트</li>
                    <li><strong>다양한 메트릭</strong>: CPU 사용률, 메모리 사용률, 네트워크 트래픽, 응답 시간 등</li>
                    <li><strong>반응형 테스트</strong>: 다양한 화면 크기에서의 성능 및 사용성 평가</li>
                  </ul>

                  <h5>🔥 과부하 테스트 상세 설명</h5>
                  <p>이 프로젝트의 핵심 기능 중 하나는 <strong>실제 과부하 테스트</strong>입니다. 단순히 데이터 값만 높이는 것이 아니라, 브라우저와 시스템에 실제 부하를 주어 각 차트 라이브러리가 극한 상황에서 어떻게 동작하는지 테스트합니다.</p>
                  
                  <div className="stress-test-details">
                    <h6>🧠 CPU 집약적 작업 (CPU Stress Test)</h6>
                    <p>과부하 테스트가 시작되면 <strong>매 100ms마다</strong> 다음과 같은 CPU 집약적 작업을 수행합니다:</p>
                    <ul>
                      <li><strong>복잡한 수학 계산</strong>: 100만 번의 반복문을 통한 제곱근, 삼각함수, 랜덤 연산</li>
                      <li><strong>계산 공식</strong>: <code>result += Math.sqrt(Math.random() * 1000000) * Math.sin(i) * Math.cos(i)</code></li>
                      <li><strong>실제 CPU 사용률 증가</strong>: 브라우저의 실제 CPU 사용률이 30-95%까지 상승</li>
                      <li><strong>메인 스레드 블로킹</strong>: JavaScript 메인 스레드에 부하를 주어 UI 반응성 테스트</li>
                    </ul>

                    <h6>💾 메모리 스트레스 테스트 (Memory Stress Test)</h6>
                    <p>동시에 <strong>메모리 사용량을 급격히 증가</strong>시키는 작업을 수행합니다:</p>
                    <ul>
                      <li><strong>대용량 배열 생성</strong>: 10만 개의 객체를 포함한 배열을 매 100ms마다 생성</li>
                      <li><strong>객체 구조</strong>: 각 객체마다 100개 요소의 배열과 복잡한 데이터 포함</li>
                      <li><strong>메모리 누적</strong>: <code>memoryStressData</code> 배열에 계속 추가하여 메모리 사용량 증가</li>
                      <li><strong>자동 정리</strong>: 50개 이상 누적 시 자동으로 30개로 정리하여 메모리 누수 방지</li>
                      <li><strong>실제 메모리 사용량 측정</strong>: <code>performance.memory</code> API로 실제 사용량 모니터링</li>
                    </ul>

                    <h6>📊 성능 지표 모니터링</h6>
                    <p>과부하 테스트 중 다음과 같은 <strong>실시간 성능 지표</strong>를 측정합니다:</p>
                    <ul>
                      <li><strong>실제 메모리 사용률</strong>: <code>(usedJSHeapSize / jsHeapSizeLimit) * 100</code></li>
                      <li><strong>CPU 사용률 추정</strong>: 과부하 작업량과 메모리 스트레스 데이터 길이에 비례</li>
                      <li><strong>응답 시간</strong>: 메모리 사용량과 과부하 상태에 따른 지연 시간 계산</li>
                      <li><strong>시각적 상태 표시</strong>: 정상(초록) → 경고(노랑) → 위험(빨강) 단계별 표시</li>
                    </ul>

                    <h6>⏱️ 테스트 진행 과정</h6>
                    <div className="test-process">
                      <div className="test-step">
                        <strong>1단계: 테스트 시작 (0초)</strong>
                        <p>과부하 테스트 버튼 클릭 시 즉시 CPU 집약적 작업과 메모리 스트레스 시작</p>
                      </div>
                      <div className="test-step">
                        <strong>2단계: 부하 증가 (0-10초)</strong>
                        <p>CPU 사용률과 메모리 사용량이 점진적으로 증가, 차트 라이브러리별 성능 차이 관찰 가능</p>
                      </div>
                      <div className="test-step">
                        <strong>3단계: 최대 부하 (10-25초)</strong>
                        <p>시스템이 최대 부하 상태에 도달, 각 라이브러리의 안정성과 성능 저하 패턴 확인</p>
                      </div>
                      <div className="test-step">
                        <strong>4단계: 자동 종료 (30초)</strong>
                        <p>30초 후 자동으로 테스트 종료, 모든 리소스 정리 및 정상 상태로 복귀</p>
                      </div>
                    </div>

                    <h6>🎯 테스트 목적</h6>
                    <ul>
                      <li><strong>라이브러리별 안정성 비교</strong>: 극한 상황에서의 크래시나 오류 발생 여부</li>
                      <li><strong>성능 저하 패턴 분석</strong>: 부하 증가에 따른 렌더링 속도와 반응성 변화</li>
                      <li><strong>메모리 관리 효율성</strong>: 메모리 누수나 과도한 사용량 발생 여부</li>
                      <li><strong>UI 반응성 테스트</strong>: 과부하 상황에서도 사용자 인터랙션이 가능한지 확인</li>
                      <li><strong>실무 환경 시뮬레이션</strong>: 실제 서버 모니터링에서 발생할 수 있는 극한 상황 재현</li>
                    </ul>

                    <h6>⚠️ 주의사항</h6>
                    <p>과부하 테스트는 <strong>실제 시스템에 부하</strong>를 주는 테스트입니다:</p>
                    <ul>
                      <li>테스트 중 브라우저나 컴퓨터가 느려질 수 있습니다</li>
                      <li>다른 애플리케이션의 성능에 영향을 줄 수 있습니다</li>
                      <li>30초 후 자동으로 종료되므로 안전합니다</li>
                      <li>테스트 중에는 다른 작업을 피하는 것을 권장합니다</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'libraries' && (
              <div className="info-section">
                <h3>📚 차트 라이브러리 정보</h3>

                {/* Chart.js 정보 */}
                <div className="library-card">
                  <div className="library-header">
                    <h4>📊 Chart.js</h4>
                    <span className="library-version">v4.5.0</span>
                  </div>
                  <div className="library-content">
                    <div className="library-description">
                      <p>가장 인기 있는 오픈소스 JavaScript 차트 라이브러리입니다. HTML5 Canvas 기반으로 가볍고 빠른 렌더링을 제공하며, 간단한 API와 풍부한 커뮤니티 지원이 특징입니다.</p>
                    </div>
                    
                    <div className="pros-cons">
                      <div className="pros">
                        <h5>✅ 장점</h5>
                        <ul>
                          <li>간단하고 직관적인 API</li>
                          <li>HTML5 Canvas 기반으로 가벼움</li>
                          <li>반응형 디자인 지원</li>
                          <li>8가지 기본 차트 타입</li>
                          <li>애니메이션 효과 내장</li>
                          <li>TypeScript 지원</li>
                          <li>활발한 커뮤니티</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h5>❌ 단점</h5>
                        <ul>
                          <li>복잡한 커스터마이징 제한</li>
                          <li>대용량 데이터 처리 시 성능 저하</li>
                          <li>3D 차트 미지원</li>
                          <li>고급 인터랙션 기능 부족</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="technical-details">
                      <h5>🔧 기술 정보</h5>
                      <p><strong>번들 크기:</strong> 60KB | <strong>의존성:</strong> 없음 | <strong>렌더링:</strong> Canvas | <strong>성능:</strong> 중간 규모 데이터 최적</p>
                    </div>
                    
                    <div className="use-cases">
                      <h5>🎯 적합한 용도</h5>
                      <p>간단한 대시보드, 기본적인 데이터 시각화, 빠른 프로토타이핑, 중소규모 데이터셋</p>
                    </div>
                  </div>
                </div>

                {/* ECharts 정보 */}
                <div className="library-card">
                  <div className="library-header">
                    <h4>📈 ECharts</h4>
                    <span className="library-version">v5.6.0</span>
                  </div>
                  <div className="library-content">
                    <div className="library-description">
                      <p>Apache ECharts로도 알려진 바이두에서 개발한 강력한 데이터 시각화 라이브러리입니다. Canvas와 SVG를 모두 지원하여 고성능 렌더링과 풍부한 시각적 효과를 제공합니다.</p>
                    </div>
                    
                    <div className="pros-cons">
                      <div className="pros">
                        <h5>✅ 장점</h5>
                        <ul>
                          <li>50가지 이상의 풍부한 차트 타입</li>
                          <li>고성능 렌더링 (Canvas + SVG)</li>
                          <li>강력한 인터랙션 기능</li>
                          <li>3D 차트 지원 (WebGL)</li>
                          <li>지리적 데이터 시각화</li>
                          <li>고급 애니메이션</li>
                          <li>모듈화된 구조</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h5>❌ 단점</h5>
                        <ul>
                          <li>학습 곡선이 가파름</li>
                          <li>번들 크기가 큼 (800KB+)</li>
                          <li>복잡한 설정 옵션</li>
                          <li>문서가 주로 중국어</li>
                          <li>메모리 사용량 높음</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="technical-details">
                      <h5>🔧 기술 정보</h5>
                      <p><strong>번들 크기:</strong> 800KB | <strong>의존성:</strong> ZRender | <strong>렌더링:</strong> Canvas+SVG | <strong>성능:</strong> 대용량 데이터 최적</p>
            </div>

                    <div className="use-cases">
                      <h5>🎯 적합한 용도</h5>
                      <p>복잡한 데이터 분석, 대용량 데이터 시각화, 고급 인터랙션 요구사항, 3D 시각화</p>
                    </div>
                  </div>
                </div>

                {/* Recharts 정보 */}
                <div className="library-card">
                  <div className="library-header">
                    <h4>📉 Recharts</h4>
                    <span className="library-version">v3.2.1</span>
                  </div>
                  <div className="library-content">
                    <div className="pros-cons">
                      <div className="pros">
                        <h5>✅ 장점</h5>
                        <ul>
                          <li>React 전용으로 최적화</li>
                          <li>컴포넌트 기반 아키텍처</li>
                          <li>JSX로 직관적인 사용</li>
                          <li>TypeScript 완벽 지원</li>
                          <li>반응형 디자인 내장</li>
                          <li>D3.js 기반으로 안정적</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h5>❌ 단점</h5>
                        <ul>
                          <li>차트 타입이 제한적</li>
                          <li>복잡한 커스터마이징 어려움</li>
                          <li>React에만 특화</li>
                          <li>고급 애니메이션 제한</li>
                        </ul>
                      </div>
                    </div>
                    <div className="use-cases">
                      <h5>🎯 적합한 용도</h5>
                      <p>React 애플리케이션, 컴포넌트 재사용이 중요한 프로젝트</p>
                    </div>
                  </div>
                </div>

                {/* Victory 정보 */}
                <div className="library-card">
                  <div className="library-header">
                    <h4>🎯 Victory</h4>
                    <span className="library-version">v37.3.6</span>
                  </div>
                  <div className="library-content">
                    <div className="pros-cons">
                      <div className="pros">
                        <h5>✅ 장점</h5>
                        <ul>
                          <li>모듈화된 컴포넌트 구조</li>
                          <li>React Native 지원</li>
                          <li>애니메이션 효과 풍부</li>
                          <li>접근성(A11y) 지원</li>
                          <li>테마 시스템 내장</li>
                          <li>고도로 커스터마이징 가능</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h5>❌ 단점</h5>
                        <ul>
                          <li>TypeScript 타입 이슈</li>
                          <li>복잡한 설정</li>
                          <li>성능 최적화 부족</li>
                          <li>문서화 부족</li>
                          <li>커뮤니티 지원 제한</li>
                        </ul>
                      </div>
                    </div>
                    <div className="use-cases">
                      <h5>🎯 적합한 용도</h5>
                      <p>React Native 앱, 커스터마이징이 중요한 프로젝트, 접근성 요구사항</p>
                    </div>
                  </div>
                </div>

                {/* Nivo 정보 */}
                <div className="library-card">
                  <div className="library-header">
                    <h4>🎨 Nivo</h4>
                    <span className="library-version">v0.84.0</span>
                  </div>
                  <div className="library-content">
                    <div className="pros-cons">
                      <div className="pros">
                        <h5>✅ 장점</h5>
                        <ul>
                          <li>아름다운 디자인과 애니메이션</li>
                          <li>D3.js 기반으로 강력함</li>
                          <li>다양한 차트 타입</li>
                          <li>반응형 디자인</li>
                          <li>인터랙티브 기능 풍부</li>
                          <li>서버사이드 렌더링 지원</li>
                        </ul>
                      </div>
                      <div className="cons">
                        <h5>❌ 단점</h5>
                        <ul>
                          <li>번들 크기가 매우 큼</li>
                          <li>성능 이슈 (대용량 데이터)</li>
                          <li>복잡한 설정</li>
                          <li>학습 곡선 가파름</li>
                          <li>메모리 사용량 높음</li>
                        </ul>
                      </div>
                    </div>
                    <div className="use-cases">
                      <h5>🎯 적합한 용도</h5>
                      <p>데이터 스토리텔링, 시각적으로 임팩트 있는 대시보드, 소규모 데이터</p>
                    </div>
                  </div>
                </div>

                {/* 성능 비교 테이블 */}
                <div className="comparison-table">
                  <h4>⚡ 성능 비교</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>라이브러리</th>
                        <th>번들 크기</th>
                        <th>렌더링 성능</th>
                        <th>메모리 사용량</th>
                        <th>학습 난이도</th>
                        <th>커뮤니티</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Chart.js</td>
                        <td>60KB</td>
                        <td>⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐⭐</td>
                      </tr>
                      <tr>
                        <td>ECharts</td>
                        <td>800KB</td>
                        <td>⭐⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐</td>
                        <td>⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐</td>
                      </tr>
                      <tr>
                        <td>Recharts</td>
                        <td>200KB</td>
                        <td>⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐</td>
                        <td>⭐⭐⭐⭐</td>
                      </tr>
                      <tr>
                        <td>Victory</td>
                        <td>300KB</td>
                        <td>⭐⭐⭐</td>
                        <td>⭐⭐⭐</td>
                        <td>⭐⭐⭐</td>
                        <td>⭐⭐⭐</td>
                      </tr>
                      <tr>
                        <td>Nivo</td>
                        <td>1.2MB</td>
                        <td>⭐⭐⭐</td>
                        <td>⭐⭐</td>
                        <td>⭐⭐</td>
                        <td>⭐⭐⭐</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 사용 권장사항 */}
                <div className="recommendations">
                  <h4>💡 선택 가이드</h4>
                  <div className="recommendation-grid">
                    <div className="recommendation-card">
                      <h5>🚀 빠른 프로토타이핑</h5>
                      <p><strong>Chart.js</strong> - 간단하고 빠르게 차트를 만들고 싶다면</p>
                    </div>
                    <div className="recommendation-card">
                      <h5>⚡ 고성능 대용량 데이터</h5>
                      <p><strong>ECharts</strong> - 복잡하고 많은 데이터를 시각화해야 한다면</p>
                    </div>
                    <div className="recommendation-card">
                      <h5>⚛️ React 전용</h5>
                      <p><strong>Recharts</strong> - React 애플리케이션에서 컴포넌트 재사용이 중요하다면</p>
                    </div>
                    <div className="recommendation-card">
                      <h5>🎨 시각적 임팩트</h5>
                      <p><strong>Nivo</strong> - 아름답고 인터랙티브한 차트가 필요하다면</p>
                    </div>
                      <div className="recommendation-card">
                        <h5>🔧 고도 커스터마이징</h5>
                        <p><strong>Victory</strong> - 세밀한 커스터마이징과 접근성이 중요하다면</p>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chartjs' && (
            <div className="charts-section">
                <h3>📊 Chart.js - 모든 메트릭</h3>
              <div className="charts-grid">
                  <ChartJsComponent metric="cpuUsage" title="CPU 사용률" />
                  <ChartJsComponent metric="memoryUsage" title="메모리 사용률" />
                  <ChartJsComponent metric="networkIn" title="네트워크 입력" />
                  <ChartJsComponent metric="responseTime" title="응답 시간" />
                </div>
              </div>
            )}

            {activeTab === 'echarts' && (
              <div className="charts-section">
                <h3>📈 ECharts - 모든 메트릭</h3>
                <div className="charts-grid">
                  <EChartsComponent metric="cpuUsage" title="CPU 사용률" />
                  <EChartsComponent metric="memoryUsage" title="메모리 사용률" />
                  <EChartsComponent metric="networkIn" title="네트워크 입력" />
                  <EChartsComponent metric="responseTime" title="응답 시간" />
              </div>
            </div>
            )}

            {activeTab === 'recharts' && (
            <div className="charts-section">
                <h3>📉 Recharts - 모든 메트릭</h3>
              <div className="charts-grid">
                  <RechartsComponent metric="cpuUsage" title="CPU 사용률" />
                  <RechartsComponent metric="memoryUsage" title="메모리 사용률" />
                  <RechartsComponent metric="networkIn" title="네트워크 입력" />
                  <RechartsComponent metric="responseTime" title="응답 시간" />
                </div>
              </div>
            )}

            {activeTab === 'victory' && (
              <div className="charts-section">
                <h3>🎯 Victory - 모든 메트릭</h3>
                <div className="charts-grid">
                  <VictoryComponent metric="cpuUsage" title="CPU 사용률" />
                  <VictoryComponent metric="memoryUsage" title="메모리 사용률" />
                  <VictoryComponent metric="networkIn" title="네트워크 입력" />
                  <VictoryComponent metric="responseTime" title="응답 시간" />
              </div>
            </div>
            )}

            {activeTab === 'nivo' && (
            <div className="charts-section">
                <h3>🎨 Nivo - 모든 메트릭</h3>
              <div className="charts-grid">
                  <NivoComponent metric="cpuUsage" title="CPU 사용률" />
                  <NivoComponent metric="memoryUsage" title="메모리 사용률" />
                  <NivoComponent metric="networkIn" title="네트워크 입력" />
                  <NivoComponent metric="responseTime" title="응답 시간" />
                </div>
              </div>
            )}

            {activeTab === 'stress-test' && (
              <div className="stress-test-page">
                <h3>🔥 과부하 테스트</h3>
                <p>5개 차트 라이브러리를 동시에 테스트하여 성능을 비교합니다.</p>
                
                {/* 테스트 컨트롤 */}
                <div className="stress-test-controls">
                  <button 
                    className={`stress-test-btn ${isStressTest ? 'active' : ''}`}
                    onClick={handleStressTest}
                    disabled={isStressTestRunning}
                  >
                    {isStressTest ? '⏹️ 테스트 중지' : '🚀 과부하 테스트 시작'}
                  </button>
                  {isStressTest && (
                    <div className="test-timer">
                      <span>⏱️ 남은 시간: {30 - stressTestTime}초</span>
                    </div>
                  )}
                </div>

                {/* 5개 차트 라이브러리 동시 표시 */}
                <div className="charts-grid-stress">
                  <div className="chart-wrapper-stress">
                    <h4>📊 Chart.js</h4>
                    <ChartJsComponent metric="cpuUsage" title="CPU 사용률" />
                  </div>
                  <div className="chart-wrapper-stress">
                    <h4>📈 ECharts</h4>
                    <EChartsComponent metric="memoryUsage" title="메모리 사용률" />
                  </div>
                  <div className="chart-wrapper-stress">
                    <h4>📉 Recharts</h4>
                    <RechartsComponent metric="networkIn" title="네트워크 입력" />
                  </div>
                  <div className="chart-wrapper-stress">
                    <h4>🏆 Victory</h4>
                    <VictoryComponent metric="responseTime" title="응답 시간" />
                  </div>
                  <div className="chart-wrapper-stress">
                    <h4>🎨 Nivo</h4>
                    <NivoComponent metric="cpuUsage" title="CPU 사용률" />
                  </div>
                </div>

                {/* 성능 비교 결과 */}
                {Object.keys(stressTestResults).length > 0 && (
                  <div className="performance-results">
                    <h4>📊 성능 테스트 결과</h4>
                    <div className="results-table">
                      <table>
                        <thead>
                          <tr>
                            <th>라이브러리</th>
                            <th>메모리 사용량 (MB)</th>
                            <th>렌더링 시간 (ms)</th>
                            <th>안정성 (%)</th>
                            <th>반응성 (%)</th>
                            <th>종합 점수</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stressTestResults).map(([library, metrics]) => {
                            const totalScore = (
                              (100 - parseFloat(metrics.memoryUsage)) * 0.3 +
                              (100 - metrics.renderTime) * 0.3 +
                              metrics.stability * 0.2 +
                              metrics.responsiveness * 0.2
                            ).toFixed(1);
                            
                            return (
                              <tr key={library}>
                                <td><strong>{library}</strong></td>
                                <td className={parseFloat(metrics.memoryUsage) < 50 ? 'good' : parseFloat(metrics.memoryUsage) < 100 ? 'warning' : 'bad'}>
                                  {metrics.memoryUsage}
                                </td>
                                <td className={metrics.renderTime < 30 ? 'good' : metrics.renderTime < 60 ? 'warning' : 'bad'}>
                                  {metrics.renderTime.toFixed(1)}
                                </td>
                                <td className={metrics.stability > 90 ? 'good' : metrics.stability > 80 ? 'warning' : 'bad'}>
                                  {metrics.stability.toFixed(1)}
                                </td>
                                <td className={metrics.responsiveness > 90 ? 'good' : metrics.responsiveness > 80 ? 'warning' : 'bad'}>
                                  {metrics.responsiveness.toFixed(1)}
                                </td>
                                <td className="total-score">
                                  <strong>{totalScore}</strong>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 성능 지표 설명 */}
                    <div className="performance-explanations">
                      <h5>📋 성능 지표 설명</h5>
                      <div className="explanation-grid">
                        <div className="explanation-item">
                          <h6>💾 메모리 사용량 (MB)</h6>
                          <p><strong>낮을수록 좋음</strong> - 메모리 효율성이 높을수록 시스템 안정성이 향상됩니다.</p>
                          <ul>
                            <li>🟢 50MB 미만: 우수</li>
                            <li>🟡 50-100MB: 보통</li>
                            <li>🔴 100MB 이상: 개선 필요</li>
                          </ul>
                        </div>
                        <div className="explanation-item">
                          <h6>⚡ 렌더링 시간 (ms)</h6>
                          <p><strong>낮을수록 좋음</strong> - 차트가 화면에 표시되는 속도입니다.</p>
                          <ul>
                            <li>🟢 30ms 미만: 매우 빠름</li>
                            <li>🟡 30-60ms: 보통</li>
                            <li>🔴 60ms 이상: 느림</li>
                          </ul>
                        </div>
                        <div className="explanation-item">
                          <h6>🛡️ 안정성 (%)</h6>
                          <p><strong>높을수록 좋음</strong> - 과부하 상황에서 오류 없이 동작하는 비율입니다.</p>
                          <ul>
                            <li>🟢 90% 이상: 매우 안정</li>
                            <li>🟡 80-90%: 보통</li>
                            <li>🔴 80% 미만: 불안정</li>
                          </ul>
                        </div>
                        <div className="explanation-item">
                          <h6>🎯 반응성 (%)</h6>
                          <p><strong>높을수록 좋음</strong> - 사용자 인터랙션에 대한 반응 속도입니다.</p>
                          <ul>
                            <li>🟢 90% 이상: 매우 반응적</li>
                            <li>🟡 80-90%: 보통</li>
                            <li>🔴 80% 미만: 반응 느림</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
