import React, { useState, useEffect } from 'react';

const EditModal = ({ type, data, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({ ...data });
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(type, data.id, formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const renderForm = () => {
    switch (type) {
      case 'inspirations':
        return (
          <>
            <div className="form-group">
              <label>灵感内容</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>标签</label>
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
            </div>
          </>
        );
      
      case 'knowledge':
        return (
          <>
            <div className="form-group">
              <label>标题</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>分类</label>
              <select
                value={formData.category || ''}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>来源</label>
              <input
                type="text"
                value={formData.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
              />
            </div>
          </>
        );
      
      case 'tasks':
        return (
          <>
            <div className="form-group">
              <label>标题</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>优先级</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <option value="low">低优先级</option>
                <option value="medium">中优先级</option>
                <option value="high">高优先级</option>
              </select>
            </div>
            <div className="form-group">
              <label>截止日期</label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>状态</label>
              <select
                value={formData.status || 'pending'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="pending">待完成</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </>
        );
      
      case 'goals':
        return (
          <>
            <div className="form-group">
              <label>标题</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>类型</label>
              <select
                value={formData.type || 'weekly'}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="weekly">周目标</option>
                <option value="monthly">月目标</option>
                <option value="yearly">年目标</option>
              </select>
            </div>
            <div className="form-group">
              <label>目标日期</label>
              <input
                type="date"
                value={formData.target_date || ''}
                onChange={(e) => handleChange('target_date', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>进度 ({formData.progress || 0}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress || 0}
                onChange={(e) => handleChange('progress', parseInt(e.target.value))}
              />
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>编辑{type === 'inspirations' ? '灵感' : type === 'knowledge' ? '知识' : type === 'tasks' ? '任务' : '目标'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {renderForm()}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn">取消</button>
            <button type="submit" className="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;