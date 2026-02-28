import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const EnrollmentChart = ({ data = [] }) => {
    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                    Course Enrollments
                </Typography>

                {data.length === 0 ? (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">No enrollment data for this range</Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(str) => {
                                    try {
                                        return new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    } catch (e) {
                                        return str;
                                    }
                                }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelFormatter={(label) => new Date(label).toDateString()}
                            />
                            <Legend />
                            <Bar
                                dataKey="students"
                                fill="#ffc107"
                                radius={[4, 4, 0, 0]}
                                name="Students Enrolled"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default EnrollmentChart;
