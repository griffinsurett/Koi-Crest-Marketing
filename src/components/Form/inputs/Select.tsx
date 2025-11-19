// src/components/Form/ui/Select.tsx
/**
 * Hybrid Select Component
 * Pure TSX component - uses HTML5 validation
 */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  
  // Styling
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  
  // Control
  showLabel?: boolean;
}

export default function Select({
  name,
  label,
  required = false,
  options,
  placeholder = "Select an option",
  containerClassName = "mb-4",
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
  selectClassName = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors",
  showLabel = true,
  ...selectProps
}: SelectProps) {
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

      <select
        id={name}
        name={name}
        className={selectClassName}
        required={required}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}