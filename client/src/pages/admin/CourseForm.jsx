import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../components/Button';
import FullScreenLoader from '../../components/FullScreenLoader';
import { createCourse, getCourse, updateCourse } from '../../services/courseService';

const priceValidation = {
  required: 'Price is required',
  validate: (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return 'Price must be a number';
    }
    if (numeric < 0) {
      return 'Price cannot be negative';
    }
    return true;
  },
};

export default function CourseForm() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(isEdit);
  const [initialFetchError, setInitialFetchError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!isEdit) return;

    setIsLoading(true);
    getCourse(courseId)
      .then((course) => {
        const priceValue = typeof course.price === 'number' ? course.price.toString() : '';
        reset({
          title: course.title || '',
          description: course.description || '',
          category: course.category || '',
          price: priceValue,
        });
      })
      .catch((error) => {
        const message = error.normalized?.message || error.response?.data?.message || 'Unable to load course';
        setInitialFetchError(message);
        toast.error(message);
      })
      .finally(() => setIsLoading(false));
  }, [courseId, isEdit, reset]);

  const pageTitle = useMemo(() => (isEdit ? 'Edit course' : 'Create course'), [isEdit]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      price: Number(values.price),
    };

    try {
      if (isEdit) {
        await updateCourse(courseId, payload);
        toast.success('Course updated successfully.');
      } else {
        await createCourse(payload);
        toast.success('Course created successfully.');
      }
      navigate('/admin/courses');
    } catch (error) {
      const message = error.normalized?.message || error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    }
  });

  if (isLoading) {
    return <FullScreenLoader message="Loading course details…" />;
  }

  if (initialFetchError) {
    return (
      <section className="py-4 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7">
            <div className="card border-0 shadow-lg rounded-4">
              <div className="card-body p-4 p-lg-5 text-center">
                <h1 className="fw-bold text-primary mb-3">Course not available</h1>
                <p className="text-body-secondary mb-4">{initialFetchError}</p>
                <Button onClick={() => navigate('/admin/courses')} variant="primary" className="px-4 py-2">
                  Back to courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-xl-7 col-lg-8">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-4 p-lg-5">
              <header className="mb-4">
                <h1 className="fw-bold text-primary mb-2">{pageTitle}</h1>
                <p className="text-body-secondary mb-0">{isEdit ? 'Update course details and publish changes.' : 'Fill in the details to add a new course to the catalog.'}</p>
              </header>
              <form className="needs-validation" onSubmit={onSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="title" className="form-label fw-semibold">Title</label>
                    <input
                      id="title"
                      placeholder="Full-stack JavaScript"
                      className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
                      {...register('title', {
                        required: 'Title is required',
                        minLength: { value: 3, message: 'Title must be at least 3 characters' },
                        maxLength: { value: 120, message: 'Title must be at most 120 characters' },
                      })}
                      aria-invalid={Boolean(errors.title)}
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="description" className="form-label fw-semibold">Description</label>
                    <textarea
                      id="description"
                      rows={4}
                      placeholder="Describe the course content and outcomes."
                      className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                      {...register('description', {
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Description must be at least 20 characters' },
                      })}
                      aria-invalid={Boolean(errors.description)}
                    />
                    {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label fw-semibold">Category</label>
                    <input
                      id="category"
                      placeholder="Development"
                      className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                      {...register('category', {
                        required: 'Category is required',
                      })}
                      aria-invalid={Boolean(errors.category)}
                    />
                    {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="price" className="form-label fw-semibold">Price</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="99.00"
                        className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        {...register('price', priceValidation)}
                        aria-invalid={Boolean(errors.price)}
                      />
                    </div>
                    {errors.price && <div className="invalid-feedback d-block">{errors.price.message}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Link to="/admin/courses" className="btn btn-outline-primary rounded-pill">
                    Cancel
                  </Link>
                  <Button type="submit" loading={isSubmitting} className="px-4">
                    {isEdit ? 'Save changes' : 'Create course'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
