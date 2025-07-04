import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Statistics from './components/Statistics';
import SearchBar from './components/SearchBar';
import EditModal from './components/EditModal';
import './App.css';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('inspirations');
  const [inspirations, setInspirations] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 编辑状态
  const [editModal, setEditModal] = useState({ show: false, type: '', data: null });

  // 表单状态
  const [inspirationForm, setInspirationForm] = useState({ content: '', tags: '' });
  const [knowledgeForm, setKnowledgeForm] = useState({ title: '', content: '', category: '', source: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [goalForm, setGoalForm] = useState({ title: '', description: '', type: 'weekly', target_date: '' });
  const [newCategory, setNewCategory] = useState('');

  // 获取数据
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchInspirations();
    fetchKnowledge();
    fetchTasks();
    fetchGoals();
    fetchCategories();
  };

  const fetchInspirations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/inspirations`);
      setInspirations(response.data);
    } catch (error) {
      console.error('Error fetching inspirations:', error);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const response = await axios.get(`${API_BASE}/knowledge`);
      setKnowledge(response.data);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_BASE}/goals`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // 搜索功能
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(response.data);
      setIsSearching(true);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  // 提交函数
  const handleInspirationSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/inspirations`, inspirationForm);
      setInspirationForm({ content: '', tags: '' });
      fetchInspirations();
    } catch (error) {
      console.error('Error adding inspiration:', error);
    }
  };

  const handleKnowledgeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/knowledge`, knowledgeForm);
      setKnowledgeForm({ title: '', content: '', category: '', source: '' });
      fetchKnowledge();
    } catch (error) {
      console.error('Error adding knowledge:', error);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/tasks`, taskForm);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/goals`, goalForm);
      setGoalForm({ title: '', description: '', type: 'weekly', target_date: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  // 添加新分类
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await axios.post(`${API_BASE}/categories`, { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // 编辑和删除函数
  const handleEdit = (type, data) => {
    setEditModal({ show: true, type, data });
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('确定要删除这条记录吗？')) return;
    
    try {
      await axios.delete(`${API_BASE}/${type}/${id}`);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSaveEdit = async (type, id, data) => {
    try {
      await axios.put(`${API_BASE}/${type}/${id}`, data);
      setEditModal({ show: false, type: '', data: null });
      fetchAllData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // 更新任务状态
  const updateTaskStatus = async (taskId, status) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await axios.put(`${API_BASE}/tasks/${taskId}`, { ...task, status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // 更新目标进度
  const updateGoalProgress = async (goalId, progress) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      await axios.put(`${API_BASE}/goals/${goalId}`, { ...goal, progress });
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!isSearching || !searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>个人成长管理</h1>
        <SearchBar onSearch={handleSearch} />
        <nav>
          <button 
            className={activeTab === 'inspirations' ? 'active' : ''} 
            onClick={() => { setActiveTab('inspirations'); setIsSearching(false); }}
          >
            灵感记录
          </button>
          <button 
            className={activeTab === 'knowledge' ? 'active' : ''} 
            onClick={() => { setActiveTab('knowledge'); setIsSearching(false); }}
          >
            知识学习
          </button>
          <button 
            className={activeTab === 'tasks' ? 'active' : ''} 
            onClick={() => { setActiveTab('tasks'); setIsSearching(false); }}
          >
            任务管理
          </button>
          <button 
            className={activeTab === 'goals' ? 'active' : ''} 
            onClick={() => { setActiveTab('goals'); setIsSearching(false); }}
          >
            目标规划
          </button>
          <button 
            className={activeTab === 'statistics' ? 'active' : ''} 
            onClick={() => { setActiveTab('statistics'); setIsSearching(false); }}
          >
            成长统计
          </button>
        </nav>
      </header>

      <main className="main-content">
        {isSearching && (
          <div className="tab-content">
            <h2>搜索结果</h2>
            <div className="search-results">
              {searchResults.length > 0 ? (
                <div className="items-list">
                  {searchResults.map(item => (
                    <div key={`${item.type}-${item.id}`} className="item-card search-result">
                      <div className="search-type">{item.type === 'inspiration' ? '灵感' : item.type === 'knowledge' ? '知识' : item.type === 'task' ? '任务' : '目标'}</div>
                      <h3 dangerouslySetInnerHTML={{__html: highlightSearchTerm(item.title || item.content.substring(0, 50), '')}}></h3>
                      <p dangerouslySetInnerHTML={{__html: highlightSearchTerm(item.content || '', '')}}></p>
                      <span className="date">{formatDate(item.created_at)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>没有找到匹配的内容</p>
              )}
            </div>
          </div>
        )}

        {!isSearching && activeTab === 'inspirations' && (
          <div className="tab-content">
            <h2>灵感记录</h2>
            <form onSubmit={handleInspirationSubmit} className="form">
              <textarea
                placeholder="记录你的灵感..."
                value={inspirationForm.content}
                onChange={(e) => setInspirationForm({...inspirationForm, content: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="标签 (用逗号分隔)"
                value={inspirationForm.tags}
                onChange={(e) => setInspirationForm({...inspirationForm, tags: e.target.value})}
              />
              <button type="submit">添加灵感</button>
            </form>
            <div className="items-list">
              {inspirations.map(item => (
                <div key={item.id} className="item-card">
                  <p>{item.content}</p>
                  <div className="item-meta">
                    <span className="tags">{item.tags}</span>
                    <span className="date">{formatDate(item.created_at)}</span>
                    <div className="item-actions">
                      <button onClick={() => handleEdit('inspirations', item)} className="edit-btn">编辑</button>
                      <button onClick={() => handleDelete('inspirations', item.id)} className="delete-btn">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && activeTab === 'knowledge' && (
          <div className="tab-content">
            <h2>知识学习</h2>
            <form onSubmit={handleKnowledgeSubmit} className="form">
              <input
                type="text"
                placeholder="知识标题"
                value={knowledgeForm.title}
                onChange={(e) => setKnowledgeForm({...knowledgeForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="知识内容"
                value={knowledgeForm.content}
                onChange={(e) => setKnowledgeForm({...knowledgeForm, content: e.target.value})}
                required
              />
              <div className="category-input">
                <select
                  value={knowledgeForm.category}
                  onChange={(e) => setKnowledgeForm({...knowledgeForm, category: e.target.value})}
                >
                  <option value="">选择分类</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="add-category">
                  <input
                    type="text"
                    placeholder="添加新分类"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button type="button" onClick={handleAddCategory}>添加</button>
                </div>
              </div>
              <input
                type="text"
                placeholder="来源"
                value={knowledgeForm.source}
                onChange={(e) => setKnowledgeForm({...knowledgeForm, source: e.target.value})}
              />
              <button type="submit">添加知识</button>
            </form>
            <div className="items-list">
              {knowledge.map(item => (
                <div key={item.id} className="item-card">
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                  <div className="item-meta">
                    <span className="category">{item.category}</span>
                    <span className="source">{item.source}</span>
                    <span className="date">{formatDate(item.created_at)}</span>
                    <div className="item-actions">
                      <button onClick={() => handleEdit('knowledge', item)} className="edit-btn">编辑</button>
                      <button onClick={() => handleDelete('knowledge', item.id)} className="delete-btn">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && activeTab === 'tasks' && (
          <div className="tab-content">
            <h2>任务管理</h2>
            <form onSubmit={handleTaskSubmit} className="form">
              <input
                type="text"
                placeholder="任务标题"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="任务描述"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              />
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
              >
                <option value="low">低优先级</option>
                <option value="medium">中优先级</option>
                <option value="high">高优先级</option>
              </select>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
              />
              <button type="submit">添加任务</button>
            </form>
            <div className="items-list">
              {tasks.map(task => (
                <div key={task.id} className={`item-card task-card ${task.status}`}>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <div className="task-actions">
                    <span className={`priority ${task.priority}`}>{task.priority}</span>
                    {task.due_date && <span className="due-date">截止: {formatDate(task.due_date)}</span>}
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    >
                      <option value="pending">待完成</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                    <div className="item-actions">
                      <button onClick={() => handleEdit('tasks', task)} className="edit-btn">编辑</button>
                      <button onClick={() => handleDelete('tasks', task.id)} className="delete-btn">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && activeTab === 'goals' && (
          <div className="tab-content">
            <h2>目标规划</h2>
            <form onSubmit={handleGoalSubmit} className="form">
              <input
                type="text"
                placeholder="目标标题"
                value={goalForm.title}
                onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="目标描述"
                value={goalForm.description}
                onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
              />
              <select
                value={goalForm.type}
                onChange={(e) => setGoalForm({...goalForm, type: e.target.value})}
              >
                <option value="weekly">周目标</option>
                <option value="monthly">月目标</option>
                <option value="yearly">年目标</option>
              </select>
              <input
                type="date"
                value={goalForm.target_date}
                onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})}
                required
              />
              <button type="submit">添加目标</button>
            </form>
            <div className="items-list">
              {goals.map(goal => (
                <div key={goal.id} className="item-card goal-card">
                  <h3>{goal.title}</h3>
                  <p>{goal.description}</p>
                  <div className="goal-meta">
                    <span className={`goal-type ${goal.type}`}>{goal.type}</span>
                    <span className="target-date">目标日期: {formatDate(goal.target_date)}</span>
                    <div className="progress">
                      <div className="progress-controls">
                        <span>进度: {goal.progress}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                          className="progress-slider"
                        />
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${goal.progress}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEdit('goals', goal)} className="edit-btn">编辑</button>
                      <button onClick={() => handleDelete('goals', goal.id)} className="delete-btn">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && activeTab === 'statistics' && (
          <Statistics />
        )}
      </main>

      {editModal.show && (
        <EditModal
          type={editModal.type}
          data={editModal.data}
          categories={categories}
          onSave={handleSaveEdit}
          onClose={() => setEditModal({ show: false, type: '', data: null })}
        />
      )}
    </div>
  );
}

export default App;