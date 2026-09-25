/**
 * Standard API response helpers
 */
export const successResponse = (res, data, message = null, statusCode = 200) => {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== undefined && data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
