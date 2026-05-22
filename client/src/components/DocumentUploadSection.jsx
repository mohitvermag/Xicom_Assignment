import { useFieldArray, useWatch } from 'react-hook-form'
import { FaPlus, FaTrash } from 'react-icons/fa'

function getAcceptValue(fileType) {
  if (fileType === 'pdf') {
    return '.pdf'
  }

  return '.jpg,.jpeg,.png'
}

function getFileHelpText(fileType) {
  if (fileType === 'pdf') {
    return 'Allowed file: PDF'
  }

  return 'Allowed files: JPG, JPEG, PNG'
}

function DocumentUploadSection(props) {
  const { control, register, errors } = props
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documents',
  })
  const documents = useWatch({
    control,
    name: 'documents',
  })

  let documentsError = ''

  if (typeof errors.documents?.message === 'string') {
    documentsError = errors.documents.message
  } else if (typeof errors.documents?.root?.message === 'string') {
    documentsError = errors.documents.root.message
  }

  const addDocument = () => {
    append({
      fileName: '',
      fileType: 'image',
      file: null,
    })
  }

  return (
    <section className="rounded-lg border border-gray-200 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          <p className="mt-1 text-sm text-gray-600">
            Add at least 1 document with the correct file type.
          </p>
        </div>
        <button
          type="button"
          onClick={addDocument}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          <FaPlus className="text-xs" />
          Add Document
        </button>
      </div>

      {documentsError ? (
        <p className="mt-3 text-sm text-red-600">{documentsError}</p>
      ) : null}

      <div className="mt-5 space-y-4">
        {fields.map((field, index) => {
          const currentType = documents?.[index]?.fileType || 'image'
          const canRemove = fields.length > 1
          const fileError = errors.documents?.[index]?.file?.message
          const fileNameError = errors.documents?.[index]?.fileName?.message

          return (
            <div
              key={field.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-800">
                  Document {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={!canRemove}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                >
                  <FaTrash className="text-xs" />
                  Remove
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor={`documents.${index}.fileName`}
                    className="text-sm font-medium text-gray-700"
                  >
                    File Name
                  </label>
                  <input
                    id={`documents.${index}.fileName`}
                    type="text"
                    placeholder="Enter file name"
                    className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 ${
                      fileNameError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-300 bg-white focus:border-gray-400 focus:ring-gray-100'
                    }`}
                    {...register(`documents.${index}.fileName`)}
                  />
                  {fileNameError ? (
                    <p className="mt-1 text-sm text-red-600">{fileNameError}</p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`documents.${index}.fileType`}
                    className="text-sm font-medium text-gray-700"
                  >
                    File Type
                  </label>
                  <select
                    id={`documents.${index}.fileType`}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                    {...register(`documents.${index}.fileType`)}
                  >
                    <option value="image">Image</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`documents.${index}.file`}
                    className="text-sm font-medium text-gray-700"
                  >
                    File Upload
                  </label>
                  <input
                    key={`${field.id}-${currentType}`}
                    id={`documents.${index}.file`}
                    type="file"
                    accept={getAcceptValue(currentType)}
                    className={`mt-2 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-3 file:py-2 file:text-sm file:font-medium ${
                      fileError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register(`documents.${index}.file`)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {getFileHelpText(currentType)}
                  </p>
                  {fileError ? (
                    <p className="mt-1 text-sm text-red-600">{fileError}</p>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default DocumentUploadSection
