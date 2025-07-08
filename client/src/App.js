
import React, { useState, useEffect, useCallback, useContext } from 'react';
import Statistics from './components/Statistics';
import SearchBar from './components/SearchBar';
import EditModal from './components/EditModal';
import LoginPage from './components/LoginPage';
import AIHelper from './components/AIHelper';
import { AuthContext } from './context/AuthContext';
import * as api from './services/api';
import {
  AppBar, Box, Button, Card, CardContent, CardActions, CircularProgress, Container, Grid, Tabs, Tab, Toolbar, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Slider, IconButton, Chip, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import './App.css';

function App() {
  const { isAuthenticated, user, logout, loading } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState(0);
  const [inspirations, setInspirations] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tasksForGoal, setTasksForGoal] = useState({ show: false, tasks: [] });
  const [error, setError] = useState(null);

  const [editModal, setEditModal] = useState({ show: false, type: '', data: null });

  const [inspirationForm, setInspirationForm] = useState({ content: '', tags: '' });
  const [knowledgeForm, setKnowledgeForm] = useState({ title: '', content: '', category: '', source: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '', parent_task_id: '', goal_id: '' });
  const [goalForm, setGoalForm] = useState({ title: '', description: '', type: 'weekly', target_date: '' });
  const [newCategory, setNewCategory] = useState('');

  const apiMap = {
    inspirations: api.inspirations,
    knowledge: api.knowledge,
    tasks: api.tasks,
    goals: api.goals,
  };

  const tabMap = ['ai_helper', 'inspirations', 'knowledge', 'tasks', 'goals', 'statistics'];

  const fetchInspirations = useCallback(async () => {
    try {
      const response = await api.inspirations.getAll();
      setInspirations(response.data);
    } catch (error) {
      console.error('Error fetching inspirations:', error);
    }
  }, []);

  const fetchKnowledge = useCallback(async () => {
    try {
      const response = await api.knowledge.getAll();
      setKnowledge(response.data);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.tasks.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await api.goals.getAll();
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.categories.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchAllData = useCallback(() => {
    fetchInspirations();
    fetchKnowledge();
    fetchTasks();
    fetchGoals();
    fetchCategories();
  }, [fetchInspirations, fetchKnowledge, fetchTasks, fetchGoals, fetchCategories]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.search.run(searchTerm);
      setSearchResults(response.data);
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleInspirationSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.inspirations.create(inspirationForm);
      setInspirationForm({ content: '', tags: '' });
      fetchInspirations();
    } catch (error) {
      console.error('Error adding inspiration:', error);
    }
  };

  const handleKnowledgeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.knowledge.create(knowledgeForm);
      setKnowledgeForm({ title: '', content: '', category: '', source: '' });
      fetchKnowledge();
    } catch (error) {
      console.error('Error adding knowledge:', error);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const taskData = {
      ...taskForm,
      parent_task_id: taskForm.parent_task_id || null,
      goal_id: taskForm.goal_id || null,
    };
    try {
      await api.tasks.create(taskData);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', parent_task_id: '', goal_id: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error.response?.data?.error || '添加任务失败');
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.goals.create(goalForm);
      setGoalForm({ title: '', description: '', type: 'weekly', target_date: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await api.categories.create({ name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEdit = (type, data) => {
    setEditModal({ show: true, type, data });
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('确定要删除这条记录吗？') && apiMap[type]) {
        try {
            await apiMap[type].delete(id);
            fetchAllData();
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    }
  };

  const handleSaveEdit = async (type, id, data) => {
    if (!apiMap[type]) return;

    const dataToSave = { ...data };
    if (type === 'tasks') {
      dataToSave.parent_task_id = data.parent_task_id || null;
      dataToSave.goal_id = data.goal_id || null;
    }

    try {
      await apiMap[type].update(id, dataToSave);
      setEditModal({ show: false, type: '', data: null });
      fetchAllData();
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      setError(error.response?.data?.error || `更新${type}失败`);
    }
  };

  const showGoalTasks = async (goalId) => {
    try {
      const response = await api.goals.getTasks(goalId);
      setTasksForGoal({ show: true, tasks: response.data });
    } catch (error) {
      console.error('Error fetching tasks for goal:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await api.tasks.update(taskId, { ...task, status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      await api.goals.update(goalId, { ...goal, progress });
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const renderTaskTree = (task, level) => {
    const children = tasks.filter(child => child.parent_task_id === task.id);
    const goal = goals.find(g => g.id === task.goal_id);

    return (
      <React.Fragment key={task.id}>
        <Grid item xs={12} style={{ paddingLeft: `${level * 32}px` }}>
            <Card elevation={2} sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>{task.title}</Typography>
                    {goal && <Chip label={`目标: ${goal.title}`} size="small" sx={{ mt: 1 }} />}
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{task.description}</Typography>
                    <Chip label={`优先级: ${task.priority}`} size="small" sx={{ mt: 1 }} />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>截止日期: {formatDate(task.due_date)}</Typography>
                </CardContent>
                <CardActions>
                    <FormControl fullWidth size="small">
                        <InputLabel>状态</InputLabel>
                        <Select value={task.status} label="状态" onChange={(e) => updateTaskStatus(task.id, e.target.value)}>
                            <MenuItem value="pending">待完成</MenuItem>
                            <MenuItem value="in_progress">进行中</MenuItem>
                            <MenuItem value="completed">已完成</MenuItem>
                        </Select>
                    </FormControl>
                    <IconButton size="small" onClick={() => handleEdit('tasks', task)}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete('tasks', task.id)}><DeleteIcon /></IconButton>
                </CardActions>
            </Card>
        </Grid>
        {children.map(child => renderTaskTree(child, level + 1))}
      </React.Fragment>
    );
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderContent = () => {
    if (tasksForGoal.show) {
        return (
            <>
                <Button onClick={() => setTasksForGoal({ show: false, tasks: [] })}>返回目标列表</Button>
                <Grid container spacing={3} justifyContent="center">
                    {tasksForGoal.tasks.map(item => renderTaskTree(item, 0))}
                </Grid>
            </>
        )
    }

    if (isSearching) {
        return (
            <Grid container spacing={3}>
                {searchResults.length > 0 ? searchResults.map(item => (
                    <Grid item xs={12} sm={6} md={4} key={`${item.type}-${item.id}`}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{item.title || item.content.substring(0, 50)}</Typography>
                                <Chip label={item.type} size="small" sx={{ my: 1, bgcolor: '#eee' }} />
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )) : <Typography sx={{p:3}}>没有找到匹配的内容。</Typography>}
            </Grid>
        )
    }

    const centeredFormContainer = (form) => (
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            {form}
        </Box>
    );

    switch (tabMap[activeTab]) {
        case 'ai_helper':
            return <AIHelper />;
        case 'inspirations':
            return (
                <>
                    {centeredFormContainer(
                        <Card component="form" onSubmit={handleInspirationSubmit} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>记录新灵感</Typography>
                            <TextField label="灵感内容" fullWidth multiline rows={3} value={inspirationForm.content} onChange={(e) => setInspirationForm({...inspirationForm, content: e.target.value})} required sx={{ mb: 2 }} />
                            <TextField label="标签 (逗号分隔)" fullWidth value={inspirationForm.tags} onChange={(e) => setInspirationForm({...inspirationForm, tags: e.target.value})} sx={{ mb: 2 }} />
                            <Button type="submit" variant="contained">添加灵感</Button>
                        </Card>
                    )}
                    <Grid container spacing={3} justifyContent="center">
                        {inspirations.map(item => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Typography>
                                        <Box sx={{ mt: 2 }}>
                                            {item.tags && item.tags.split(',').map(tag => tag.trim() && <Chip key={tag} label={tag.trim()} size="small" sx={{ mr: 1 }} />)}
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton size="small" onClick={() => handleEdit('inspirations', item)}><EditIcon /></IconButton>
                                        <IconButton size="small" onClick={() => handleDelete('inspirations', item.id)}><DeleteIcon /></IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            );
        case 'knowledge':
            return (
                <>
                    {centeredFormContainer(
                        <Card component="form" onSubmit={handleKnowledgeSubmit} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>记录新知识</Typography>
                            <TextField label="标题" fullWidth value={knowledgeForm.title} onChange={(e) => setKnowledgeForm({...knowledgeForm, title: e.target.value})} required sx={{ mb: 2 }} />
                            <TextField label="内容" fullWidth multiline rows={4} value={knowledgeForm.content} onChange={(e) => setKnowledgeForm({...knowledgeForm, content: e.target.value})} required sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                <FormControl fullWidth>
                                    <InputLabel>分类</InputLabel>
                                    <Select value={knowledgeForm.category} label="分类" onChange={(e) => setKnowledgeForm({...knowledgeForm, category: e.target.value})}>
                                        {categories.map(cat => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <TextField label="或添加新分类" size="small" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                <Button onClick={handleAddCategory} variant="outlined" startIcon={<AddIcon />}>添加</Button>
                            </Box>
                            <TextField label="来源" fullWidth value={knowledgeForm.source} onChange={(e) => setKnowledgeForm({...knowledgeForm, source: e.target.value})} sx={{ mb: 2 }} />
                            <Button type="submit" variant="contained">添加知识</Button>
                        </Card>
                    )}
                    <Grid container spacing={3} justifyContent="center">
                        {knowledge.map(item => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{item.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Typography>
                                        <Chip label={item.category} size="small" sx={{ mt: 1 }} />
                                    </CardContent>
                                    <CardActions>
                                        <IconButton size="small" onClick={() => handleEdit('knowledge', item)}><EditIcon /></IconButton>
                                        <IconButton size="small" onClick={() => handleDelete('knowledge', item.id)}><DeleteIcon /></IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            );
        case 'tasks':
             return (
                <>
                    {centeredFormContainer(
                        <Card component="form" onSubmit={handleTaskSubmit} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>添加新任务</Typography>
                            <TextField label="标题" fullWidth value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} required sx={{ mb: 2 }} />
                            <TextField label="描述" fullWidth multiline rows={3} value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} sx={{ mb: 2 }} />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>优先级</InputLabel>
                                <Select value={taskForm.priority} label="优先级" onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}>
                                    <MenuItem value="low">低</MenuItem>
                                    <MenuItem value="medium">中</MenuItem>
                                    <MenuItem value="high">高</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField type="date" label="截止日期" fullWidth value={taskForm.due_date} onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>关联目标</InputLabel>
                                <Select value={taskForm.goal_id} label="关联目标" onChange={(e) => setTaskForm({...taskForm, goal_id: e.target.value})}>
                                    <MenuItem value=""><em>无</em></MenuItem>
                                    {goals.map(goal => <MenuItem key={goal.id} value={goal.id}>{goal.title}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>父任务</InputLabel>
                                <Select value={taskForm.parent_task_id} label="父任务" onChange={(e) => setTaskForm({...taskForm, parent_task_id: e.target.value})}>
                                    <MenuItem value=""><em>无</em></MenuItem>
                                    {tasks.filter(task => !task.parent_task_id).map(task => <MenuItem key={task.id} value={task.id}>{task.title}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Button type="submit" variant="contained">添加任务</Button>
                        </Card>
                    )}
                    <Grid container spacing={3} justifyContent="center">
                        {tasks.filter(task => !task.parent_task_id).map(item => renderTaskTree(item, 0))}
                    </Grid>
                </>
            );
        case 'goals':
            return (
                <>
                    {centeredFormContainer(
                        <Card component="form" onSubmit={handleGoalSubmit} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>设立新目标</Typography>
                            <TextField label="标题" fullWidth value={goalForm.title} onChange={(e) => setGoalForm({...goalForm, title: e.target.value})} required sx={{ mb: 2 }} />
                            <TextField label="描述" fullWidth multiline rows={3} value={goalForm.description} onChange={(e) => setGoalForm({...goalForm, description: e.target.value})} sx={{ mb: 2 }} />
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>类型</InputLabel>
                                <Select value={goalForm.type} label="类型" onChange={(e) => setGoalForm({...goalForm, type: e.target.value})}>
                                    <MenuItem value="weekly">周目标</MenuItem>
                                    <MenuItem value="monthly">月目标</MenuItem>
                                    <MenuItem value="yearly">年目标</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField type="date" label="目标日期" fullWidth value={goalForm.target_date} onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})} InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
                            <Button type="submit" variant="contained">设立目标</Button>
                        </Card>
                    )}
                    <Grid container spacing={3} justifyContent="center">
                        {goals.map(item => (
                            <Grid item xs={12} sm={6} md={4} key={item.id}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{item.title}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{item.description}</Typography>
                                        <Chip label={item.type} size="small" sx={{ mt: 1 }} />
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>目标日期: {formatDate(item.target_date)}</Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>进度: {item.progress || 0}%</Typography>
                                        <Slider value={item.progress || 0} onChange={(e, newValue) => updateGoalProgress(item.id, newValue)} aria-labelledby="input-slider" sx={{ mt: 1 }} />
                                    </CardContent>
                                    <CardActions>
                                        <IconButton size="small" onClick={() => handleEdit('goals', item)}><EditIcon /></IconButton>
                                        <IconButton size="small" onClick={() => handleDelete('goals', item.id)}><DeleteIcon /></IconButton>
                                        <Button size="small" onClick={() => showGoalTasks(item.id)}>查看任务</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            );
        case 'statistics':
            return <Statistics />;
        default:
            return null;
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            个人成长管理
          </Typography>
          <SearchBar onSearch={handleSearch} />
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ mr: 2 }}>你好, {user.username}</Typography>
            <Button color="inherit" onClick={logout}>注销</Button>
          </Box>
        </Toolbar>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered indicatorColor="secondary" textColor="inherit">
          <Tab label="AI 成长助手" />
          <Tab label="灵感记录" />
          <Tab label="知识学习" />
          <Tab label="任务管理" />
          <Tab label="目标规划" />
          <Tab label="成长统计" />
        </Tabs>
      </AppBar>

      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        {renderContent()}
      </Container>

      {editModal.show && (
        <EditModal
          type={editModal.type}
          data={editModal.data}
          categories={categories}
          tasks={tasks}
          goals={goals}
          onSave={handleSaveEdit}
          onClose={() => setEditModal({ show: false, type: '', data: null })}
        />
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
