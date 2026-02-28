import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, InputBase, Paper, Typography, List, ListItem, ListItemIcon,
    ListItemText, Chip, Backdrop, CircularProgress, Divider, MenuItem,
    Select, FormControl, InputLabel, Tooltip, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate, createSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const TYPE_CONFIG = {
    user: { icon: <PeopleIcon fontSize="small" />, color: '#1976d2', label: 'User', nav: '/users' },
    course: { icon: <SchoolIcon fontSize="small" />, color: '#388e3c', label: 'Course', nav: '/courses' },
    exam: { icon: <QuizIcon fontSize="small" />, color: '#f57c00', label: 'Exam', nav: '/exam-management' },
    question: { icon: <LibraryBooksIcon fontSize="small" />, color: '#7b1fa2', label: 'Question', nav: '/question-bank' },
};

const GlobalSearchBar = () => {
    const [query, setQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    const search = useCallback(async (q, type) => {
        if (!q || q.trim().length < 1) { setResults([]); return; }
        setLoading(true);
        try {
            const params = { q: q.trim() };
            if (type && type !== 'all') params.type = type;
            const { data } = await api.get('/search', { params });
            setResults(data.data || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (query.trim()) search(query, filterType === 'all' ? null : filterType);
            else setResults([]);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query, filterType, search]);

    const handleFocus = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        setQuery('');
        setResults([]);
    };

    const handleResultClick = (item) => {
        navigate({
            pathname: item.url,
            search: createSearchParams({ q: query }).toString()
        });
        handleClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') handleClose();
    };

    return (
        <>
            {/* Backdrop overlay when search is open */}
            <Backdrop
                open={open}
                onClick={handleClose}
                sx={{ zIndex: 1250, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
            />

            <Box sx={{ position: 'relative', zIndex: 1300 }}>
                {/* Search Input */}
                <Paper
                    elevation={open ? 6 : 1}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: open ? 500 : 260,
                        transition: 'all 0.3s ease',
                        borderRadius: open ? '12px 12px 0 0' : '10px',
                        px: 1.5,
                        py: 0.5,
                        border: open ? '2px solid' : '1px solid',
                        borderColor: open ? 'primary.main' : 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <SearchIcon sx={{ color: open ? 'primary.main' : 'text.secondary', mr: 1, fontSize: 20 }} />

                    {/* Type filter - small select */}
                    {open && (
                        <FormControl variant="standard" sx={{ minWidth: 90, mr: 1 }}>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                disableUnderline
                                sx={{ fontSize: 12, color: 'primary.main', fontWeight: 700 }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="user">Users</MenuItem>
                                <MenuItem value="course">Courses</MenuItem>
                                <MenuItem value="exam">Exams</MenuItem>
                                <MenuItem value="question">Questions</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <InputBase
                        inputRef={inputRef}
                        placeholder="Search anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={handleFocus}
                        onKeyDown={handleKeyDown}
                        sx={{ flex: 1, fontSize: 14 }}
                    />

                    {open && (
                        <IconButton size="small" onClick={handleClose}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Paper>

                {/* Dropdown results */}
                {open && (
                    <Paper
                        elevation={8}
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            borderRadius: '0 0 12px 12px',
                            border: '2px solid',
                            borderTop: 'none',
                            borderColor: 'primary.main',
                            maxHeight: 400,
                            overflowY: 'auto',
                            zIndex: 1301,
                        }}
                    >
                        {loading ? (
                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : results.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography color="text.secondary" variant="body2">
                                    {query.trim() ? `No results for "${query}"` : 'Start typing to search...'}
                                </Typography>
                            </Box>
                        ) : (
                            <List dense disablePadding>
                                {results.map((item, idx) => {
                                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.course;
                                    return (
                                        <Box key={`${item.type}-${item._id}`}>
                                            {idx > 0 && <Divider />}
                                            <ListItem
                                                button
                                                onClick={() => handleResultClick(item)}
                                                sx={{
                                                    py: 1.2,
                                                    px: 2,
                                                    '&:hover': { bgcolor: 'action.hover' },
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36, color: cfg.color }}>
                                                    {cfg.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" fontWeight={600} noWrap>
                                                            {item.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" color="text.secondary" noWrap>
                                                            {item.subtitle}
                                                        </Typography>
                                                    }
                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={cfg.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: cfg.color + '20',
                                                            color: cfg.color,
                                                            fontWeight: 700,
                                                            fontSize: 10
                                                        }}
                                                    />
                                                    <OpenInNewIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                </Box>
                                            </ListItem>
                                        </Box>
                                    );
                                })}
                            </List>
                        )}

                        {/* Quick tip */}
                        <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Press <strong>Esc</strong> to close
                            </Typography>
                        </Box>
                    </Paper>
                )}
            </Box>
        </>
    );
};

export default GlobalSearchBar;
