// src/components/Form/ui/Input.tsx
/**
 * Hybrid Input Component
 * Pure TSX component - uses HTML5 validation
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  
  // Styling
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  
  // Control visibility
  showLabel?: boolean;
}

export default function Input({
  name,
  label,
  required = false,
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium text-text mb-1",
  inputClassName = "w-full px-4 py-3 rounded-lg bg-gray-200 transition-colors",
  showLabel = true,
  ...inputProps
}: InputProps) {
  return (
    <div className={containerClassName}>
      {showLabel && label && (
        <label htmlFor={name} className={labelClassName}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={name}
        name={name}
        className={inputClassName}
        required={required}
        {...inputProps}
      />
    </div>
  );
}