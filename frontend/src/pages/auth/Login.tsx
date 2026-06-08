import { CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginStyles } from '../../../data/dummyStyles';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={loginStyles.pageContainer}>
      <div className={loginStyles.cardContainer}>
        <div className={loginStyles.header}>
          <div className={loginStyles.avatar}>
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className={loginStyles.headerTitle}>Welcome Back</h1>
          <p className={loginStyles.headerSubtitle}>Track every dollar with confidence.</p>
        </div>

        <div className={loginStyles.formContainer}>
          {error && (
            <div className={loginStyles.errorContainer}>
              <div className={loginStyles.errorIcon}>
                <CircleAlert className="h-4 w-4 text-red-600" />
              </div>
              <p className={loginStyles.errorText}>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className={loginStyles.label} htmlFor="email">
                Email
              </label>
              <div className={loginStyles.inputContainer}>
                <span className={loginStyles.inputIcon}>
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  className={loginStyles.input}
                  id="email"
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={form.email}
                />
              </div>
            </div>

            <div>
              <label className={loginStyles.label} htmlFor="password">
                Password
              </label>
              <div className={loginStyles.inputContainer}>
                <span className={loginStyles.inputIcon}>
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  className={loginStyles.passwordInput}
                  id="password"
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                />
                <button className={loginStyles.passwordToggle} onClick={() => setShowPassword((prev) => !prev)} type="button">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button className={loginStyles.button} disabled={loading} type="submit">
              {loading && <LoaderCircle className={loginStyles.spinner} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className={loginStyles.signUpContainer}>
            <p className={loginStyles.signUpText}>
              Need an account?{' '}
              <Link className={loginStyles.signUpLink} to="/signup">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
