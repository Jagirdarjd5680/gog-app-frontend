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
        const [path, search] = item.url.split('?');
        navigate({
            pathname: path,
            search: search ? `?${search}` : ''
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
                    elevation={0}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: open ? 500 : 260,
                        transition: 'all 0.2s ease',
                        borderRadius: open ? '6px 6px 0 0' : '6px',
                        px: 1.5,
                        py: 0.5,
                        border: '1px solid',
                        borderColor: open ? 'var(--color-topbar-border, var(--color-vc-hairline-strong))' : 'var(--color-topbar-border, var(--color-vc-hairline))',
                        bgcolor: 'var(--color-topbar-hover-bg, var(--color-vc-canvas-soft))',
                        boxShadow: open ? '0px 2px 2px rgba(0,0,0,0.02)' : 'none',
                    }}
                >
                    <SearchIcon sx={{ color: 'var(--color-topbar-text, var(--color-vc-mute))', opacity: 0.8, mr: 1, fontSize: 18 }} />

                    {/* Type filter - small select */}
                    {open && (
                        <FormControl variant="standard" sx={{ minWidth: 90, mr: 1 }}>
                            <Select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                disableUnderline
                                sx={{ fontSize: 12, color: 'var(--color-topbar-text, var(--color-vc-ink))', fontWeight: 600 }}
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
                        sx={{ flex: 1, fontSize: 14, color: 'var(--color-topbar-text, var(--color-vc-ink))', fontFamily: 'inherit' }}
                    />

                    {open && (
                        <IconButton size="small" onClick={handleClose} sx={{ color: 'var(--color-topbar-text, var(--color-vc-mute))', opacity: 0.8, '&:hover': { opacity: 1 } }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </Paper>

                {/* Dropdown results */}
                {open && (
                    <Paper
                        elevation={0}
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            borderRadius: '0 0 6px 6px',
                            border: '1px solid',
                            borderTop: 'none',
                            borderColor: 'var(--color-vc-hairline-strong)',
                            boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                            bgcolor: 'var(--color-vc-canvas)',
                            maxHeight: 400,
                            overflowY: 'auto',
                            zIndex: 1301,
                        }}
                    >
                        {loading ? (
                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={20} sx={{ color: 'var(--color-vc-primary)' }} />
                            </Box>
                        ) : results.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>
                                    {query.trim() ? `No results for "${query}"` : 'Start typing to search...'}
                                </Typography>
                            </Box>
                        ) : (
                            <List dense disablePadding>
                                {results.map((item, idx) => {
                                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.course;
                                    return (
                                        <Box key={`${item.type}-${item._id}`}>
                                            {idx > 0 && <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />}
                                            <ListItem
                                                button
                                                onClick={() => handleResultClick(item)}
                                                sx={{
                                                    py: 1.2,
                                                    px: 2,
                                                    color: 'var(--color-vc-ink)',
                                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' },
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36, color: cfg.color }}>
                                                    {cfg.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" fontWeight={500} noWrap sx={{ fontFamily: 'inherit', color: 'var(--color-vc-ink)' }}>
                                                            {item.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" noWrap sx={{ fontFamily: 'inherit', color: 'var(--color-vc-body)' }}>
                                                            {item.subtitle}
                                                        </Typography>
                                                    }
                                                />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={cfg.label}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: cfg.color + '15',
                                                            color: cfg.color,
                                                            fontWeight: 600,
                                                            fontSize: 10,
                                                            borderRadius: '4px'
                                                        }}
                                                    />
                                                    <OpenInNewIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />
                                                </Box>
                                            </ListItem>
                                        </Box>
                                    );
                                })}
                            </List>
                        )}

                        {/* Quick tip */}
                        <Box sx={{ p: 1.5, bgcolor: 'var(--color-vc-canvas-soft)', borderTop: '1px solid', borderColor: 'var(--color-vc-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
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
