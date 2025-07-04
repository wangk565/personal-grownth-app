import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/statistics');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">加载统计数据中...</div>;
  }

  if (!stats) {
    return <div className="error">无法加载统计数据</div>;
  }

  const taskData = {
    labels: ['已完成', '未完成'],
    datasets: [
      {
        data: [stats.tasks.completed, stats.tasks.total - stats.tasks.completed],
        backgroundColor: ['#28a745', '#dc3545'],
        borderWidth: 2,
      },
    ],
  };

  const overviewData = {
    labels: ['灵感记录', '知识学习', '任务总数', '目标总数'],
    datasets: [
      {
        label: '数量',
        data: [stats.inspirations, stats.knowledge, stats.tasks.total, stats.goals.total],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="tab-content">
      <h2>成长统计</h2>
      <div className="statistics-grid">
        <div className="stat-card">
          <h3>总体概览</h3>
          <div className="stat-numbers">
            <div className="stat-item">
              <span className="stat-label">灵感记录</span>
              <span className="stat-value">{stats.inspirations}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">知识学习</span>
              <span className="stat-value">{stats.knowledge}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">任务完成率</span>
              <span className="stat-value">{stats.tasks.percentage}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">目标平均进度</span>
              <span className="stat-value">{stats.goals.averageProgress}%</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>数据概览</h3>
          <div className="chart-container">
            <Bar data={overviewData} options={chartOptions} />
          </div>
        </div>

        <div className="stat-card">
          <h3>任务完成情况</h3>
          <div className="chart-container">
            <Pie data={taskData} options={chartOptions} />
          </div>
          <div className="task-summary">
            <p>总任务数: {stats.tasks.total}</p>
            <p>已完成: {stats.tasks.completed}</p>
            <p>完成率: {stats.tasks.percentage}%</p>
          </div>
        </div>

        <div className="stat-card">
          <h3>成长轨迹</h3>
          <div className="growth-summary">
            <div className="growth-item">
              <span className="growth-icon">💡</span>
              <div>
                <h4>灵感火花</h4>
                <p>已记录 {stats.inspirations} 个创意想法</p>
              </div>
            </div>
            <div className="growth-item">
              <span className="growth-icon">📚</span>
              <div>
                <h4>知识积累</h4>
                <p>已学习 {stats.knowledge} 个知识点</p>
              </div>
            </div>
            <div className="growth-item">
              <span className="growth-icon">✅</span>
              <div>
                <h4>任务执行</h4>
                <p>完成了 {stats.tasks.completed} 个任务</p>
              </div>
            </div>
            <div className="growth-item">
              <span className="growth-icon">🎯</span>
              <div>
                <h4>目标达成</h4>
                <p>平均进度 {stats.goals.averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;