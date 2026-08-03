import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RevenueChart = ({ data = [] }) => {
    return (
        <Card sx={{ 
            height: '100%', 
            bgcolor: 'var(--color-vc-canvas)',
            border: '1px solid var(--color-vc-hairline)',
            borderRadius: '8px',
            boxShadow: '0px 1px 1px rgba(0,0,0,0.02)',
        }}>
            <CardContent sx={{ p: '24px !important' }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', mb: 2 }}>
                    Revenue Growth
                </Typography>

                {data.length === 0 ? (
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '14px', fontFamily: 'inherit' }}>No revenue data for this range</Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-vc-hairline)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: 'var(--color-vc-mute)', fontFamily: 'inherit' }}
                                axisLine={{ stroke: 'var(--color-vc-hairline)' }}
                                tickLine={{ stroke: 'var(--color-vc-hairline)' }}
                                tickFormatter={(str) => {
                                    try {
                                        return new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    } catch (e) {
                                        return str;
                                    }
                                }}
                            />
                            <YAxis 
                                tick={{ fontSize: 11, fill: 'var(--color-vc-mute)', fontFamily: 'inherit' }}
                                axisLine={{ stroke: 'var(--color-vc-hairline)' }}
                                tickLine={{ stroke: 'var(--color-vc-hairline)' }}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: 'var(--color-vc-canvas)', 
                                    border: '1px solid var(--color-vc-hairline)', 
                                    borderRadius: '4px',
                                    boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                                    fontFamily: 'inherit',
                                    fontSize: '12px',
                                    color: 'var(--color-vc-ink)'
                                }}
                                labelFormatter={(label) => new Date(label).toDateString()}
                            />
                            <Legend wrapperStyle={{ fontFamily: 'inherit', fontSize: '12px', color: 'var(--color-vc-body)' }} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="var(--color-vc-link)"
                                strokeWidth={2.5}
                                dot={{ fill: 'var(--color-vc-link)', r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 0 }}
                                name="Revenue (₹)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default RevenueChart;
