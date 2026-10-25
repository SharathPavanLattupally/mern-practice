
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  multiline = false,
  rows = 5,
  autoComplete,
  error,
}) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  const commonProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    autoComplete,
    "aria-required": required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      {multiline ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} />
      )}

      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
