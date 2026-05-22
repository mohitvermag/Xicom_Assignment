function SubmitButton(props) {
  const { loading } = props

  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-500 sm:w-auto sm:min-w-40"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Submitting...
        </span>
      ) : (
        'Submit Form'
      )}
    </button>
  )
}

export default SubmitButton
