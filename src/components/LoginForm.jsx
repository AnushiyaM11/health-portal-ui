import { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Avatar,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import {
    LocalHospital as LocalHospitalIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Lock as LockIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import { login } from '../services/authService';
import { useSnackbar } from 'notistack';

const LoginForm = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        try {
            const data = await login(email, password);
            localStorage.setItem('token', data.access_token);
            enqueueSnackbar("Logged in successfully!", {
                variant: "success",
                autoHideDuration: 1000,
            });
            navigate("/medical-report");
        } catch (err) {
            setError(err?.message || "Login failed");
        }
    };

    return (
        <Container maxWidth={false} disableGutters sx={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor:'rgba(255, 255, 255, 0.9)',
            alignItems: 'center',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            position: 'relative',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(2px)',
            }
        }}>
            <Paper elevation={10} sx={{ 
                p: 4, 
                borderRadius: 4,
                width: '90%',
                maxWidth: 450,
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255, 255, 255, 0.85)'
            }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        width: 64, 
                        height: 64,
                        mb: 2,
                        boxShadow: 3
                    }}>
                        <LocalHospitalIcon fontSize="large" />
                    </Avatar>
                    
                    <Typography variant="h4" fontWeight="600" color="primary">
                        Health Portal
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                        Secure Access to Medical Services
                    </Typography>
                    
                    {error && (
                        <Typography 
                            variant="body2" 
                            color="error" 
                            textAlign="center"
                            sx={{
                                bgcolor: '#ffffff', 
                                color: 'error.main',
                                p: 1,
                                borderRadius: 1,
                                width: '100%'
                            }}
                        >
                            {error}
                        </Typography>
                    )}
                    
                    <form style={{ width: '100%', marginTop: 16 }} onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                            placeholder="Email"
                        />
                        
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Password"
                        />
                        
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            sx={{ 
                                mt: 3, 
                                mb: 2,
                                height: 48,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: 16,
                                '&:hover': {
                                    backgroundColor: 'primary.dark'
                                }
                            }}
                        >
                            Sign In
                        </Button>
                    </form>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginForm;