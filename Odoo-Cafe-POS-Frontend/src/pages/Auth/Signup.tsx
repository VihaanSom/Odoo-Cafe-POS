import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useAuth } from '../../store/auth.store';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [restaurantName, setRestaurantName] = useState('');
    const [fullName, setFullName] = useState('');
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
            const response = await signup({
                restaurantName,
                fullName,
                email,
                password,
            });

            if (response.success) {
                navigate('/dashboard');
            } else {
                setError(response.error || 'Signup failed. Please try again.');
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
                    <h1 className="auth-card__title">Create Account</h1>
                    <p className="auth-card__subtitle">Join Odoo Cafe POS</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-form__error">{error}</div>}

                    <div className="auth-form__group">
                        <label htmlFor="restaurantName" className="auth-form__label">
                            Restaurant Name
                        </label>
                        <input
                            type="text"
                            id="restaurantName"
                            className="auth-form__input"
                            placeholder="My Restaurant"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form__group">
                        <label htmlFor="fullName" className="auth-form__label">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            className="auth-form__input"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

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
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                autoComplete="new-password"
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
                        Create Account
                    </button>
                </form>

                <div className="auth-card__footer">
                    <p className="auth-card__link">
                        Already have an account?
                        <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
