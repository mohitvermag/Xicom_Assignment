import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import AddressSection from '../components/AddressSection'
import DocumentUploadSection from '../components/DocumentUploadSection'
import FormInput from '../components/FormInput'
import SubmitButton from '../components/SubmitButton'
import { candidateSchema } from '../validation/candidateSchema'

const defaultFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  sameAsResidential: false,
  residentialAddress: {
    street1: '',
    street2: '',
  },
  permanentAddress: {
    street1: '',
    street2: '',
  },
  documents: [
    {
      fileName: '',
      fileType: 'image',
      file: null,
    },
  ],
}

function formatDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getMaxBirthDate() {
  const today = new Date()
  today.setFullYear(today.getFullYear() - 18)
  return formatDateValue(today)
}

function buildCandidateFormData(data) {
  const formData = new FormData()
  const permanentAddress = data.sameAsResidential
    ? data.residentialAddress
    : data.permanentAddress

  formData.append('firstName', data.firstName)
  formData.append('lastName', data.lastName)
  formData.append('email', data.email)
  formData.append('dob', data.dateOfBirth)
  formData.append('sameAsResidential', String(data.sameAsResidential))
  formData.append('residentialAddress', JSON.stringify(data.residentialAddress))
  formData.append('permanentAddress', JSON.stringify(permanentAddress))
  formData.append(
    'documents',
    JSON.stringify(
      data.documents.map((document) => ({
        fileName: document.fileName,
        fileType: document.fileType,
      })),
    ),
  )

  data.documents.forEach((document, index) => {
    const selectedFile = document.file?.[0]

    if (selectedFile) {
      formData.append(`documents.${index}.file`, selectedFile)
    }
  })

  return formData
}

function CandidateForm() {
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitError, setSubmitError] = useState('')

  const form = useForm({
    resolver: zodResolver(candidateSchema),
    defaultValues: defaultFormValues,
  })

  const register = form.register
  const handleSubmit = form.handleSubmit
  const control = form.control
  const setValue = form.setValue
  const reset = form.reset
  const clearErrors = form.clearErrors
  const errors = form.formState.errors

  const sameAsResidential = useWatch({
    control,
    name: 'sameAsResidential',
  })
  const residentialStreet1 = useWatch({
    control,
    name: 'residentialAddress.street1',
  })
  const residentialStreet2 = useWatch({
    control,
    name: 'residentialAddress.street2',
  })

  useEffect(() => {
    if (sameAsResidential) {
      setValue('permanentAddress.street1', residentialStreet1)
      setValue('permanentAddress.street2', residentialStreet2)
      clearErrors(['permanentAddress.street1', 'permanentAddress.street2'])
    }
  }, [
    sameAsResidential,
    residentialStreet1,
    residentialStreet2,
    setValue,
    clearErrors,
  ])

  const onSubmit = async (data) => {
    setIsSubmittingForm(true)
    setSubmitMessage('')
    setSubmitError('')

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        body: buildCandidateFormData(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setSubmitError(result.message || 'Unable to submit the form right now.')
        return
      }

      setSubmitMessage(result.message || 'Candidate submitted successfully.')
      reset(defaultFormValues)
    } catch {
      setSubmitError('Unable to connect to the server. Please try again.')
    } finally {
      setIsSubmittingForm(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-sm font-medium text-gray-500">
            Candidate Document Submission
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">
            Candidate Document Submission Form
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill in the candidate details and upload the required documents.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            {submitMessage ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {submitMessage}
              </div>
            ) : null}

            <section className="rounded-lg border border-gray-200 p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="First Name"
                  name="firstName"
                  placeholder="Enter first name"
                  register={register}
                  error={errors.firstName?.message}
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter last name"
                  register={register}
                  error={errors.lastName?.message}
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  register={register}
                  error={errors.email?.message}
                />
                <FormInput
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  register={register}
                  error={errors.dateOfBirth?.message}
                  max={getMaxBirthDate()}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Address Details
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Provide both residential and permanent addresses.
                </p>
              </div>

              <AddressSection
                title="Residential Address"
                prefix="residentialAddress"
                register={register}
                errors={errors.residentialAddress}
              />

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <label className="flex items-start gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900"
                    {...register('sameAsResidential')}
                  />
                  <span>
                    <span className="font-medium text-gray-800">
                      Same as Residential Address
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      When checked, permanent address fields are disabled and
                      use the residential address.
                    </span>
                  </span>
                </label>
              </div>

              <AddressSection
                title="Permanent Address"
                prefix="permanentAddress"
                register={register}
                errors={errors.permanentAddress}
                disabled={sameAsResidential}
              />
            </section>

            <DocumentUploadSection
              control={control}
              register={register}
              errors={errors}
            />

            <div className="border-t border-gray-200 pt-6">
              <SubmitButton loading={isSubmittingForm} />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CandidateForm
