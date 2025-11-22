import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { fetchMyOrders } from '../services/orderService';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function OrderCard({ order }) {
  const purchasedAt = order.paymentVerifiedAt || order.createdAt;
  const dateLabel = purchasedAt ? dateFormatter.format(new Date(purchasedAt)) : 'Pending verification';
  const course = order.course || {};

  return (
    <article className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body d-grid gap-2">
        <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
          <h3 className="h5 fw-semibold mb-0">{course.title || 'Course unavailable'}</h3>
          <span className="badge rounded-pill text-bg-primary-subtle text-primary-emphasis px-3 py-2">
            {order.currency} {order.amount.toFixed(2)}
          </span>
        </div>
        <p className="text-body-secondary mb-0">
          {course.description || 'Course details are currently unavailable.'}
        </p>
        <dl className="row mb-0 small text-body-secondary">
          <div className="col-6">
            <dt className="fw-semibold">Purchased</dt>
            <dd className="mb-0">{dateLabel}</dd>
          </div>
          <div className="col-6">
            <dt className="fw-semibold">Category</dt>
            <dd className="mb-0">{course.category || 'General'}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [profileResponse, orderList] = await Promise.all([
          api.get('/auth/me'),
          fetchMyOrders().catch((error) => {
            if (error.response?.status === 401) {
              throw error;
            }
            if (isMounted) {
              setOrdersError(error.response?.data?.message || 'Unable to load your enrollments right now.');
            }
            return [];
          }),
        ]);

        if (!isMounted) {
          return;
        }

        setUser(profileResponse.data);
        if (Array.isArray(orderList)) {
          setOrders(orderList);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        if (isMounted) {
          setOrdersError(error.response?.data?.message || 'Unable to load your dashboard.');
        }
      } finally {
        if (isMounted) {
          setOrdersLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const orderedCourses = useMemo(() => orders.filter((order) => order.course), [orders]);

  return (
    <section className="py-4 py-lg-5">
      <header className="mb-4">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <h1 className="fw-bold mb-0">Dashboard</h1>
          {user && <span className="badge rounded-pill text-bg-primary-subtle text-primary-emphasis px-3 py-2">{user.name}</span>}
        </div>
        <p className="text-body-secondary mb-0">Overview of your account</p>
      </header>

      <div className="row g-4 row-cols-1 row-cols-md-2">
        <div className="col">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body">
              <h3 className="h5 fw-semibold text-primary mb-3">Welcome</h3>
              {user ? (
                <p className="mb-0">Hello, <strong>{user.name}</strong></p>
              ) : (
                <p className="mb-0 text-body-secondary">Loading…</p>
              )}
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body">
              <h3 className="h5 fw-semibold text-primary mb-3">Next steps</h3>
              <ul className="list-unstyled mb-0 text-body-secondary d-grid gap-2">
                <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill text-bg-primary-subtle">1</span> Browse available courses</li>
                <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill text-bg-primary-subtle">2</span> Continue your last lesson</li>
                <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill text-bg-primary-subtle">3</span> Invite a friend</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-5">
        <header className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1">My Courses</h2>
            <p className="text-body-secondary mb-0">All courses you have enrolled in, sorted by your most recent purchases.</p>
          </div>
        </header>

        {ordersLoading ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body py-5 text-center text-body-secondary">Loading your courses…</div>
          </div>
        ) : ordersError ? (
          <div className="alert alert-warning" role="alert">
            {ordersError}
          </div>
        ) : orderedCourses.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body py-5 text-center">
              <h3 className="h5 fw-semibold mb-2">No courses yet</h3>
              <p className="text-body-secondary mb-3">Ready to learn something new? Head over to the courses catalog and pick your next lesson.</p>
              <button
                className="btn btn-primary px-4"
                type="button"
                onClick={() => navigate('/')}
              >
                Browse courses
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-3">
            {orders.map((order) => (
              <div className="col" key={order.id}>
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
