import Spinner from './Spinner';

export default function FullScreenLoader({ message = 'Preparing your experience…' }) {
  return (
    <div className="loader-overlay" role="status" aria-live="polite">
      <div className="loader-card">
        <Spinner size="lg" variant="primary" />
        <div className="loader-text">
          <h2>Just a moment</h2>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
