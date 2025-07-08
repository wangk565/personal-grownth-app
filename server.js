const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your_jwt_secret_key'; // 强烈建议使用环境变量替换

// 中间件
app.use(cors());
app.use(express.json());

// 数据库初始化
const db = new sqlite3.Database('personal_growth.db');

// 创建表 (更新users表)
db.serialize(() => {
  // 用户表
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 其他表保持不变...
  db.run(`CREATE TABLE IF NOT EXISTS inspirations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    category TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    parent_task_id INTEGER,
    goal_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks (id) ON DELETE SET NULL,
    FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE SET NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    type TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, name)
  )`);
});

// --- 认证 API ---
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: '请输入所有必填项' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      [username, email, hashedPassword], function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: '用户名或邮箱已存在' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: '用户注册成功', userId: this.lastID });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '请输入邮箱和密码' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: '用户不存在' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: '密码错误' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// --- 认证中间件 ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AI 分析辅助函数 ---
const getTopKeywords = (texts, topN = 5) => {
    const stopWords = new Set(['', ' ', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'as', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'and', 'or', 'but', 'if', 'so', 'because', 'while', 'that', 'which', 'who', 'what', 'when', 'where', 'why', 'how', 'to', 'do', 'be', 'have', 'go', 'get', 'make', 'can', 'will', 'may', 'would', 'should', 'could', 'not', 'no', 'yes', 'please', 'thanks', 'ok', '的', '了', '在', '是', '我', '你', '他', '她', '它', '我们', '你们', '他们', '一个', '这个', '那个', '和', '与', '或', '但', '如果', '所以', '因为', '当', '地', '得', '地', '着', '过', '也', '还', '就', '都', '把', '被', '会', '能', '想', '要', '做', '去', '看', '说', '知道', '完成', '学习', '一个', '目标', '任务']);
    const wordCounts = {};
    
    texts.forEach(text => {
        if (typeof text !== 'string') return;
        const words = text.toLowerCase().split(/[^a-zA-Z0-9\u4e00-\u9fa5]+/).filter(word => !stopWords.has(word) && word.length > 1);
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
    });

    return Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(entry => entry[0]);
};


// --- 受保护的 API ---

// 灵感相关API
app.get('/api/inspirations', authenticateToken, (req, res) => {
  db.all('SELECT * FROM inspirations WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/inspirations', authenticateToken, (req, res) => {
  const { content, tags } = req.body;
  db.run('INSERT INTO inspirations (user_id, content, tags) VALUES (?, ?, ?)',
    [req.user.id, content, tags], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, content, tags });
    });
});

app.put('/api/inspirations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { content, tags } = req.body;
  db.run('UPDATE inspirations SET content = ?, tags = ? WHERE id = ? AND user_id = ?',
    [content, tags, id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权修改' });
      res.json({ message: 'Inspiration updated successfully' });
    });
});

app.delete('/api/inspirations/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM inspirations WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权删除' });
    res.json({ message: 'Inspiration deleted successfully' });
  });
});

// 知识学习相关API
app.get('/api/knowledge', authenticateToken, (req, res) => {
  db.all('SELECT * FROM knowledge WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/knowledge', authenticateToken, (req, res) => {
  const { title, content, category, source } = req.body;
  db.run('INSERT INTO knowledge (user_id, title, content, category, source) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, title, content, category, source], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, content, category, source });
    });
});

app.put('/api/knowledge/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, content, category, source } = req.body;
    db.run('UPDATE knowledge SET title = ?, content = ?, category = ?, source = ? WHERE id = ? AND user_id = ?',
      [title, content, category, source, id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权修改' });
        res.json({ message: 'Knowledge updated successfully' });
      });
  });
  
  app.delete('/api/knowledge/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM knowledge WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权删除' });
      res.json({ message: 'Knowledge deleted successfully' });
    });
  });

