import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import axios from 'axios';

// 注册所有需要的 Chart.js 组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

// 图表弹窗组件
const ChartModal = ({ title, chartData, chartType, onClose }) => {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
        font: { size: 18 },
      },
    },
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
          {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
        </div>
      </div>
    </div>
  );
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalChart, setModalChart] = useState({ show: false, title: '', chartData: {}, chartType: '' });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/statistics');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (type) => {
    let title = '';
    let chartData = {};
    let chartType = 'pie';

    try {
      if (type === 'tasks') {
        title = '任务完成状态分布';
        const taskDetails = stats.tasks;
        chartData = {
          labels: ['已完成', '未完成'],
          datasets: [{
            data: [taskDetails.completed, taskDetails.total - taskDetails.completed],
            backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)'],
            borderColor: ['#fff'],
            borderWidth: 2,
          }],
        };
      } else if (type === 'goals') {
        title = '目标完成状态分布';
        const { data } = await axios.get('http://localhost:3001/api/goals/status-distribution');
        chartData = {
          labels: ['已完成', '进行中'],
          datasets: [{
            data: [data.completed, data.active],
            backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 206, 86, 0.7)'],
            borderColor: ['#fff'],
            borderWidth: 2,
          }],
        };
      } else if (type === 'inspirations') {
        title = '每日灵感记录趋势';
        chartType = 'line';
        const { data } = await axios.get('http://localhost:3001/api/inspirations/daily');
        chartData = {
          labels: data.map(d => new Date(d.date).toLocaleDateString('zh-CN')),
          datasets: [{
            label: '新增灵感数',
            data: data.map(d => d.count),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.3,
          }],
        };
      } else if (type === 'knowledge') {
        title = '每日知识学习趋势';
        chartType = 'line';
        const { data } = await axios.get('http://localhost:3001/api/knowledge/daily');
        chartData = {
          labels: data.map(d => new Date(d.date).toLocaleDateString('zh-CN')),
          datasets: [{
            label: '新增知识数',
            data: data.map(d => d.count),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            fill: true,
            tension: 0.3,
          }],
        };
      }

      setModalChart({ show: true, title, chartData, chartType });

    } catch (error) {
      console.error(`Error fetching data for ${type}:`, error);
    }
  };

  if (loading) {
    return <div className="loading">加载统计数据中...</div>;
  }

  if (!stats) {
    return <div className="error">无法加载统计数据</div>;
  }

  const overviewBarData = {
    labels: ['灵感', '知识', '任务', '目标'],
    datasets: [{
      label: '各项总数',
      data: [stats.inspirations, stats.knowledge, stats.tasks.total, stats.goals.total],
      backgroundColor: [
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
      ],
      borderRadius: 5,
    }],
  };

  return (
    <div className="tab-content">
      <h2 className="stats-title">
        <span role="img" aria-label="chart">📈</span> 成长统计
      </h2>
      
      <div className="stats-cards-grid">
        <div className="stat-card-new blue" onClick={() => handleCardClick('tasks')}>
          <p className="stat-card-title">任务完成率</p>
          <p className="stat-card-value">{stats.tasks.percentage}%</p>
          <p className="stat-card-subtitle">{stats.tasks.completed} / {stats.tasks.total} 个任务</p>
        </div>
        <div className="stat-card-new green" onClick={() => handleCardClick('goals')}>
          <p className="stat-card-title">目标达成率</p>
          <p className="stat-card-value">{stats.goals.averageProgress}%</p>
          <p className="stat-card-subtitle">{stats.goals.total} 个目标</p>
        </div>
        <div className="stat-card-new yellow" onClick={() => handleCardClick('inspirations')}>
          <p className="stat-card-title">记录灵感</p>
          <p className="stat-card-value">{stats.inspirations}</p>
          <p className="stat-card-subtitle">个灵感</p>
        </div>
        <div className="stat-card-new purple" onClick={() => handleCardClick('knowledge')}>
          <p className="stat-card-title">学习记录</p>
          <p className="stat-card-value">{stats.knowledge}</p>
          <p className="stat-card-subtitle">条知识</p>
        </div>
      </div>

      <div className="stats-charts-grid">
        <div className="chart-card">
          <h3>模块数据分布</h3>
          <Bar 
            options={{ responsive: true, plugins: { legend: { display: false } } }} 
            data={overviewBarData} 
          />
        </div>
      </div>

      {modalChart.show && (
        <ChartModal 
          {...modalChart}
          onClose={() => setModalChart({ show: false, title: '', chartData: {}, chartType: '' })}
        />
      )}
    </div>
  );
};

export default Statistics;
