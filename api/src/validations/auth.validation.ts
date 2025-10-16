import yup from "../libs/yup";
import { Request, Response, NextFunction } from "express";

const sharedAuthSchema = {
	email: yup.string().email().trim().required("Email is required"),
	password: yup.string().min(6).required("Password is required"),
	role: yup.string().oneOf(["USER", "ADMIN"]).required("Role is required"),
};

export const authSchema = yup.object().shape({
	...sharedAuthSchema,
});

// Register validation schema
const registerSchema = yup.object().shape({
	email: yup.string().email().trim().required("Email is required"),
	password: yup.string().min(6).required("Password is required"),
	firstName: yup.string().required("First name is required"),
	lastName: yup.string().required("Last name is required"),
	phoneNumber: yup.string().optional(),
	referralCode: yup.string().optional(),
});

// Login validation schema
const loginSchema = yup.object().shape({
	email: yup.string().email().trim().required("Email is required"),
	password: yup.string().required("Password is required"),
});

// Password reset validation schema
const passwordResetSchema = yup.object().shape({
	token: yup.string().required("Token is required"),
	newPassword: yup.string().min(6).required("New password is required"),
});

// Validation middleware
export const validateRegister = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await registerSchema.validate(req.body, { abortEarly: false });
		next();
	} catch (error: any) {
		res.status(400).json({
			success: false,
			message: "Validation error",
			errors: error.errors,
		});
	}
};

export const validateLogin = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await loginSchema.validate(req.body, { abortEarly: false });
		next();
	} catch (error: any) {
		res.status(400).json({
			success: false,
			message: "Validation error",
			errors: error.errors,
		});
	}
};

export const validatePasswordReset = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await passwordResetSchema.validate(req.body, { abortEarly: false });
		next();
	} catch (error: any) {
		res.status(400).json({
			success: false,
			message: "Validation error",
			errors: error.errors,
		});
	}
};

