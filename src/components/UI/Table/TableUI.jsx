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
    Stack,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '../../../context/ThemeContext';
import { TableSkeleton } from '../../Common/SkeletonLoaders';

const TableUI = ({
    rowData = [],
    columnDefs = [],
    loading,
    pagination = true,
    paginationPageSize = 10,
    height = 'auto',
    enableGlobalSearch = false,
    searchPlaceholder = "Search...",
    title,
    actions,
    externalSearchTerm = '',
    onSelectionChanged,
    getRowId,
    selectedIds,
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
        if (selectedIds !== undefined && Array.isArray(selectedIds)) {
            const currentSelectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
            const isSame = selectedIds.length === currentSelectedIds.length && 
                          selectedIds.every(id => rowSelection[id]);
            
            if (isSame) return;

            const selectionObj = {};
            selectedIds.forEach(id => {
                selectionObj[id] = true;
            });
            setRowSelection(selectionObj);
        }
    }, [selectedIds]);

    // Map column definitions
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

                    if (col.valueGetter) {
                        try {
                            value = col.valueGetter({ 
                                data, 
                                value, 
                                node: { rowIndex: index },
                                context: {} 
                            });
                        } catch (e) {
                            
                        }
                    }

                    if (col.valueFormatter) {
                        try {
                            value = col.valueFormatter({ data, value });
                        } catch (e) {
                            
                        }
                    }

                    if (col.cellRenderer) {
                        const Renderer = col.cellRenderer;
                        if (typeof Renderer === 'function') {
                            try {
                                return <Renderer data={data} value={value} />;
                            } catch (e) {
                                return Renderer({ data, value });
                            }
                        }
                        return Renderer;
                    }

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

    const lastDispatchedRef = useRef('');

    useEffect(() => {
        if (onSelectionChanged) {
            const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
            const selectionIds = selectedRows.map(r => getRowId ? getRowId(r) : (r.id || r._id)).sort().join(',');
            
            if (lastDispatchedRef.current === selectionIds) return;
            lastDispatchedRef.current = selectionIds;

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
            {(enableGlobalSearch || actions || title) && (
                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {title && <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{title}</Typography>}
                            {enableGlobalSearch && (
                                <TextField
                                    placeholder={searchPlaceholder}
                                    size="small"
                                    value={globalFilter ?? ''}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    sx={{ 
                                        width: { xs: '100%', sm: 260 },
                                        '& .MuiInputBase-root': {
                                            height: 32,
                                            fontSize: '13px',
                                            fontFamily: 'inherit',
                                            borderRadius: '6px',
                                            color: 'var(--color-vc-ink)',
                                            bgcolor: 'var(--color-vc-canvas)',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'var(--color-vc-hairline)',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'var(--color-vc-hairline-strong)'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'var(--color-vc-hairline-strong)'
                                        }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" sx={{ color: 'var(--color-vc-mute)' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {actions}
                            <Tooltip title="Download CSV">
                                <IconButton 
                                    size="small" 
                                    sx={{ 
                                        border: '1px solid var(--color-vc-hairline)', 
                                        borderRadius: '6px', 
                                        color: 'var(--color-vc-mute)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        height: 32,
                                        width: 32,
                                        '&:hover': {
                                            color: 'var(--color-vc-ink)',
                                            borderColor: 'var(--color-vc-hairline-strong)',
                                            bgcolor: 'var(--color-vc-canvas-soft)'
                                        } 
                                    }}
                                >
                                    <DownloadIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Table Container */}
            <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-vc-hairline)',
                    maxHeight: height === 'auto' ? 'none' : height,
                    overflow: 'auto',
                    bgcolor: 'var(--color-vc-canvas)'
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
                                            bgcolor: 'var(--color-vc-canvas-soft)',
                                            color: 'var(--color-vc-mute)',
                                            fontWeight: 600,
                                            fontSize: '11px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            fontFamily: 'inherit',
                                            borderBottom: '1px solid var(--color-vc-hairline)',
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
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-canvas-soft) !important'
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: 'var(--color-vc-canvas-soft-2) !important',
                                        '&:hover': {
                                            bgcolor: 'var(--color-vc-canvas-soft-2) !important'
                                        }
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell 
                                        key={cell.id} 
                                        sx={{ 
                                            py: 1.5, 
                                            px: 2, 
                                            borderBottom: '1px solid var(--color-vc-hairline)',
                                            fontSize: '13px',
                                            color: 'var(--color-vc-ink)',
                                            fontFamily: 'inherit'
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
                                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '14px', fontFamily: 'inherit' }}>
                                        No data available in table
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Bottom Info & Pagination Bar */}
            {pagination && (
                <Box sx={{ 
                    mt: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    px: 2,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: '"JetBrains Mono", monospace' }}>
                        Displaying records <b>{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</b> to <b>{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, rowData.length)}</b> of <b>{rowData.length}</b>
                    </Typography>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            size="small"
                            sx={{ 
                                height: 32,
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                borderRadius: '6px',
                                color: 'var(--color-vc-ink)',
                                bgcolor: 'var(--color-vc-canvas)',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' },
                                minWidth: 100
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: 'var(--color-vc-canvas)',
                                        color: 'var(--color-vc-ink)',
                                        border: '1px solid var(--color-vc-hairline)',
                                        borderRadius: '6px',
                                        '& .MuiMenuItem-root': {
                                            fontSize: '12px',
                                            fontFamily: 'inherit',
                                            py: 0.75
                                        }
                                    }
                                }
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
                            variant="outlined"
                            shape="rounded"
                            size="small"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    borderRadius: '6px',
                                    fontWeight: 500,
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    height: 32,
                                    minWidth: 32,
                                    borderColor: 'var(--color-vc-hairline)',
                                    color: 'var(--color-vc-body)',
                                    '&.Mui-selected': {
                                        bgcolor: 'var(--color-vc-primary) !important',
                                        color: 'var(--color-vc-on-primary) !important',
                                        borderColor: 'var(--color-vc-primary)',
                                    },
                                    '&:hover': {
                                        bgcolor: 'var(--color-vc-canvas-soft)',
                                        color: 'var(--color-vc-ink)'
                                    }
                                }
                            }}
                        />
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default TableUI;
