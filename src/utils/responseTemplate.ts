export const response = (
  message: any,
  result: any,
  statusCode: any,
  res: any
) => {
  return res.status(statusCode).json({
    status: true,
    message: message,
    result: result,
  });
};
