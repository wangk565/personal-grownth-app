const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库初始化
const db = new sqlite3.Database('personal_growth.db');

// 创建表
db.serialize(() => {
  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 灵感记录表
  db.run(`CREATE TABLE IF NOT EXISTS inspirations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 知识学习表
  db.run(`CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    category TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 任务表
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 目标表
  db.run(`CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    type TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // 知识分类表
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 插入默认分类
  db.run(`INSERT OR IGNORE INTO categories (name) VALUES 
    ('技术学习'), ('读书笔记'), ('生活感悟'), ('工作经验'), ('其他')`);
});

// 灵感相关API
app.get('/api/inspirations', (req, res) => {
  db.all('SELECT * FROM inspirations ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/inspirations', (req, res) => {
  const { content, tags } = req.body;
  db.run('INSERT INTO inspirations (user_id, content, tags) VALUES (?, ?, ?)',
    [1, content, tags], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, content, tags });
    });
});

app.put('/api/inspirations/:id', (req, res) => {
  const { id } = req.params;
  const { content, tags } = req.body;
  db.run('UPDATE inspirations SET content = ?, tags = ? WHERE id = ?',
    [content, tags, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Inspiration updated successfully' });
    });
});

app.delete('/api/inspirations/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM inspirations WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Inspiration deleted successfully' });
  });
});

// 知识学习相关API
app.get('/api/knowledge', (req, res) => {
  db.all('SELECT * FROM knowledge ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/knowledge', (req, res) => {
  const { title, content, category, source } = req.body;
  db.run('INSERT INTO knowledge (user_id, title, content, category, source) VALUES (?, ?, ?, ?, ?)',
    [1, title, content, category, source], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, content, category, source });
    });
});

app.put('/api/knowledge/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, category, source } = req.body;
  db.run('UPDATE knowledge SET title = ?, content = ?, category = ?, source = ? WHERE id = ?',
    [title, content, category, source, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Knowledge updated successfully' });
    });
});

app.delete('/api/knowledge/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM knowledge WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Knowledge deleted successfully' });
  });
});

// 任务相关API
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, description, priority, due_date } = req.body;
  db.run('INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
    [1, title, description, priority, due_date], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, description, priority, due_date, status: 'pending' });
    });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priority, due_date, status } = req.body;
  const completed_at = status === 'completed' ? new Date().toISOString() : null;
  
  db.run('UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ?, completed_at = ? WHERE id = ?',
    [title, description, priority, due_date, status, completed_at, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Task updated successfully' });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted successfully' });
  });
});

// 目标相关API
app.get('/api/goals', (req, res) => {
  db.all('SELECT * FROM goals ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/goals', (req, res) => {
  const { title, description, type, target_date } = req.body;
  db.run('INSERT INTO goals (user_id, title, description, type, target_date) VALUES (?, ?, ?, ?, ?)',
    [1, title, description, type, target_date], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, description, type, target_date, status: 'active', progress: 0 });
    });
});

app.put('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, type, target_date, progress, status } = req.body;
  
  db.run('UPDATE goals SET title = ?, description = ?, type = ?, target_date = ?, progress = ?, status = ? WHERE id = ?',
    [title, description, type, target_date, progress, status, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Goal updated successfully' });
    });
});

app.delete('/api/goals/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM goals WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Goal deleted successfully' });
  });
});

// 分类相关API
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

// 统计数据API
app.get('/api/statistics', (req, res) => {
  const stats = {};
  
  // 获取灵感数量
  db.get('SELECT COUNT(*) as count FROM inspirations', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.inspirations = row.count;
    
    // 获取知识数量
    db.get('SELECT COUNT(*) as count FROM knowledge', (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.knowledge = row.count;
      
      // 获取任务统计
      db.all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const taskStats = { pending: 0, in_progress: 0, completed: 0 };
        rows.forEach(row => {
          taskStats[row.status] = row.count;
        });
        
        const totalTasks = taskStats.pending + taskStats.in_progress + taskStats.completed;
        stats.tasks = {
          total: totalTasks,
          completed: taskStats.completed,
          percentage: totalTasks > 0 ? Math.round((taskStats.completed / totalTasks) * 100) : 0
        };
        
        // 获取目标统计
        db.get('SELECT AVG(progress) as avgProgress, COUNT(*) as total FROM goals', (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          
          stats.goals = {
            total: row.total,
            averageProgress: Math.round(row.avgProgress || 0)
          };
          
          res.json(stats);
        });
      });
    });
  });
});

// 全局搜索API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  const searchTerm = `%${q}%`;
  const results = [];
  
  // 搜索灵感
  db.all('SELECT id, content as title, content, tags, created_at, "inspiration" as type FROM inspirations WHERE content LIKE ? OR tags LIKE ?', 
    [searchTerm, searchTerm], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      results.push(...rows);
      
      // 搜索知识
      db.all('SELECT id, title, content, category, source, created_at, "knowledge" as type FROM knowledge WHERE title LIKE ? OR content LIKE ? OR category LIKE ?', 
        [searchTerm, searchTerm, searchTerm], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          results.push(...rows);
          
          // 搜索任务
          db.all('SELECT id, title, description as content, status, priority, created_at, "task" as type FROM tasks WHERE title LIKE ? OR description LIKE ?', 
            [searchTerm, searchTerm], (err, rows) => {
              if (err) return res.status(500).json({ error: err.message });
              results.push(...rows);
              
              // 搜索目标
              db.all('SELECT id, title, description as content, type as goal_type, progress, created_at, "goal" as type FROM goals WHERE title LIKE ? OR description LIKE ?', 
                [searchTerm, searchTerm], (err, rows) => {
                  if (err) return res.status(500).json({ error: err.message });
                  results.push(...rows);
                  
                  // 按时间排序返回结果
                  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                  res.json(results);
                });
            });
        });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});