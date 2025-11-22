import { Link } from 'react-router-dom';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export default function CourseCard({ course }) {
  const id = course._id || course.id;
  const price = currencyFormatter.format(course.price ?? 0);
  const createdLabel = course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '—';

  return (
    <div className="card border-0 shadow-sm h-100 rounded-4">
      <div className="card-body p-4 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <span className="badge rounded-pill text-bg-primary-subtle text-primary-emphasis px-3 py-2">
            {course.category || 'General'}
          </span>
          <span className="fw-semibold text-primary">{price}</span>
        </div>
        <div className="d-flex flex-column gap-2 flex-grow-1">
          <h3 className="h5 fw-bold mb-0 text-truncate" title={course.title}>{course.title}</h3>
          {course.description && (
            <p className="text-body-secondary mb-0 line-clamp-3">{course.description}</p>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <Link className="link-primary fw-semibold text-decoration-none" to={`/courses/${id}`}>
            View details
          </Link>
          <span className="text-body-secondary small">{createdLabel}</span>
        </div>
      </div>
    </div>
  );
}
