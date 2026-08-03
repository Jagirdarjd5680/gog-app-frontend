import React from 'react';
import { Grid, TextField, Box, FormControlLabel, Switch, MenuItem, Alert } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';

const BasicDetails = ({ 
    values, errors, touched, handleChange, handleBlur, 
    user, autoGenPassword, setAutoGenPassword 
}) => {
    const fieldStyles = {
        '& .MuiInputBase-root': {
            borderRadius: '6px',
            color: 'var(--color-vc-ink)',
            bgcolor: 'var(--color-vc-canvas)',
            fontSize: '13px',
            fontFamily: 'inherit',
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
        },
        '& .MuiFormHelperText-root': {
            fontFamily: 'inherit',
            fontSize: '11px',
            color: 'var(--color-vc-mute)'
        }
    };

    const menuStyles = {
        PaperProps: {
            sx: {
                bgcolor: 'var(--color-vc-canvas)',
                color: 'var(--color-vc-ink)',
                border: '1px solid var(--color-vc-hairline)',
                borderRadius: '6px',
                boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    py: 1,
                    '&:hover': {
                        bgcolor: 'var(--color-vc-canvas-soft)'
                    }
                }
            }
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth label="Full Name" name="name"
                    value={values.name} onChange={handleChange} onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    sx={fieldStyles}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                {user?.rollNumber ? (
                    <TextField
                        fullWidth label="Roll Number" value={user.rollNumber}
                        sx={fieldStyles}
                        InputProps={{ readOnly: true }} variant="filled" helperText="Auto-generated ID"
                    />
                ) : (
                    <TextField
                        fullWidth label="Phone Number" name="phone"
                        value={values.phone} onChange={handleChange} onBlur={handleBlur}
                        sx={fieldStyles}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth label="Email Address" name="email" type="email"
                    value={values.email} onChange={handleChange} onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    sx={fieldStyles}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                {!user && (
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={autoGenPassword} 
                                    onChange={(e) => setAutoGenPassword(e.target.checked)} 
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: 'var(--color-vc-primary)',
                                            '& + .MuiSwitch-track': {
                                                bgcolor: 'var(--color-vc-primary)'
                                            }
                                        }
                                    }}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '13px', fontFamily: 'inherit', color: 'var(--color-vc-body)' }}>
                                    <AutoAwesomeIcon sx={{ fontSize: 14, color: 'var(--color-vc-mute)' }} />
                                    <span>Auto-generate password & email</span>
                                </Box>
                            }
                            sx={{ mt: 1.5 }}
                        />
                        {!autoGenPassword && (
                            <TextField
                                fullWidth label="Account Password" name="password" type="password"
                                value={values.password} onChange={handleChange} onBlur={handleBlur}
                                sx={fieldStyles}
                                required placeholder="Min 6 characters"
                            />
                        )}
                        {autoGenPassword && (
                            <Alert 
                                icon={<EmailIcon sx={{ color: 'var(--color-vc-link)' }} />} 
                                sx={{ 
                                    mt: 1.5, 
                                    borderRadius: '6px',
                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                    border: '1px solid var(--color-vc-hairline)',
                                    color: 'var(--color-vc-body)',
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    '& .MuiAlert-message': { fontFamily: 'inherit' }
                                }}
                            >
                                A secure password will be auto-generated and emailed.
                            </Alert>
                        )}
                    </Box>
                )}
                {user?.rollNumber && (
                    <TextField
                        fullWidth label="Phone Number" name="phone"
                        value={values.phone} onChange={handleChange} onBlur={handleBlur}
                        sx={fieldStyles}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth select label="User Role" name="role"
                    value={values.role} onChange={handleChange} onBlur={handleBlur}
                    error={touched.role && Boolean(errors.role)}
                    helperText={touched.role && errors.role}
                    sx={fieldStyles}
                    SelectProps={{ MenuProps: menuStyles }}
                >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth select label="Signup Source" name="source"
                    value={values.source} onChange={handleChange}
                    sx={fieldStyles}
                    SelectProps={{ MenuProps: menuStyles }}
                >
                    <MenuItem value="web">Web Portal</MenuItem>
                    <MenuItem value="android">Android App</MenuItem>
                    <MenuItem value="mobile">Mobile App</MenuItem>
                </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth select label="Auth Method" name="authMethod"
                    value={values.authMethod} onChange={handleChange}
                    sx={fieldStyles}
                    SelectProps={{ MenuProps: menuStyles }}
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
