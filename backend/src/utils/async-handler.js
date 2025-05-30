// it is the higher order function
// It wraps an asynchronous request handler (a function) and automatically catches any errors that happen inside it. Instead of writing a try-catch block in every route, you can use this wrapper.
// In Express.js, errors in async functions are not automatically passed to the next() function, which means the error-handling middleware won't catch them unless you manually do so.

const asyncHandler = (requestHandler) => {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };