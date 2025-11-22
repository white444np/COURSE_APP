import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CourseCard from '../components/CourseCard';
import CourseSkeleton from '../components/CourseSkeleton';
import Button from '../components/Button';
import { getCourses } from '../services/courseService';
import { useToast } from '../context/ToastContext';

const filterSchema = yup.object({
  search: yup.string().max(120, 'Search term is too long').optional(),
  category: yup.string().max(60, 'Category is too long').optional(),
});

const SKELETON_COUNT = 6;

export default function Home() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const initialValues = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  }), [searchParams]);

  const currentPage = useMemo(() => {
    const pageFromParams = Number(searchParams.get('page'));
    return Number.isNaN(pageFromParams) || pageFromParams < 1 ? 1 : pageFromParams;
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(filterSchema),
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { courses: results, pagination: meta } = await getCourses({
        page: currentPage,
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
      });
      setCourses(results);
      setPagination(meta);
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Failed to load courses.' });
    } finally {
      setLoading(false);
    }
  }, [addToast, currentPage, searchParams]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onSubmit = handleSubmit((values) => {
    const nextParams = {};
    if (values.search?.trim()) {
      nextParams.search = values.search.trim();
    }
    if (values.category?.trim()) {
      nextParams.category = values.category.trim();
    }
    nextParams.page = 1;
    setSearchParams(nextParams, { replace: true });
  });

  const handleReset = () => {
    reset({ search: '', category: '' });
    setSearchParams({}, { replace: true });
  };

  const handlePageChange = (page) => {
    const targetPage = Math.max(1, Math.min(page, pagination.pages || 1));
    setSearchParams((current) => {
      const entries = Object.fromEntries(current.entries());
      if (entries.search?.trim()) {
        entries.search = entries.search.trim();
      } else {
        delete entries.search;
      }
      if (entries.category?.trim()) {
        entries.category = entries.category.trim();
      } else {
        delete entries.category;
      }
      entries.page = targetPage;
      return entries;
    });
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < (pagination.pages || 1);

  return (
    <section className="py-4 py-lg-5">
      <div className="row align-items-center g-4 mb-4">
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-2">
            <span className="badge rounded-pill text-bg-primary-subtle text-primary-emphasis w-fit-content">Discover</span>
            <h1 className="fw-bold mb-0">Explore bite-sized learning experiences</h1>
            <p className="text-body-secondary mb-0">Browse curated mini courses tailored for fast-paced learners. Filter by category or search by title to find your next skill boost.</p>
          </div>
        </div>
        <div className="col-lg-5">
          <form className="card border-0 shadow-sm rounded-4" onSubmit={onSubmit} noValidate>
            <div className="card-body p-4 d-grid gap-3">
              <div>
                <label htmlFor="search" className="form-label fw-semibold">Search courses</label>
                <input
                  id="search"
                  type="search"
                  placeholder="Search by title"
                  className={`form-control ${errors.search ? 'is-invalid' : ''}`}
                  {...register('search')}
                />
                {errors.search && <div className="invalid-feedback">{errors.search.message}</div>}
              </div>
              <div>
                <label htmlFor="category" className="form-label fw-semibold">Category</label>
                <input
                  id="category"
                  type="text"
                  placeholder="e.g. Design, Development"
                  className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                  {...register('category')}
                />
                {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Button type="submit" className="px-4" loading={loading}>
                  Apply filters
                </Button>
                <Button type="button" variant="ghost" onClick={handleReset} disabled={loading}>
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="h4 fw-semibold mb-0">Available courses</h2>
        <span className="text-body-secondary small">{pagination.total} results</span>
      </div>

      <div className="row g-4">
        {loading
          ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <div key={index} className="col-12 col-sm-6 col-lg-4">
              <CourseSkeleton />
            </div>
          ))
          : courses.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 text-center p-5">
                <p className="text-body-secondary mb-1">No courses match your filters yet.</p>
                <p className="text-body-secondary">Try adjusting your search or explore other categories.</p>
              </div>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course._id || course.id} className="col-12 col-sm-6 col-lg-4">
                <CourseCard course={course} />
              </div>
            ))
          )}
      </div>

      {pagination.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
          <span className="text-body-secondary small">Page {currentPage} of {pagination.pages}</span>
          <div className="d-flex gap-2">
            <Button type="button" variant="ghost" onClick={() => handlePageChange(currentPage - 1)} disabled={!canGoPrev || loading}>
              Previous
            </Button>
            <Button type="button" variant="ghost" onClick={() => handlePageChange(currentPage + 1)} disabled={!canGoNext || loading}>
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
