import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { resetPassword as resetPasswordRequest } from '../services/authService';
import Button from '../components/Button';
import FullScreenLoader from '../components/FullScreenLoader';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const passwordRules = useMemo(() => ({
    required: 'Password is required',
    minLength: { value: 6, message: 'Use at least 6 characters' },
  }), []);

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      const data = await resetPasswordRequest({ token, password });
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      addToast({ type: 'success', message: 'Your password has been reset. You can now sign in.' });
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Reset link is invalid or has expired.';
      setError('root', { message });
      addToast({ type: 'error', message });
    }
  });

  return (
    <>
      {isSubmitting && <FullScreenLoader message="Updating your password…" />}
      <section className="py-4 py-lg-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="auth-hero h-100">
              <h1>Create a new password</h1>
              <p>Choose a fresh password that is unique to MiniCourse. Tips for a strong password:</p>
              <ul>
                <li>Use a mix of uppercase, lowercase, numbers, and symbols.</li>
                <li>Avoid reused passwords from other sites.</li>
                <li>Keep it private — never share reset links.</li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6 col-xl-5 ms-auto">
            <div className="card border-0 shadow-lg rounded-4 card--glow">
              <div className="card-body p-4 p-lg-5">
                <h2 className="fw-bold text-primary mb-2">Set your new password</h2>
                <p className="text-body-secondary mb-4">We’ll update your credentials securely.</p>
                <form onSubmit={onSubmit} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                    <input
                      id="password"
                      type="password"
                      placeholder="New password"
                      autoComplete="new-password"
                      className={`form-control form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                      {...register('password', passwordRules)}
                      aria-invalid={Boolean(errors.password)}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className={`form-control form-control-lg ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === watch('password') || 'Passwords do not match',
                      })}
                      aria-invalid={Boolean(errors.confirmPassword)}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                  </div>

                  {errors.root && (
                    <div className="alert alert-danger rounded-3" role="alert">
                      {errors.root.message}
                    </div>
                  )}

                  <Button type="submit" className="w-100 py-2 mt-3" loading={isSubmitting}>
                    Update password
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <Link to="/login" className="link-primary link-offset-1-hover fw-semibold text-decoration-none">Return to login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
