export default function CourseSkeleton() {
  return (
    <div className="card border-0 shadow-sm h-100 rounded-4">
      <div className="card-body p-4 d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <span className="skeleton-pill" style={{ width: '120px', height: '28px' }} />
          <span className="skeleton-line" style={{ width: '60px', height: '24px' }} />
        </div>
        <div className="d-flex flex-column gap-2 flex-grow-1">
          <span className="skeleton-line" style={{ width: '80%', height: '22px' }} />
          <span className="skeleton-line" style={{ width: '100%', height: '16px' }} />
          <span className="skeleton-line" style={{ width: '95%', height: '16px' }} />
        </div>
        <div className="d-flex justify-content-between align-items-center pt-2">
          <span className="skeleton-line" style={{ width: '120px', height: '18px' }} />
          <span className="skeleton-line" style={{ width: '80px', height: '18px' }} />
        </div>
      </div>
    </div>
  );
}
