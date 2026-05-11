import React from 'react';
import { Grid, TextField, Box, FormControlLabel, Switch, MenuItem, Alert, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';

const BasicDetails = ({ 
    values, errors, touched, handleChange, handleBlur, 
    user, autoGenPassword, setAutoGenPassword 
}) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth label="Full Name" name="name"
                    value={values.name} onChange={handleChange} onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                {user?.rollNumber ? (
                    <TextField
                        fullWidth label="Roll Number" value={user.rollNumber}
                        margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        InputProps={{ readOnly: true }} variant="filled" helperText="Auto-generated ID"
                    />
                ) : (
                    <TextField
                        fullWidth label="Phone Number" name="phone"
                        value={values.phone} onChange={handleChange} onBlur={handleBlur}
                        margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth label="Email Address" name="email" type="email"
                    value={values.email} onChange={handleChange} onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                {!user && (
                    <Box>
                        <FormControlLabel
                            control={<Switch checked={autoGenPassword} onChange={(e) => setAutoGenPassword(e.target.checked)} color="secondary" />}
                            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><AutoAwesomeIcon sx={{ fontSize: 16, color: 'secondary.main' }} /><span>Auto-generate password & email</span></Box>}
                            sx={{ mt: 1 }}
                        />
                        {!autoGenPassword && (
                            <TextField
                                fullWidth label="Account Password" name="password" type="password"
                                value={values.password} onChange={handleChange} onBlur={handleBlur}
                                margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                required placeholder="Min 6 characters"
                            />
                        )}
                        {autoGenPassword && (
                            <Alert icon={<EmailIcon />} severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                                A secure password will be auto-generated and emailed.
                            </Alert>
                        )}
                    </Box>
                )}
                {user?.rollNumber && (
                    <TextField
                        fullWidth label="Phone Number" name="phone"
                        value={values.phone} onChange={handleChange} onBlur={handleBlur}
                        margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth select label="User Role" name="role"
                    value={values.role} onChange={handleChange} onBlur={handleBlur}
                    error={touched.role && Boolean(errors.role)}
                    helperText={touched.role && errors.role}
                    margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth select label="Signup Source" name="source"
                    value={values.source} onChange={handleChange} margin="normal"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                    <MenuItem value="web">Web Portal</MenuItem>
                    <MenuItem value="android">Android App</MenuItem>
                    <MenuItem value="mobile">Mobile App</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth select label="Auth Method" name="authMethod"
                    value={values.authMethod} onChange={handleChange} margin="normal"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                    <MenuItem value="email">Email/Password</MenuItem>
                    <MenuItem value="google">Google Login</MenuItem>
                    <MenuItem value="phone">Phone/OTP</MenuItem>
                    <MenuItem value="mobile">Mobile (Legacy)</MenuItem>
                </TextField>
            </Grid>
        </Grid>
    );
};

export default BasicDetails;
