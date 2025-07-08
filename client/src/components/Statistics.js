import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { statistics } from '../services/api'; // 修正导入方式
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'; // 引入Chart.js核心

// Import Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';

// 注册图表所需组件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Styled Card for a modern, clean look
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const IconAvatar = styled(Avatar)(({ theme, color }) => ({
    backgroundColor: color,
    color: theme.palette.getContrastText(color),
    width: 56,
    height: 56,
    marginBottom: theme.spacing(2),
  }));

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const response = await statistics.get(); // 修正函数调用
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
        无法加载统计数据，请稍后重试。
      </Typography>
    );
  }

  const overviewBarData = {
    labels: ['灵感', '知识', '任务', '目标'],
    datasets: [{
      label: '各项总数',
      data: [stats.inspirations, stats.knowledge, stats.tasks.total, stats.goals.total],
      backgroundColor: [
        '#FFC107', // Amber
        '#9C27B0', // Purple
        '#2196F3', // Blue
        '#4CAF50', // Green
      ],
      borderColor: [
        '#FFB300',
        '#8E24AA',
        '#1E88E5',
        '#43A047',
      ],
      borderWidth: 1,
      borderRadius: 5,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '各项数据总览',
        font: { size: 18, family: 'Roboto' },
        padding: { top: 10, bottom: 20 },
      },
    },
    scales: {
        y: {
            beginAtZero: true,
        }
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
        成长统计
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <IconAvatar color="#4CAF50"><CheckCircleOutlineIcon fontSize="large" /></IconAvatar>
              <Typography variant="h5" component="div">{stats.tasks.percentage}%</Typography>
              <Typography color="text.secondary">任务完成率</Typography>
              <Typography variant="body2" color="text.secondary">{`${stats.tasks.completed} / ${stats.tasks.total} 个`}</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <IconAvatar color="#2196F3"><EmojiEventsIcon fontSize="large" /></IconAvatar>
              <Typography variant="h5" component="div">{stats.goals.averageProgress}%</Typography>
              <Typography color="text.secondary">目标平均进度</Typography>
              <Typography variant="body2" color="text.secondary">{`${stats.goals.total} 个目标`}</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <IconAvatar color="#FFC107"><LightbulbIcon fontSize="large" /></IconAvatar>
              <Typography variant="h5" component="div">{stats.inspirations}</Typography>
              <Typography color="text.secondary">灵感总数</Typography>
              <Typography variant="body2" color="text.secondary">个闪光时刻</Typography>
            </CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <IconAvatar color="#9C27B0"><SchoolIcon fontSize="large" /></IconAvatar>
              <Typography variant="h5" component="div">{stats.knowledge}</Typography>
              <Typography color="text.secondary">知识笔记</Typography>
              <Typography variant="body2" color="text.secondary">条学习记录</Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Main Chart */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent sx={{ height: '400px' }}>
              <Bar options={chartOptions} data={overviewBarData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;
