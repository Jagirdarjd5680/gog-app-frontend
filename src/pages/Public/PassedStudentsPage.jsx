import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, CardMedia, 
    Container, Skeleton, Chip, Avatar, Stack
} from '@mui/material';
import { Star as StarIcon, School as SchoolIcon } from '@mui/icons-material';
import api, { fixUrl } from '../../utils/api';

const PassedStudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/passed-students');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
                    color: 'secondary.main'
                }}>
                    Our Success Stories
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Meet our students who have achieved great success in their careers
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 4 }} />
                            <Skeleton variant="text" sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="60%" />
                        </Grid>
                    ))
                ) : (
                    students.map((student) => {
                        const imageUrl = student.images?.[0] || student.image || 'https://via.placeholder.com/150';
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={student._id}>
                                <Card sx={{ 
                                    height: '100%', 
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{ position: 'relative', height: 250 }}>
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={fixUrl(imageUrl)}
                                            alt={student.name}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            left: 0, 
                                            right: 0, 
                                            p: 2,
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                            color: 'white'
                                        }}>
                                            <Typography variant="h6" fontWeight={700}>{student.name}</Typography>
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Box sx={{ 
                                            mb: 2, 
                                            p: 1.5, 
                                            borderRadius: 2, 
                                            bgcolor: 'secondary.light', 
                                            color: 'secondary.contrastText',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            <StarIcon fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {student.achievement}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ 
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: 1.6
                                        }}>
                                            {student.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>
        </Container>
    );
};

export default PassedStudentsPage;
