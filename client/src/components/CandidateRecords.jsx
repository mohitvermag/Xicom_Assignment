function formatDisplayDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatAddress(address) {
  if (!address) {
    return '-'
  }

  const addressParts = [address.street1, address.street2].filter(Boolean)
  return addressParts.length ? addressParts.join(', ') : '-'
}

function getDocumentUrl(fileUrl) {
  if (!fileUrl) {
    return '#'
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || ''

  if (!apiBaseUrl) {
    return fileUrl
  }

  return `${apiBaseUrl.replace(/\/$/, '')}${fileUrl}`
}

function CandidateRecords(props) {
  const { records, loading, error, onRefresh } = props

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Submitted Records
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            View all candidates submitted from this form.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {!error && loading ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
          Loading submitted records...
        </div>
      ) : null}

      {!loading && !error && records.length === 0 ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
          No submitted records found yet.
        </div>
      ) : null}

      {!loading && !error && records.length > 0 ? (
        <div className="mt-5 space-y-4">
          {records.map((record, index) => (
            <article
              key={record._id || index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {record.firstName} {record.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{record.email}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Submitted: {formatDisplayDate(record.createdAt)}
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Date of Birth
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDisplayDate(record.dob)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Same as Residential
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {record.sameAsResidential ? 'Yes' : 'No'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Residential Address
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatAddress(record.residentialAddress)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Permanent Address
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatAddress(record.permanentAddress)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Documents
                </p>
                <div className="mt-2 space-y-2">
                  {record.documents?.map((document, documentIndex) => (
                    <div
                      key={document.fileUrl || documentIndex}
                      className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {document.fileName}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {document.fileType}
                        </p>
                      </div>
                      <a
                        href={getDocumentUrl(document.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-gray-900 underline"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default CandidateRecords
