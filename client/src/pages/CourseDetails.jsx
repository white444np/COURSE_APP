import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCourse } from '../services/courseService';
import { createOrder, verifyPayment } from '../services/orderService';
import Button from '../components/Button';
import FullScreenLoader from '../components/FullScreenLoader';
import { useEnrollment } from '../context/EnrollmentContext';
import { useAuth } from '../context/AuthContext';
import { loadRazorpayScript } from '../utils/razorpay';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

export default function CourseDetails() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const {
    selectedCourse,
    selectCourse,
    clearSelection,
    activeOrder,
    setActiveOrder,
    isProcessing,
    setProcessing,
  } = useEnrollment();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError(null);
    clearSelection();
    try {
      const data = await getCourse(courseId);
      setCourse(data);
    } catch (err) {
      setError(err.normalized?.message || err.response?.data?.message || 'Unable to load course details.');
    } finally {
      setLoading(false);
    }
  }, [clearSelection, courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleEnrollClick = () => {
    if (!user) {
      toast.info('Please log in to enroll in this course.');
      navigate('/login', { replace: true, state: { from: `/courses/${courseId}` } });
      return;
    }
    selectCourse(course);
    setShowCheckout(true);
  };

  const handleConfirmAndPay = async () => {
    if (!course) return;
    try {
      setProcessing(true);
  const response = await createOrder(course._id || course.id);

      const { order, payment } = response;
      setActiveOrder(order);

      if (!payment?.credentials?.keyId || !payment?.order?.id) {
        throw new Error('Payment gateway configuration is incomplete.');
      }

      await loadRazorpayScript();

      if (typeof window === 'undefined' || typeof window.Razorpay === 'undefined') {
        throw new Error('Unable to initialize Razorpay checkout.');
      }

      const razorpayOptions = {
        key: payment.credentials.keyId,
        amount: payment.order.amount,
        currency: payment.order.currency,
        name: 'MiniCourse',
        description: course.title,
        order_id: payment.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        notes: {
          courseId: course._id || course.id,
        },
        theme: {
          color: '#0d6efd',
        },
        handler: async (paymentResponse) => {
          try {
            const verification = await verifyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            clearSelection();
            setActiveOrder(verification.order);
            setShowCheckout(false);
            toast.success('Payment successful!');

            if (verification.email?.dispatched) {
              toast.success('Payment confirmation email sent.');
            } else if (verification.email?.error) {
              toast.warn(`Payment completed, but email could not be sent: ${verification.email.error}`);
            }

            navigate('/billing', {
              state: {
                billing: {
                  order: verification.order,
                  course: verification.course,
                  email: verification.email,
                },
              },
            });
          } catch (verificationError) {
            toast.error(
              verificationError.normalized?.message
              || verificationError.response?.data?.message
              || 'Payment verification failed. Please contact support.',
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment window closed before completion.');
            setProcessing(false);
            setShowCheckout(false);
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);

      razorpay.on('payment.failed', (paymentFailure) => {
        toast.error(paymentFailure.error?.description || 'Payment failed. Please try again.');
        setProcessing(false);
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.normalized?.message || err.response?.data?.message || err.message || 'Payment could not be initiated. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <FullScreenLoader message="Loading course details…" />
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="card border-0 shadow-sm rounded-4 text-center p-5">
          <h1 className="h4 fw-bold mb-3">Course unavailable</h1>
          <p className="text-body-secondary mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} variant="ghost">Go back</Button>
        </div>
      </section>
    );
  }

  if (!course) {
    return null;
  }

  const priceLabel = currencyFormatter.format(course.price ?? 0);

  return (
    <section className="py-4 py-lg-5">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-lg-5 d-grid gap-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <span className="badge rounded-pill text-bg-primary-subtle text-primary-emphasis px-3 py-2">
                  {course.category || 'General'}
                </span>
                <span className="fs-5 fw-semibold text-primary">{priceLabel}</span>
              </div>
              <div className="d-grid gap-2">
                <h1 className="fw-bold mb-0">{course.title}</h1>
                <p className="text-body-secondary mb-0">{course.description}</p>
              </div>
              <div className="card border-0 bg-light-subtle rounded-4 p-3">
                <h2 className="h6 fw-semibold">What you’ll learn</h2>
                <ul className="mb-0 text-body-secondary d-grid gap-2">
                  <li>Structured lessons you can complete in under an hour.</li>
                  <li>Downloadable resources and mini challenges.</li>
                  <li>Lifetime access to refreshed content.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: '100px' }}>
            <div className="card-body p-4 d-grid gap-3">
              <div className="d-grid gap-1">
                <h2 className="h5 fw-semibold mb-0">Enroll in this course</h2>
                <p className="text-body-secondary mb-0">Secure payment processed instantly. Cancel anytime before it starts.</p>
              </div>
              <div className="d-flex justify-content-between align-items-center p-3 bg-primary-subtle rounded-3">
                <span className="fw-semibold">Total</span>
                <span className="fs-5 fw-bold text-primary">{priceLabel}</span>
              </div>
              {!showCheckout ? (
                <Button type="button" onClick={handleEnrollClick} className="w-100 py-2">
                  Enroll Now
                </Button>
              ) : (
                <div className="d-grid gap-3">
                  <div className="bg-body-secondary bg-opacity-25 rounded-3 p-3 d-grid gap-1">
                    <span className="fw-semibold">Checkout summary</span>
                    <div className="d-flex justify-content-between">
                      <span className="text-body-secondary">{selectedCourse?.title}</span>
                      <span className="fw-semibold text-primary">{priceLabel}</span>
                    </div>
                    {activeOrder && (
                      <span className="badge rounded-pill text-bg-success mt-2">Order #{activeOrder.id}</span>
                    )}
                  </div>
                  <Button type="button" onClick={handleConfirmAndPay} className="w-100 py-2" loading={isProcessing}>
                    Confirm &amp; Pay
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { clearSelection(); setShowCheckout(false); }} disabled={isProcessing}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
