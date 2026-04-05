
class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    // Restore prototype chain (needed when extending built-ins in TS)
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export default HttpError;
