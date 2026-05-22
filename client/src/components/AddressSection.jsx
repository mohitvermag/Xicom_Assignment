import FormInput from './FormInput'

function AddressSection(props) {
  const { title, prefix, register, errors, disabled = false, required = true } =
    props

  return (
    <section className="rounded-lg border border-gray-200 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Street 1"
          name={`${prefix}.street1`}
          placeholder="Enter street address"
          register={register}
          error={errors?.street1?.message}
          required={required}
          disabled={disabled}
        />
        <FormInput
          label="Street 2"
          name={`${prefix}.street2`}
          placeholder="Apartment, suite, area"
          register={register}
          error={errors?.street2?.message}
          required={required}
          disabled={disabled}
        />
      </div>
    </section>
  )
}

export default AddressSection
