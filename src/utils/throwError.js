export const throwError = (message, status = 400) => {
  const error = new Error(message)
  error.status(status)
  throw error
}
