import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Pagination,
    Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '../../context/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { TableSkeleton } from './SkeletonLoaders';

const DataTable = ({
    rowData,
    columnDefs,
    loading,
    pagination = true,
    paginationPageSize = 10,
    height = 600,
    enableGlobalSearch = true,
    searchPlaceholder = "Search...",
    title,
    actions,
    externalSearchTerm,
    ...props
}) => {
    const gridRef = useRef();
    const { isDark } = useTheme();
    const muiTheme = useMuiTheme();
    const [quickFilterText, setQuickFilterText] = useState('');
    const [pageSize, setPageSize] = useState(paginationPageSize);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const onPaginationChanged = useCallback(() => {
        if (gridRef.current.api) {
            setTotalPages(gridRef.current.api.paginationGetTotalPages());
            setCurrentPage(gridRef.current.api.paginationGetCurrentPage() + 1);
        }
    }, []);

    const handlePageChange = (event, value) => {
        gridRef.current.api.paginationGoToPage(value - 1);
    };

    // Sync external search term
    useEffect(() => {
        if (externalSearchTerm !== undefined && gridRef.current && gridRef.current.api) {
            gridRef.current.api.setQuickFilter(externalSearchTerm);
        }
    }, [externalSearchTerm]);

    // Dark mode specific styles for Ag-Grid
    const gridStyle = useMemo(() => ({
        height: '100%',
        width: '100%',
        '--ag-header-background-color': isDark ? '#1e1e1e' : '#f8f9fa',
        '--ag-odd-row-background-color': isDark ? '#121212' : '#ffffff',
        '--ag-background-color': isDark ? '#121212' : '#ffffff',
        '--ag-foreground-color': isDark ? '#e0e0e0' : '#2c3e50',
        '--ag-border-color': isDark ? '#333' : '#eaecf0',
        '--ag-header-foreground-color': isDark ? '#fff' : '#5f6368',
        '--ag-data-color': isDark ? '#e0e0e0' : '#2c3e50',
        '--ag-row-hover-color': isDark ? '#2c2c2c' : '#f1f3f4',
        '--ag-selected-row-background-color': isDark ? 'rgba(63, 81, 181, 0.2)' : 'rgba(26, 35, 126, 0.08)',
        fontFamily: muiTheme.typography.fontFamily,
    }), [isDark, muiTheme]);

    const onFilterTextBoxChanged = useCallback((e) => {
        setQuickFilterText(e.target.value);
        gridRef.current.api.setQuickFilter(e.target.value);
    }, []);

    const onPageSizeChanged = useCallback((e) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        gridRef.current.api.paginationSetPageSize(newSize);
    }, []);

    const onExportClick = useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    if (loading) {
        return <TableSkeleton rows={10} columns={columnDefs?.length || 5} />;
    }

    return (
        <Box sx={{ width: '100%', height: height, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header Toolbar */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 1
            }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                    {title && (
                        <Typography variant="h6" fontWeight={600} sx={{ mr: 2 }}>
                            {title}
                        </Typography>
                    )}

                    {/* Global Search */}
                    {enableGlobalSearch && (
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder={searchPlaceholder}
                            value={quickFilterText}
                            onChange={onFilterTextBoxChanged}
                            sx={{ width: 350, bgcolor: 'background.paper' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Page Size Selector */}
                    {pagination && (
                        <FormControl size="small" sx={{ minWidth: 100, bgcolor: 'background.paper' }}>
                            <Select
                                value={pageSize}
                                onChange={onPageSizeChanged}
                                displayEmpty
                            >
                                <MenuItem value={10}>10 per page</MenuItem>
                                <MenuItem value={20}>20 per page</MenuItem>
                                <MenuItem value={50}>50 per page</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    {/* Export Button */}
                    <IconButton onClick={onExportClick} title="Export CSV" size="small">
                        <DownloadIcon fontSize="small" />
                    </IconButton>

                    {/* Additional Actions (passed from parent) */}
                    {actions}
                </Box>
            </Box>

            {/* Grid */}
            <Box
                className={isDark ? "ag-theme-material-dark" : "ag-theme-material"}
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    '& .ag-root-wrapper': {
                        border: `1px solid ${isDark ? '#333' : '#eaecf0'}`,
                        borderRadius: 2,
                        boxShadow: 'none',
                    },
                    '& .ag-header': {
                        borderBottom: `1px solid ${isDark ? '#333' : '#eaecf0'}`,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                    },
                    '& .ag-header-cell': {
                        paddingLeft: '16px',
                        paddingRight: '16px',
                    },
                    '& .ag-cell': {
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                    },
                    ...gridStyle,
                }}
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={pagination}
                    paginationPageSize={pageSize}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    suppressPaginationPanel={true}
                    animateRows={true}
                    onPaginationChanged={onPaginationChanged}
                    defaultColDef={{
                        sortable: true,
                        filter: false,
                        resizable: false,
                        suppressMovable: true,
                        suppressHeaderMenuButton: true,
                        flex: 1,
                        minWidth: 100,
                        headerClass: 'custom-header',
                    }}
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
                    onSelectionChanged={props.onSelectionChanged}
                    {...props}
                />
            </Box>

            {/* Premium Pagination Footer */}
            {pagination && totalPages > 0 && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: isDark ? 'action.hover' : '#f8f9fa',
                    borderRadius: 2,
                    mt: 1
                }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing page <b>{currentPage}</b> of <b>{totalPages}</b>
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        size="medium"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 1.5,
                                fontWeight: 600,
                                bgcolor: 'background.paper'
                            }
                        }}
                    />
                </Box>
            )}
        </Box>

    );
};

export default DataTable;
