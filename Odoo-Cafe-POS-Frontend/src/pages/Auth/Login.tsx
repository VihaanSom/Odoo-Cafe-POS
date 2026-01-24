import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useAuth } from '../../store/auth.store';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await login({ email, password });

            if (response.success) {
                navigate('/dashboard');
            } else {
                setError(response.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <div className="auth-card__header">
                    <motion.div
                        className="auth-card__logo"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                    >
                        <RestaurantIcon sx={{ fontSize: 48, color: 'var(--primary-color)' }} />
                    </motion.div>
                    <h1 className="auth-card__title">Welcome Back</h1>
                    <p className="auth-card__subtitle">Sign in to Odoo Cafe POS</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-form__error">{error}</div>}

                    <div className="auth-form__group">
                        <label htmlFor="email" className="auth-form__label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="auth-form__input"
                            placeholder="you@restaurant.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-form__group">
                        <label htmlFor="password" className="auth-form__label">
                            Password
                        </label>
                        <div className="auth-form__input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                className="auth-form__input auth-form__input--with-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="auth-form__toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`auth-form__submit ${isLoading ? 'auth-form__submit--loading' : ''}`}
                        disabled={isLoading}
                    >
                        Sign In
                    </button>
                </form>

                <div className="auth-card__footer">
                    <p className="auth-card__link">
                        Don't have an account?
                        <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
