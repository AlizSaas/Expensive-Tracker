import { ArrowLeft, Eye, EyeOff, LoaderCircle, Lock, Mail, User, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupStyles } from '../../../data/dummyStyles';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/login');
    } catch (submitError) {
      setError(extractErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>
        <div className={signupStyles.header}>
          <button className={signupStyles.backButton} onClick={() => navigate('/login')} type="button">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className={signupStyles.avatar}>
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className={signupStyles.headerTitle}>Create Account</h1>
          <p className={signupStyles.headerSubtitle}>Start managing your finances in one place.</p>
        </div>

        <div className={signupStyles.formContainer}>
          {error && <p className={signupStyles.apiError}>{error}</p>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className={signupStyles.label} htmlFor="name">
                Full Name
              </label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <User className="h-5 w-5" />
                </span>
                <input
                  className={signupStyles.input}
                  id="name"
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Jane Doe"
                  required
                  value={form.name}
                />
              </div>
            </div>

            <div>
              <label className={signupStyles.label} htmlFor="email">
                Email
              </label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  className={signupStyles.input}
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
              <label className={signupStyles.label} htmlFor="password">
                Password
              </label>
              <div className={signupStyles.inputContainer}>
                <span className={signupStyles.inputIcon}>
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  className={signupStyles.passwordInput}
                  id="password"
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Create a password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                />
                <button className={signupStyles.passwordToggle} onClick={() => setShowPassword((prev) => !prev)} type="button">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button className={signupStyles.button} disabled={loading} type="submit">
              {loading && <LoaderCircle className={signupStyles.spinner} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className={signupStyles.signInContainer}>
            <p className={signupStyles.signInText}>
              Already have an account?{' '}
              <Link className={signupStyles.signInLink} to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
