import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { signup as signupRequest } from '../services/authService';
import Button from '../components/Button';
import FullScreenLoader from '../components/FullScreenLoader';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Signup(){
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  });

  const emailValidation = useMemo(() => ({
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Enter a valid email address',
    },
  }), []);

  const passwordValidation = useMemo(() => ({
    required: 'Password is required',
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      message: 'Use at least 8 characters with uppercase, lowercase, number, and special symbol.',
    },
  }), []);

  const passwordValue = watch('password', '');

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return null;

    const checks = [
      passwordValue.length >= 8,
      passwordValue.length >= 12,
      /[A-Z]/.test(passwordValue),
      /[a-z]/.test(passwordValue),
      /\d/.test(passwordValue),
      /[^A-Za-z0-9]/.test(passwordValue),
    ];

    const score = checks.filter(Boolean).length;
    if (score >= 5) {
      return { level: 'strong', label: 'Strong', percent: 100 };
    }
    if (score >= 3) {
      return { level: 'medium', label: 'Medium', percent: 66 };
    }
    return { level: 'weak', label: 'Weak', percent: 33 };
  }, [passwordValue]);

  const strengthVariant = passwordStrength ? {
    strong: 'success',
    medium: 'warning',
    weak: 'danger',
  }[passwordStrength.level] : 'primary';

  const onSubmit = handleSubmit(async (values) => {
    try {
  const data = await signupRequest(values);
      localStorage.setItem('token', data.token);
  await refresh().catch(() => null);
      toast.success(`Welcome to MiniCourse, ${data.user.name}!`, { closeButton: false });
      navigate('/dashboard');
    } catch (err) {
      const message = err.normalized?.message || err.response?.data?.message || 'We couldn’t create your account. Double-check your details and try again.';
      setError('root', { message });
      toast.error(message);
    }
  });

  return (
    <>
      {isSubmitting && <FullScreenLoader message="Creating your account…" />}
      <section className="py-4 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-4 p-lg-5">
                <h2 className="fw-bold text-primary mb-2">Create your account</h2>
                <p className="text-body-secondary mb-4">Sign up to access your mini courses.</p>
                <form onSubmit={onSubmit} noValidate className="needs-validation">
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="name" className="form-label fw-semibold">Name</label>
                      <input
                        id="name"
                        placeholder="Jane Doe"
                        autoComplete="name"
                        className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                        {...register('name', {
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        })}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>

                    <div className="col-12">
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

                    <div className="col-12">
                      <label htmlFor="password" className="form-label fw-semibold">Password</label>
                      <input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                        {...register('password', passwordValidation)}
                        aria-invalid={Boolean(errors.password)}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}

                      {passwordStrength && !errors.password && (
                        <div className="mt-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className={`badge text-bg-${strengthVariant} rounded-pill`}>Strength: {passwordStrength.label}</span>
                            <small className="text-body-secondary">Use a mix of characters for a stronger password.</small>
                          </div>
                          <div
                            className="progress"
                            role="progressbar"
                            aria-valuenow={passwordStrength.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className={`progress-bar bg-${strengthVariant}`}
                              style={{ width: `${passwordStrength.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {errors.root && (
                    <div className="alert alert-danger rounded-3 mt-3" role="alert">
                      {errors.root.message}
                    </div>
                  )}

                  <Button type="submit" className="w-100 py-2 mt-4" loading={isSubmitting}>
                    Create account
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
