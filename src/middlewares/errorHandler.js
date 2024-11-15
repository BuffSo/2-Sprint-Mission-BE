export default function errorHandler(error, req, res, next) {
  let status = error.status || error.code || 500;

  // 상태 코드가 없거나 유효하지 않은 경우 500으로 설정
  if (!status || status < 100 || status >= 600) {
    status = 500;
  }

  // UnauthorizedError에 대한 메시지 간소화
  if (error.name === 'UnauthorizedError') {
    status = 401;
    error.message = 'Authentication token is missing or invalid';
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn('WARN', status, error);                // 개발 환경에서는 전체 오류 출력
  } else {
    console.warn(`WARN ${status} - ${error.message}`);  // 운영 환경에서는 간단한 메시지만 출력
  }

  return res.status(status).json({
    path: req.path,
    method: req.method,
    message: error.message || 'Internal Server Error',
    data: error.data || undefined,
    date: new Date(),
  });
}
