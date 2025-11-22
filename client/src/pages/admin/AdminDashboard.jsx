import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <section className="py-4 py-lg-5">
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-4 p-lg-5">
              <h1 className="fw-bold text-primary mb-3">Admin Dashboard</h1>
              <p className="text-body-secondary mb-4">
                Welcome back! Use the quick links below to manage courses and keep your catalog up to date.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/admin/courses" className="btn btn-primary px-4">
                  Manage Courses
                </Link>
                <Link to="/dashboard" className="btn btn-outline-primary px-4">
                  View Learner Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body p-4">
              <h2 className="h5 fw-semibold text-primary mb-3">Getting started</h2>
              <ul className="text-body-secondary mb-0 d-grid gap-2">
                <li>Review incoming enrollments and ensure seat availability.</li>
                <li>Highlight top-performing courses with updated descriptions.</li>
                <li>Publish new mini-lessons to keep learners engaged.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100 rounded-4">
            <div className="card-body p-4">
              <h2 className="h5 fw-semibold text-primary mb-3">Next actions</h2>
              <ul className="text-body-secondary mb-0 d-grid gap-2">
                <li>Create a new course to expand the catalog.</li>
                <li>Update pricing or categories to reflect new offerings.</li>
                <li>Share dashboards with stakeholders for quick insights.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
