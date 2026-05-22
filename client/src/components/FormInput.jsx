function FormInput(props) {
  const {
    label,
    name,
    type = 'text',
    placeholder,
    register,
    error,
    required = false,
    disabled = false,
    ...rest
  } = props

  const errorId = `${name}-error`
  let inputClassName =
    'mt-2 w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2'

  if (error) {
    inputClassName += ' border-red-500 focus:border-red-500 focus:ring-red-100'
  } else {
    inputClassName += ' border-gray-300 focus:border-gray-400 focus:ring-gray-100'
  }

  if (disabled) {
    inputClassName += ' cursor-not-allowed bg-gray-100 text-gray-500'
  } else {
    inputClassName += ' bg-white'
  }

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-red-600">
            {' '}
            *
          </span>
        ) : null}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={inputClassName}
        {...register(name)}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default FormInput
