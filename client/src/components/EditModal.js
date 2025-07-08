import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography
} from '@mui/material';

const EditModal = ({ type, data, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // 当传入的数据变化时，更新表单状态
    // 对于日期，需要格式化为 YYYY-MM-DD
    const initialData = { ...data };
    if (initialData.due_date) {
        initialData.due_date = initialData.due_date.split('T')[0];
    }
    if (initialData.target_date) {
        initialData.target_date = initialData.target_date.split('T')[0];
    }
    setFormData(initialData);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(type, data.id, formData);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const typeTitleMap = {
      inspirations: '灵感',
      knowledge: '知识',
      tasks: '任务',
      goals: '目标'
  }

  const renderForm = () => {
    switch (type) {
      case 'inspirations':
        return (
          <>
            <TextField
              autoFocus
              margin="dense"
              label="灵感内容"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              variant="outlined"
            />
            <TextField
              margin="dense"
              label="标签 (用逗号分隔)"
              type="text"
              fullWidth
              value={formData.tags || ''}
              onChange={(e) => handleChange('tags', e.target.value)}
              variant="outlined"
            />
          </>
        );
      case 'knowledge':
        return (
            <>
                <TextField autoFocus margin="dense" label="标题" type="text" fullWidth value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} variant="outlined" />
                <TextField margin="dense" label="内容" type="text" fullWidth multiline rows={4} value={formData.content || ''} onChange={(e) => handleChange('content', e.target.value)} variant="outlined" />
                <FormControl fullWidth margin="dense">
                    <InputLabel>分类</InputLabel>
                    <Select value={formData.category || ''} label="分类" onChange={(e) => handleChange('category', e.target.value)}>
                        {categories.map(cat => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField margin="dense" label="来源" type="text" fullWidth value={formData.source || ''} onChange={(e) => handleChange('source', e.target.value)} variant="outlined" />
            </>
        );
      case 'tasks':
        return (
            <>
                <TextField autoFocus margin="dense" label="标题" type="text" fullWidth value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} variant="outlined" />
                <TextField margin="dense" label="描述" type="text" fullWidth multiline rows={3} value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} variant="outlined" />
                <FormControl fullWidth margin="dense">
                    <InputLabel>优先级</InputLabel>
                    <Select value={formData.priority || 'medium'} label="优先级" onChange={(e) => handleChange('priority', e.target.value)}>
                        <MenuItem value="low">低</MenuItem>
                        <MenuItem value="medium">中</MenuItem>
                        <MenuItem value="high">高</MenuItem>
                    </Select>
                </FormControl>
                <TextField margin="dense" label="截止日期" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.due_date || ''} onChange={(e) => handleChange('due_date', e.target.value)} />
            </>
        );
      case 'goals':
        return (
            <>
                <TextField autoFocus margin="dense" label="标题" type="text" fullWidth value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} variant="outlined" />
                <TextField margin="dense" label="描述" type="text" fullWidth multiline rows={3} value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} variant="outlined" />
                <FormControl fullWidth margin="dense">
                    <InputLabel>类型</InputLabel>
                    <Select value={formData.type || 'weekly'} label="类型" onChange={(e) => handleChange('type', e.target.value)}>
                        <MenuItem value="weekly">周目标</MenuItem>
                        <MenuItem value="monthly">月目标</MenuItem>
                        <MenuItem value="yearly">年目标</MenuItem>
                    </Select>
                </FormControl>
                <TextField margin="dense" label="目标日期" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.target_date || ''} onChange={(e) => handleChange('target_date', e.target.value)} />
                <Typography gutterBottom sx={{mt: 2}}>进度: {formData.progress || 0}%</Typography>
                <Slider value={formData.progress || 0} onChange={(e, newValue) => handleChange('progress', newValue)} aria-labelledby="input-slider" />
            </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>编辑{typeTitleMap[type]}</DialogTitle>
      <DialogContent>
        {renderForm()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSubmit} variant="contained">保存</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModal;
