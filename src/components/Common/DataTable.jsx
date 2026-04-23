import { useState, useMemo, useEffect, useRef } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    Checkbox,
    CircularProgress,
    Stack,
    Tooltip,
    Input,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTheme } from '../../context/ThemeContext';
import { TableSkeleton } from './SkeletonLoaders';

const EMPTY_ARRAY = [];

const DataTable = ({
    rowData = [],
    columnDefs = [],
    loading,
    pagination = true,
    paginationPageSize = 10,
    height = 'auto',
    enableGlobalSearch = true,
    searchPlaceholder = "Search...",
    title,
    actions,
    externalSearchTerm = '',
    onSelectionChanged,
    getRowId,
    selectedIds, // Truly optional, no default value
}) => {
    const { isDark } = useTheme();
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState([]);
    const [rowSelection, setRowSelection] = useState({});

    // Sync external search
    useEffect(() => {
        setGlobalFilter(externalSearchTerm || '');
    }, [externalSearchTerm]);

    // Sync initial selection
    useEffect(() => {
        // Only sync if selectedIds is explicitly provided (including empty array)
        if (selectedIds !== undefined && Array.isArray(selectedIds)) {
            // Check if we actually need to update to avoid infinite loops
            const currentSelectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
            const isSame = selectedIds.length === currentSelectedIds.length && 
                          selectedIds.every(id => rowSelection[id]);
            
            if (isSame) return;

            console.log('🔄 Syncing initial selection in DataTable', selectedIds);
            const selectionObj = {};
            selectedIds.forEach(id => {
                selectionObj[id] = true;
            });
            setRowSelection(selectionObj);
        }
    }, [selectedIds]);

    // Map Ag-Grid column definitions to TanStack Column format
    const columns = useMemo(() => {
        const mapped = columnDefs.map((col) => {
            if (col.checkboxSelection) {
                return {
                    id: 'select',
                    header: ({ table }) => (
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            indeterminate={table.getIsSomePageRowsSelected()}
                            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
                            size="small"
                        />
                    ),
                    cell: ({ row }) => (
                        <Checkbox
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            indeterminate={row.getIsSomeSelected()}
                            onChange={(e) => row.toggleSelected(!!e.target.checked)}
                            size="small"
                        />
                    ),
                    size: 50,
                };
            }

            return {
                id: col.field || col.headerName || Math.random().toString(),
                accessorKey: col.field,
                header: col.headerName || '',
                enableSorting: col.sortable !== false,
                cell: (info) => {
                    const data = info.row.original;
                    const index = info.row.index;
                    let value = info.getValue();

                    // Handle valueGetter with Ag-Grid compatibility (node.rowIndex)
                    if (col.valueGetter) {
                        try {
                            value = col.valueGetter({ 
                                data, 
                                value, 
                                node: { rowIndex: index },
                                context: {} 
                            });
                        } catch (e) {
                            console.error('ValueGetter error', e);
                        }
                    }

                    // Handle valueFormatter
                    if (col.valueFormatter) {
                        try {
                            value = col.valueFormatter({ data, value });
                        } catch (e) {
                            console.error('ValueFormatter error', e);
                        }
                    }

                    if (col.cellRenderer) {
                        const Renderer = col.cellRenderer;
                        if (typeof Renderer === 'function') {
                            try {
                                return <Renderer data={data} value={value} />;
                            } catch (e) {
                                // If it's a legacy Ag-Grid functional renderer, call it
                                return Renderer({ data, value });
                            }
                        }
                        return Renderer;
                    }

                    // Final Safety Check: Do not render objects
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                        return value.name || value.title || value.label || JSON.stringify(value);
                    }

                    return value;
                },
                size: col.width || undefined,
                minSize: col.minWidth || undefined,
            };
        });

        return mapped;
    }, [columnDefs]);

    const table = useReactTable({
        data: rowData || [],
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
            rowSelection,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        getRowId,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableRowSelection: true,
        initialState: {
            pagination: {
                pageSize: paginationPageSize,
            },
        },
    });

    // Use a ref to prevent infinite loops by tracking the last dispatched selection
    const lastDispatchedRef = useRef('');

    // Handle selection changes
    useEffect(() => {
        if (onSelectionChanged) {
            const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
            // Create a stable string representation of selected IDs to compare
            const selectionIds = selectedRows.map(r => getRowId ? getRowId(r) : (r.id || r._id)).sort().join(',');
            
            if (lastDispatchedRef.current === selectionIds) return;
            lastDispatchedRef.current = selectionIds;

            console.log('📢 DataTable dispatching onSelectionChanged', { 
                count: selectedRows.length,
                selectionState: rowSelection 
            });
            onSelectionChanged({ 
                api: { 
                    getSelectedNodes: () => table.getSelectedRowModel().rows.map(row => ({ data: row.original })),
                    getSelectedRows: () => selectedRows
                } 
            });
        }
    }, [rowSelection, onSelectionChanged, table, getRowId]);

    if (loading) {
        return <TableSkeleton rows={10} columns={columnDefs?.length || 5} />;
    }

    return (
        <Box sx={{ width: '100%', mt: 1 }}>
            {/* Toolbar & Pagination Top */}
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {title && <Typography variant="h6" fontWeight={800}>{title}</Typography>}
                        {enableGlobalSearch && (
                            <TextField
                                placeholder={searchPlaceholder}
                                size="small"
                                value={globalFilter ?? ''}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                sx={{ width: { xs: '100%', sm: 300 }, bgcolor: 'background.paper' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        )}
                    </Box>

                    {/* Top Pagination */}
                    {pagination && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => table.setPageSize(Number(e.target.value))}
                                size="small"
                                sx={{ 
                                    height: 32,
                                    fontSize: '0.75rem',
                                    borderRadius: 1.5,
                                    bgcolor: 'background.paper',
                                    fontWeight: 700,
                                    minWidth: 90
                                }}
                            >
                                {[10, 20, 50, 100].map(size => (
                                    <MenuItem key={size} value={size}>{size} Rows</MenuItem>
                                ))}
                            </Select>
                            <Pagination
                                count={table.getPageCount()}
                                page={table.getState().pagination.pageIndex + 1}
                                onChange={(e, page) => table.setPageIndex(page - 1)}
                                color="primary"
                                size="small"
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 1,
                                        fontWeight: 700,
                                        height: 32,
                                        minWidth: 32
                                    }
                                }}
                            />
                        </Stack>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {actions}
                        <Tooltip title="Download CSV">
                            <IconButton size="small" sx={{ bgcolor: 'action.hover' }}>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Table Container */}
            <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                    borderRadius: 3, 
                    border: `1px solid`,
                    borderColor: isDark ? 'divider' : '#e2e8f0',
                    maxHeight: height === 'auto' ? 'none' : height,
                    overflow: 'auto',
                    bgcolor: 'background.paper'
                }}
            >
                <Table stickyHeader size="medium">
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableCell 
                                        key={header.id}
                                        sx={{ 
                                            bgcolor: isDark ? '#1e293b' : '#f8fafc',
                                            color: isDark ? '#94a3b8' : '#475569',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                            py: 1.5,
                                            px: 2,
                                            width: header.column.getSize(),
                                            cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                            userSelect: 'none'
                                        }}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <Stack 
                                            direction="row" 
                                            spacing={0.5} 
                                            alignItems="center"
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() && (
                                                <Typography sx={{ fontSize: 10 }}>
                                                    {header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽'}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow 
                                key={row.id}
                                hover
                                selected={row.getIsSelected()}
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    cursor: 'default',
                                    transition: 'background-color 0.2s',
                                    '&.Mui-selected': {
                                        bgcolor: isDark ? 'rgba(59, 130, 246, 0.08) !important' : '#f0f7ff !important'
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell 
                                        key={cell.id} 
                                        sx={{ 
                                            py: 1.5, 
                                            px: 2, 
                                            borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {table.getRowModel().rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 10 }}>
                                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                                        No data available in table
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Bottom Info Bar */}
            {pagination && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', px: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Displaying records <b>{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</b> to <b>{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, rowData.length)}</b> of <b>{rowData.length}</b>
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default DataTable;
