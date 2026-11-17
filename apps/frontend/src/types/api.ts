export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  error: ApiError;
}
