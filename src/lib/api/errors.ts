export class ApiError extends Error {
	public readonly status: number;
	public readonly body: string;

	public constructor(message: string, status: number, body: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
	}

	public get isUnauthorized(): boolean {
		return this.status === 401;
	}
}
