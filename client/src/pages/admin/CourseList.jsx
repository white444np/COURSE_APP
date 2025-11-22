import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { deleteCourse, getCourses } from '../../services/courseService';

const DEFAULT_LIMIT = 10;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [draftFilters, setDraftFilters] = useState({ category: '', search: '' });

  const query = useMemo(() => ({
    page,
    limit: DEFAULT_LIMIT,
    category: filters.category || undefined,
    search: filters.search || undefined,
  }), [page, filters]);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const { courses: results, pagination } = await getCourses(query);
      const requestedPage = query.page || 1;
      if (pagination.pages > 0 && requestedPage > pagination.pages) {
        setPage(pagination.pages);
        return;
      }
      setCourses(results);
      setTotalPages(pagination.pages);
      setTotalResults(pagination.total);
    } catch (error) {
      const message = error.normalized?.message || error.response?.data?.message || 'Failed to load courses.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleApplyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setFilters({
      category: draftFilters.category.trim(),
      search: draftFilters.search.trim(),
    });
  };

  const handleResetFilters = () => {
    setDraftFilters({ category: '', search: '' });
    setFilters({ category: '', search: '' });
    setPage(1);
  };

  const handleDelete = async (courseId) => {
    const confirmed = window.confirm('Are you sure you want to delete this course? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(courseId);
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully.');
      await loadCourses();
    } catch (error) {
      const message = error.normalized?.message || error.response?.data?.message || 'Failed to delete course.';
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <section className="py-4 py-lg-5">
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Courses</h1>
          <p className="text-body-secondary mb-0">Manage the catalog of available courses.</p>
        </div>
        <Button onClick={() => navigate('/admin/courses/new')} className="px-4 py-2">
          Create course
        </Button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={handleApplyFilters}>
            <div className="col-lg-5">
              <label htmlFor="course-search" className="form-label fw-semibold">Search</label>
              <input
                id="course-search"
                type="search"
                className="form-control"
                placeholder="Search by title"
                value={draftFilters.search}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, search: event.target.value }))}
                aria-label="Search courses"
              />
            </div>
            <div className="col-lg-4">
              <label htmlFor="course-category" className="form-label fw-semibold">Category</label>
              <input
                id="course-category"
                type="text"
                className="form-control"
                placeholder="Filter by category"
                value={draftFilters.category}
                onChange={(event) => setDraftFilters((prev) => ({ ...prev, category: event.target.value }))}
                aria-label="Filter by category"
              />
            </div>
            <div className="col-lg-3 d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isLoading} className="w-100">
                Apply
              </Button>
              <Button type="button" variant="ghost" onClick={handleResetFilters} disabled={isLoading} className="w-100">
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0">
          {isLoading ? (
            <div className="d-flex flex-column align-items-center justify-content-center text-center p-5">
              <Spinner size="lg" />
              <p className="text-body-secondary mt-3 mb-0">Loading courses…</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center p-5">
              <p className="text-body-secondary mb-4">No courses found. Try adjusting your filters or create a new course.</p>
              <Button onClick={() => navigate('/admin/courses/new')} className="px-4 py-2">
                Create your first course
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0 course-table">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Created</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id || course.id}>
                      <td data-label="Title" style={{ minWidth: '220px' }}>
                        <span className="fw-semibold text-primary d-block">{course.title}</span>
                        {course.description && (
                          <small className="text-body-secondary d-block mt-1">{course.description}</small>
                        )}
                      </td>
                      <td data-label="Category">{course.category || 'Uncategorized'}</td>
                      <td data-label="Price">{currencyFormatter.format(course.price || 0)}</td>
                      <td data-label="Created">{course.createdAt ? dateFormatter.format(new Date(course.createdAt)) : '—'}</td>
                      <td data-label="Actions" className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Link className="btn btn-outline-primary rounded-pill" to={`/admin/courses/${course._id || course.id}/edit`}>
                            Edit
                          </Link>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => handleDelete(course._id || course.id)}
                            loading={isDeleting === (course._id || course.id)}
                            disabled={isDeleting === (course._id || course.id)}
                            spinnerSize="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {courses.length > 0 && (
        <footer className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4">
          <div className="text-body-secondary d-flex flex-column flex-sm-row gap-2">
            <span>Total courses: <strong>{totalResults}</strong></span>
            <span>Page {page} of {totalPages}</span>
          </div>
          <div className="d-flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setPage((prev) => prev - 1)} disabled={!canGoPrev || isLoading}>
              Previous
            </Button>
            <Button type="button" variant="ghost" onClick={() => setPage((prev) => prev + 1)} disabled={!canGoNext || isLoading}>
              Next
            </Button>
          </div>
        </footer>
      )}
    </section>
  );
}
