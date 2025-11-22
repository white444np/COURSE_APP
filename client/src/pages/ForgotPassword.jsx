import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { forgotPassword as forgotPasswordRequest } from '../services/authService';
import Button from '../components/Button';
import FullScreenLoader from '../components/FullScreenLoader';

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [isSent, setIsSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSent(false);
    setDevResetLink(null);
    try {
      const data = await forgotPasswordRequest(values);
      setIsSent(true);
      const fallbackUrl = data.resetToken && typeof window !== 'undefined'
        ? `${window.location.origin.replace(/\/$/, '')}/reset-password/${data.resetToken}`
        : null;
      setDevResetLink(data.resetUrl || fallbackUrl);
      addToast({
        type: 'success',
        message: 'Password reset instructions are on their way. Check your inbox!',
      });
    } catch (err) {
      const message = err.response?.data?.message || 'We could not process that email. Please try again.';
      setError('root', { message });
      addToast({ type: 'error', message });
    }
  });

  return (
    <>
      {isSubmitting && <FullScreenLoader message="Sending your reset link…" />}
      <section className="py-4 py-lg-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <div className="auth-hero h-100">
              <h1>Reset access in seconds</h1>
              <p>Enter the email associated with your account. We will send a secure link to help you set a new password instantly.</p>
              <ul>
                <li>Instantly generates a one-time secure link</li>
                <li>Link expires after a short window to protect your account</li>
                <li>No changes happen until you confirm your new password</li>
              </ul>
            </div>
          </div>
          <div className="col-lg-6 col-xl-5 ms-auto">
            <div className="card border-0 shadow-lg rounded-4 card--glow">
              <div className="card-body p-4 p-lg-5">
                <h2 className="fw-bold text-primary mb-2">Forgot your password?</h2>
                <p className="text-body-secondary mb-4">No worries — we’ll get you back in.</p>
                <form onSubmit={onSubmit} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address',
                        },
                      })}
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>

                  {errors.root && (
                    <div className="alert alert-danger rounded-3" role="alert">
                      {errors.root.message}
                    </div>
                  )}

                  <Button type="submit" className="w-100 py-2 mt-3" loading={isSubmitting}>
                    Send reset link
                  </Button>
                </form>

                {isSent && (
                  <div className="alert alert-success rounded-3 mt-4" role="status">
                    <h3 className="h6 fw-semibold mb-2">Check your inbox</h3>
                    <p className="mb-2">
                      We just sent a message with next steps. Didn’t receive it? Look in your spam folder or try again in 60 seconds.
                    </p>
                    {devResetLink && (
                      <p className="mb-0">
                        In this preview environment, you can also{' '}
                        <a className="link-primary fw-semibold" href={devResetLink}>open the reset link directly</a>.
                      </p>
                    )}
                  </div>
                )}

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
