
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
}) {
  const id = `field-${name}`;

  const commonProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    autoComplete,
    "aria-required": required,
  };

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      {multiline ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
}
