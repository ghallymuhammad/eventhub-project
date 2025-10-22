export const responseBuilder = (status: number, message: string, data: any) => {
	return { status, message, data };
};

export class ResponseBuilder {
	static success(data: any, message: string = 'Success') {
		return {
			success: true,
			message,
			data
		};
	}

	static error(message: string, code?: string) {
		return {
			success: false,
			message,
			code
		};
	}
}
