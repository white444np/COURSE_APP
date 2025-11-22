import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

function BillingSummaryRow({ label, value }) {
  return (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      <span className="text-body-secondary">{label}</span>
      <span className="fw-semibold text-body-emphasis text-end" style={{ wordBreak: 'break-word' }}>{value}</span>
    </div>
  );
}

export default function Billing() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const billingData = state && state.billing;

  useEffect(() => {
    if (!billingData) {
      navigate('/', { replace: true });
    }
  }, [billingData, navigate]);

  if (!billingData) {
    return null;
  }

  const { course, order, email } = billingData;
  const courseTitle = course?.title ?? 'Selected course';
  const amountLabel = currencyFormatter.format(order?.amount ?? 0);
  const emailSent = email?.dispatched;

  return (
    <section className="py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-lg-5 d-grid gap-4">
              <div className="d-grid gap-2 text-center">
                <span className="badge rounded-pill text-bg-success-subtle text-success-emphasis px-3 py-2">Payment Confirmed</span>
                <h1 className="h3 fw-bold mb-0">Billing Summary</h1>
                <p className="text-body-secondary mb-0">
                  A receipt has been generated for <strong>{courseTitle}</strong>. {emailSent ? 'A confirmation email has been sent to your inbox.' : 'We will notify you by email once the confirmation is available.'}
                </p>
              </div>

              <div className="bg-body-secondary bg-opacity-25 rounded-4 p-4 d-grid gap-2">
                <BillingSummaryRow label="Course" value={courseTitle} />
                <BillingSummaryRow label="Amount" value={amountLabel} />
                <BillingSummaryRow label="Order ID" value={order?.razorpayOrderId || '—'} />
                <BillingSummaryRow label="Payment ID" value={order?.razorpayPaymentId || '—'} />
                <BillingSummaryRow label="Payment Date" value={order?.paymentVerifiedAt ? new Date(order.paymentVerifiedAt).toLocaleString() : '—'} />
              </div>

              <div className={`alert ${emailSent ? 'alert-success' : 'alert-warning'} mb-0`} role="status">
                {emailSent
                  ? 'Payment confirmation email sent successfully. Please check your inbox.'
                  : 'Payment completed. If you do not receive a confirmation email shortly, please verify your spam folder or contact support.'}
                {email?.error && (
                  <span className="d-block small mt-2">Reason: {email.error}</span>
                )}
              </div>

              <div className="d-grid gap-2">
                <Button type="button" className="py-2" onClick={() => navigate('/dashboard')}>
                  Explore Course
                </Button>
                <Button type="button" variant="ghost" onClick={() => navigate('/')}>Back to Home</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
