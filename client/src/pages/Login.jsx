import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login as loginRequest } from '../services/authService';
import Button from '../components/Button';
import FullScreenLoader from '../components/FullScreenLoader';
import { useAuth } from '../context/AuthContext';

export default function Login(){
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const emailValidation = useMemo(() => ({
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Enter a valid email address',
    },
  }), []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const data = await loginRequest(values);
      localStorage.setItem('token', data.token);
      if (data.user) {
        setUser(data.user);
      }
      const displayName = data.user?.name || 'there';
      toast.success(`Welcome back, ${displayName}!`);
      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const message = err.normalized?.message || err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError('root', { message });
      toast.error(message);
    }
  });

  return (
    <>
      {isSubmitting && <FullScreenLoader message="Signing you in…" />}
      <section className="py-4 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4 p-lg-5">
                <h2 className="fw-bold text-primary mb-2">Welcome back</h2>
                <p className="text-body-secondary mb-4">Log in to continue learning.</p>
                <form onSubmit={onSubmit} noValidate className="needs-validation">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      {...register('email', emailValidation)}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                      aria-invalid={Boolean(errors.password)}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>

                  {errors.root && (
                    <div className="alert alert-danger rounded-3" role="alert">
                      {errors.root.message}
                    </div>
                  )}

                  <div className="d-flex justify-content-end mb-3">
                    <Link to="/forgot-password" className="link-primary link-offset-1-hover small text-decoration-none fw-semibold">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-100 py-2" loading={isSubmitting}>
                    Log in
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
