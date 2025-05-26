import { useState } from 'react';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Avatar,
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { login } from '../services/authService';
import { useSnackbar } from 'notistack';


const LoginForm = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    // validating email 
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Submit the email & pass
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
            enqueueSnackbar("Form data added successfully!", {
                variant: "success",
                autoHideDuration: 1000, // 1 second 
            });
            navigate("/medical-report");
        } catch (err) {
            setError(err?.message || "Login failed");
        }
    };

    return (
        <Container maxWidth="xs"
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#f5f9fc',
                p: 2,
            }}
        >
            <Paper elevation={6} sx={{ p: 4, mt: 8, borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 56, height: 56 }}>
                        <LocalHospitalIcon fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                        Health Portal Login
                    </Typography>
                    {error && (
                        <Typography variant="body2" color="error" textAlign="center">
                            {error}
                        </Typography>
                    )}
                    <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            sx={{ mt: 2, backgroundColor: '#1976d2' }}
                        >
                            Login
                        </Button>
                    </form>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginForm;