// 任务相关API
app.get('/api/tasks', authenticateToken, (req, res) => {
    db.all('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, description, priority, due_date, parent_task_id, goal_id } = req.body;
    // Ensure empty strings or other falsy values become null for foreign keys
    const final_parent_id = parent_task_id ? parent_task_id : null;
    const final_goal_id = goal_id ? goal_id : null;

    db.run('INSERT INTO tasks (user_id, title, description, priority, due_date, parent_task_id, goal_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, priority, due_date, final_parent_id, final_goal_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title, description, priority, due_date, status: 'pending', parent_task_id: final_parent_id, goal_id: final_goal_id });
      });
  });
  
  app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, description, priority, due_date, status, parent_task_id, goal_id } = req.body;
    const completed_at = status === 'completed' ? new Date().toISOString() : null;
    
    // Ensure empty strings or other falsy values become null for foreign keys
    const final_parent_id = parent_task_id ? parent_task_id : null;
    const final_goal_id = goal_id ? goal_id : null;

    db.run('UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ?, completed_at = ?, parent_task_id = ?, goal_id = ? WHERE id = ? AND user_id = ?',
      [title, description, priority, due_date, status, completed_at, final_parent_id, final_goal_id, id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权修改' });
        res.json({ message: 'Task updated successfully' });
      });
  });
  
  app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权删除' });
      res.json({ message: 'Task deleted successfully' });
    });
  });

// 目标相关API
app.get('/api/goals', authenticateToken, (req, res) => {
    db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  app.post('/api/goals', authenticateToken, (req, res) => {
    const { title, description, type, target_date } = req.body;
    db.run('INSERT INTO goals (user_id, title, description, type, target_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description, type, target_date], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title, description, type, target_date, status: 'active', progress: 0 });
      });
  });
  
  app.put('/api/goals/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, description, type, target_date, progress, status } = req.body;
    
    db.run('UPDATE goals SET title = ?, description = ?, type = ?, target_date = ?, progress = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, description, type, target_date, progress, status, id, req.user.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权修改' });
        res.json({ message: 'Goal updated successfully' });
      });
  });
  
  app.delete('/api/goals/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: '记录未找到或无权删除' });
      res.json({ message: 'Goal deleted successfully' });
    });
  });

// 获取目标下的所有任务
app.get('/api/goals/:id/tasks', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM tasks WHERE goal_id = ? AND user_id = ?', [id, req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 分类相关API
app.get('/api/categories', authenticateToken, (req, res) => {
    db.all('SELECT * FROM categories WHERE user_id = ? ORDER BY name', [req.user.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  app.post('/api/categories', authenticateToken, (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO categories (user_id, name) VALUES (?, ?)', [req.user.id, name], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: '该分类已存在' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name });
    });
  });

// 统计数据API
app.get('/api/statistics', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const stats = {};
    
    const queries = [
      `SELECT COUNT(*) as count FROM inspirations WHERE user_id = ${userId}`,
      `SELECT COUNT(*) as count FROM knowledge WHERE user_id = ${userId}`,
      `SELECT status, COUNT(*) as count FROM tasks WHERE user_id = ${userId} GROUP BY status`,
      `SELECT AVG(progress) as avgProgress, COUNT(*) as total FROM goals WHERE user_id = ${userId}`
    ];
  
    db.get(queries[0], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.inspirations = row.count;
  
      db.get(queries[1], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.knowledge = row.count;
  
        db.all(queries[2], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          const taskStats = { pending: 0, in_progress: 0, completed: 0 };
          rows.forEach(row => { taskStats[row.status] = row.count; });
          const totalTasks = taskStats.pending + taskStats.in_progress + taskStats.completed;
          stats.tasks = {
            total: totalTasks,
            completed: taskStats.completed,
            percentage: totalTasks > 0 ? Math.round((taskStats.completed / totalTasks) * 100) : 0
          };
  
          db.get(queries[3], (err, row) => {
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
app.get('/api/search', authenticateToken, (req, res) => {
    const { q } = req.query;
    const userId = req.user.id;
    if (!q) return res.json([]);
    
    const searchTerm = `%${q}%`;
    const results = [];
    const queries = [
        { sql: 'SELECT id, content as title, content, tags, created_at, "inspiration" as type FROM inspirations WHERE user_id = ? AND (content LIKE ? OR tags LIKE ?)', params: [userId, searchTerm, searchTerm] },
        { sql: 'SELECT id, title, content, category, source, created_at, "knowledge" as type FROM knowledge WHERE user_id = ? AND (title LIKE ? OR content LIKE ? OR category LIKE ?)', params: [userId, searchTerm, searchTerm, searchTerm] },
        { sql: 'SELECT id, title, description as content, status, priority, created_at, "task" as type FROM tasks WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)', params: [userId, searchTerm, searchTerm] },
        { sql: 'SELECT id, title, description as content, type as goal_type, progress, created_at, "goal" as type FROM goals WHERE user_id = ? AND (title LIKE ? OR description LIKE ?)', params: [userId, searchTerm, searchTerm] }
    ];

    let completed = 0;
    queries.forEach(q => {
        db.all(q.sql, q.params, (err, rows) => {
            if (err) {
                // 在实际应用中可能需要更复杂的错误处理
                console.error(err);
            } else {
                results.push(...rows);
            }
            completed++;
            if (completed === queries.length) {
                results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                res.json(results);
            }
        });
    });
});

// --- AI 分析 API ---
app.get('/api/ai/analysis', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const dateLimit = oneMonthAgo.toISOString();

    const queries = {
        inspirations: `SELECT content, tags FROM inspirations WHERE user_id = ? AND created_at >= ?`,
        knowledge: `SELECT title, content, category FROM knowledge WHERE user_id = ? AND created_at >= ?`,
        tasks: `SELECT title, description, status FROM tasks WHERE user_id = ? AND created_at >= ?`,
        goals: `SELECT title, description, progress FROM goals WHERE user_id = ? AND created_at >= ?`,
    };

    const results = {};
    let completed = 0;

    Object.keys(queries).forEach(key => {
        db.all(queries[key], [userId, dateLimit], (err, rows) => {
            if (err) {
                console.error(`Error fetching ${key}:`, err);
                results[key] = [];
            } else {
                results[key] = rows;
            }
            completed++;

            if (completed === Object.keys(queries).length) {
                // --- 数据分析 ---
                const analysis = {};
                const allText = [
                    ...results.inspirations.map(i => `${i.content} ${i.tags}`),
                    ...results.knowledge.map(k => `${k.title} ${k.content} ${k.category}`),
                    ...results.tasks.map(t => `${t.title} ${t.description}`),
                    ...results.goals.map(g => `${g.title} ${g.description}`),
                ].join(' ');

                analysis.keywords = getTopKeywords(allText.split(' '));

                const completedTasks = results.tasks.filter(t => t.status === 'completed').length;
                const totalTasks = results.tasks.length;
                analysis.taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                const activeGoals = results.goals.filter(g => g.progress < 100);
                analysis.activeGoalsCount = activeGoals.length;
                analysis.avgGoalProgress = activeGoals.length > 0 ? Math.round(activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length) : 0;

                // --- 生成建议 ---
                const suggestions = [];
                if (analysis.keywords.length > 0) {
                    suggestions.push(`你近期的核心焦点似乎是：${analysis.keywords.join(', ')}。`);
                }
                suggestions.push(`你近期的任务完成率是 ${analysis.taskCompletionRate}%。${analysis.taskCompletionRate > 70 ? '做得不错，继续保持！' : '可以尝试将大任务分解成更小的步骤来提高效率。'}`);
                if (analysis.activeGoalsCount > 0) {
                    suggestions.push(`你当前有 ${analysis.activeGoalsCount} 个进行中的目标，平均进度为 ${analysis.avgGoalProgress}%。`);
                } else {
                    suggestions.push('你当前没有进行中的目标，考虑设立一些新目标来指引方向吧！');
                }

                // --- 生成搜索链接 ---
                const searchBaseUrl = 'https://www.google.com/search?q=';
                const recommendations = analysis.keywords.map(kw => ({
                    title: `搜索：${kw} 相关文章`,
                    url: searchBaseUrl + encodeURIComponent(kw)
                }));

                res.json({ suggestions, recommendations });
            }
        });
    });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 静态文件服务 (用于生产环境)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
