import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, List, ListItem, 
  ListItemText, Divider, Paper, Skeleton 
} from '@mui/material';
import axios from '../../utils/api';
import { format } from 'date-fns';

const CreditHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get('/credits/history');
        if (data.success) {
          setHistory(data.data);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />;

  return (
    <Paper sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" mb={2}>Transaction History</Typography>
      <List sx={{ width: '100%' }}>
        {history.map((tx, index) => (
          <React.Fragment key={tx._id}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography fontWeight="bold">{tx.reason}</Typography>
                    <Typography 
                      color={tx.type === 'credit' ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </Typography>
                }
              />
            </ListItem>
            {index < history.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {history.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            No transactions yet
          </Typography>
        )}
      </List>
    </Paper>
  );
};

export default CreditHistory;
