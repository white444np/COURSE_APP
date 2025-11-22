export default function Spinner({ size = 'md', variant = 'primary' }) {
	const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';
	const style = size === 'lg' ? { width: '3rem', height: '3rem' } : undefined;

	return (
		<span
			className={`spinner-border ${sizeClass} text-${variant}`.trim()}
			style={style}
			role="status"
			aria-live="polite"
		>
			<span className="visually-hidden">Loading…</span>
		</span>
	);
}
