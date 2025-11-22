import Spinner from './Spinner';

const baseClasses = 'btn d-inline-flex align-items-center justify-content-center gap-2 fw-semibold rounded-pill';

const variantClasses = {
	primary: 'btn-primary shadow-sm',
	ghost: 'btn-outline-primary',
	danger: 'btn-outline-danger',
};

export default function Button({
	type = 'button',
	variant = 'primary',
	loading = false,
	disabled,
	children,
	className = '',
	spinnerVariant,
	spinnerSize = 'sm',
	...rest
}) {
	const classes = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`.trim();

	const resolvedSpinnerVariant = spinnerVariant
		|| (variant === 'primary' ? 'light' : variant === 'danger' ? 'danger' : 'primary');

	return (
		<button
			type={type}
			className={classes}
			disabled={disabled || loading}
			{...rest}
		>
			{loading && (
				<Spinner
					size={spinnerSize}
					variant={resolvedSpinnerVariant}
				/>
			)}
			<span className={loading ? 'btn__label is-loading' : 'btn__label'}>{children}</span>
		</button>
	);
}
