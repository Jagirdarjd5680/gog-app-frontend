import React, { useMemo } from 'react';
import { Box, Typography, Autocomplete, TextField, Chip, Grid } from '@mui/material';

const CourseBatchSelect = ({ 
    courses = [], allBatches = [], values, setFieldValue, 
    courseFees, setCourseFees 
}) => {
    const fieldStyles = {
        '& .MuiInputBase-root': {
            borderRadius: '6px',
            color: 'var(--color-vc-ink)',
            bgcolor: 'var(--color-vc-canvas) !important',
            fontSize: '13px',
            fontFamily: 'inherit',
            py: '4px !important'
        },
        '& .MuiInputLabel-root': {
            color: 'var(--color-vc-mute)',
            fontFamily: 'inherit',
            fontSize: '13px',
            '&.Mui-focused': {
                color: 'var(--color-vc-ink)'
            }
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        }
    };

    const popupStyles = {
        bgcolor: 'var(--color-vc-canvas)',
        color: 'var(--color-vc-ink)',
        border: '1px solid var(--color-vc-hairline)',
        borderRadius: '6px',
        boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
        '& .MuiAutocomplete-listbox': {
            '& .MuiAutocomplete-option': {
                fontSize: '13px',
                fontFamily: 'inherit',
                '&[aria-selected="true"]': {
                    bgcolor: 'var(--color-vc-canvas-soft-2) !important'
                },
                '&.Mui-focused': {
                    bgcolor: 'var(--color-vc-canvas-soft)'
                }
            }
        }
    };

    // Filter batch options based on selected enrolled courses
    const batchOptions = useMemo(() => {
        if (!values.enrolledCourses || values.enrolledCourses.length === 0) {
            return allBatches;
        }

        const selectedCourseIds = values.enrolledCourses.map(cId => 
            String(cId?._id || cId?.id || cId)
        );

        return allBatches.filter(b => {
            const batchCourseId = String(b.course?._id || b.course?.id || b.courseId || b.course || '');
            return selectedCourseIds.includes(batchCourseId);
        });
    }, [allBatches, values.enrolledCourses]);

    // Selected course objects
    const selectedCourses = useMemo(() => {
        if (!courses || !values.enrolledCourses) return [];
        return courses.filter(c => {
            const cIdStr = String(c._id || c.id);
            return values.enrolledCourses.some(val => 
                String(val?._id || val?.id || val) === cIdStr
            );
        });
    }, [courses, values.enrolledCourses]);

    // Selected batch objects
    const selectedBatches = useMemo(() => {
        if (!allBatches || !values.batches) return [];
        return allBatches.filter(b => {
            const bIdStr = String(b._id || b.id);
            const bName = b.name;
            return values.batches.some(val => {
                const valStr = String(val?._id || val?.id || val);
                return valStr === bIdStr || valStr === bName;
            });
        });
    }, [allBatches, values.batches]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box sx={{ 
                    mb: 3, p: 2.5, 
                    bgcolor: 'var(--color-vc-canvas-soft)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-vc-hairline)',
                }}>
                    <Typography component="div" sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ width: 6, height: 6, bgcolor: 'var(--color-vc-link)', borderRadius: '50%' }} />
                        1. Assign Courses (Required First)
                    </Typography>
                    <Autocomplete
                        multiple id="enrolledCourses" options={courses || []}
                        getOptionLabel={(option) => option.title || ''}
                        value={selectedCourses}
                        slotProps={{ paper: { sx: popupStyles } }}
                        onChange={(event, newValue) => {
                            const newCourseIds = newValue.map(v => String(v._id || v.id));
                            setFieldValue('enrolledCourses', newCourseIds);
                            const newFeeState = { ...courseFees };
                            newValue.forEach(c => {
                                const cId = String(c._id || c.id);
                                if (!newFeeState[cId]) {
                                    newFeeState[cId] = {
                                        totalFee: c.price || 0,
                                        discount: 0,
                                        finalFee: c.price || 0,
                                        emiEnabled: false,
                                        emiCount: 1,
                                        newPayments: []
                                    };
                                }
                            });
                            setCourseFees(newFeeState);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Select Courses" placeholder="Choose courses first..." 
                            sx={fieldStyles} />
                        )}
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip 
                                        key={key} 
                                        label={option.title} 
                                        {...tagProps} 
                                        size="small" 
                                        sx={{ 
                                            borderRadius: '4px', 
                                            fontWeight: 500,
                                            fontSize: '11px',
                                            fontFamily: 'inherit',
                                            bgcolor: 'var(--color-vc-canvas)',
                                            color: 'var(--color-vc-ink)',
                                            border: '1px solid var(--color-vc-hairline)'
                                        }} 
                                    />
                                );
                            })
                        }
                    />
                </Box>
            </Grid>

            <Grid item xs={12}>
                <Autocomplete
                    multiple id="batches"
                    options={batchOptions}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedBatches}
                    slotProps={{ paper: { sx: popupStyles } }}
                    onChange={(event, newValue) => setFieldValue('batches', newValue.map(v => v.name))}
                    disabled={!values.enrolledCourses || values.enrolledCourses.length === 0}
                    renderInput={(params) => (
                        <TextField {...params} label="Assign Batches (Filtered by Course)" 
                        placeholder={(!values.enrolledCourses || values.enrolledCourses.length === 0) ? "Select courses first" : "Search batches..."}
                        margin="normal" sx={fieldStyles} />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return (
                                <Chip 
                                    key={key} 
                                    label={option.name} 
                                    {...tagProps} 
                                    size="small" 
                                    sx={{ 
                                        borderRadius: '4px', 
                                        fontWeight: 500,
                                        fontSize: '11px',
                                        fontFamily: 'inherit',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        color: 'var(--color-vc-ink)',
                                        border: '1px solid var(--color-vc-hairline)'
                                    }} 
                                />
                            );
                        })
                    }
                />
            </Grid>
        </Grid>
    );
};

export default CourseBatchSelect;
