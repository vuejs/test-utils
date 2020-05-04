export const errorHandler = (error: Error) => {
  if (error.message.match(/Async component failed to load./)) {
    return
  }

  throw error
}
