import React, { useState } from 'react';
import { Button, Box, Typography, CircularProgress, Card, CardContent, List, ListItem, ListItemText, Link, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as api from '../services/api';

const StyledCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderLeft: `5px solid ${theme.palette.primary.main}`,
}));

const AIHelper = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.ai.getAnalysis();
      setAnalysis(response.data);
    } catch (err) {
      setError('无法获取分析建议，请稍后再试。');
      console.error('Error getting AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', p: 2 }}>
      <Typography variant="h4" gutterBottom>AI 成长助手</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        点击下方按钮，让 AI 综合分析你近期的所有记录，为你提供个性化的成长建议和相关的文章推荐。
      </Typography>
      
      <Button variant="contained" size="large" onClick={handleAnalysis} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : '为我生成成长建议'}
      </Button>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

      {analysis && (
        <Paper elevation={2} sx={{ mt: 4, textAlign: 'left', p: 3 }}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>智能分析与建议</Typography>
              <List>
                {analysis.suggestions.map((suggestion, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>

          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>为你推荐</Typography>
              <List>
                {analysis.recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <Link href={rec.url} target="_blank" rel="noopener noreferrer">
                      {rec.title}
                    </Link>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </StyledCard>
        </Paper>
      )}
    </Box>
  );
};

export default AIHelper;