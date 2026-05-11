import React from 'react';
import { Box, Typography, Autocomplete, TextField, Chip, Grid } from '@mui/material';

const CourseBatchSelect = ({ 
    courses, allBatches, values, setFieldValue, 
    courseFees, setCourseFees 
}) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box sx={{ 
                    mb: 3, p: 2.5, bgcolor: 'primary.50', borderRadius: 3, border: '1px solid', 
                    borderColor: 'primary.100', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={800} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                        1. Assign Courses (Required First)
                    </Typography>
                    <Autocomplete
                        multiple id="enrolledCourses" options={courses}
                        getOptionLabel={(option) => option.title}
                        value={courses.filter(c => values.enrolledCourses?.includes(c._id))}
                        onChange={(event, newValue) => {
                            const newCourseIds = newValue.map(v => v._id);
                            setFieldValue('enrolledCourses', newCourseIds);
                            const newFeeState = { ...courseFees };
                            newValue.forEach(c => {
                                if (!newFeeState[c._id]) {
                                    newFeeState[c._id] = {
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }} />
                        )}
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });
                                return <Chip key={key} label={option.title} {...tagProps} color="primary" size="small" sx={{ borderRadius: 1.5, fontWeight: 600 }} />;
                            })
                        }
                    />
                </Box>
            </Grid>

            <Grid item xs={12}>
                <Autocomplete
                    multiple id="batches"
                    options={allBatches.filter(b => values.enrolledCourses.includes(b.course?._id || b.course))}
                    getOptionLabel={(option) => option.name}
                    value={allBatches.filter(b => values.batches?.includes(b._id) || values.batches?.includes(b.name))}
                    onChange={(event, newValue) => setFieldValue('batches', newValue.map(v => v._id))}
                    disabled={values.enrolledCourses.length === 0}
                    renderInput={(params) => (
                        <TextField {...params} label="Assign Batches (Filtered by Course)" 
                        placeholder={values.enrolledCourses.length === 0 ? "Select courses first" : "Search batches..."}
                        margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => {
                            const { key, ...tagProps } = getTagProps({ index });
                            return <Chip key={key} label={option.name} {...tagProps} color="info" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: 'info.soft' }} />;
                        })
                    }
                />
            </Grid>
        </Grid>
    );
};

export default CourseBatchSelect;
