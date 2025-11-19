// src/components/Form/ui/Checkbox.tsx
/**
 * Hybrid Checkbox Component
 * Pure TSX component - uses HTML5 validation
 */

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string;
  label: React.ReactNode;
  
  // Styling
  containerClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
}

export default function Checkbox({
  name,
  label,
  required = false,
  containerClassName = "mb-4",
  labelClassName = "flex items-center cursor-pointer",
  checkboxClassName = "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500",
  ...checkboxProps
}: CheckboxProps) {
  return (
    <div className={containerClassName}>
      <label className={labelClassName}>
        <input
          type="checkbox"
          id={name}
          name={name}
          className={checkboxClassName}
          required={required}
          {...checkboxProps}
        />
        <span className="ml-2 text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
    </div>
  );
}