
import express, { Request, Response } from 'express';

import { AuthService, EmailService } from '../services';
import { AuthController } from "../controllers/AuthController";
import { prismaDBClient } from "../../config/prisma";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Middlewares
import { multerMiddleware } from '../middlewares/MulterMiddleware';
import { AuthorizationMiddleware } from '../middlewares/AuthorizationMiddleware';


const emailService = new EmailService();
const authService = new AuthService(prismaDBClient, bcrypt, jwt, emailService);

const authController = new AuthController(authService);

export const authRouter = express.Router();

authRouter.post('/register/parent', multerMiddleware.single('avatar'), async (req, res) => {
    await authController.registerForParent(req, res);
});

authRouter.post('/login', async (req, res) => {
    await authController.login(req, res);
});

authRouter.post('/register/institution', multerMiddleware.single('avatar'), async (req, res) => {
    await authController.registerForInstitution(req, res);
})

authRouter.post('/email', AuthorizationMiddleware(['admin']), async (req, res) => {
    await authController.sendEmailVerification(req, res);
});

authRouter.get('/email/verify', async (req, res) => {
    await authController.verifyEmail(req, res);
})

authRouter.post('/register/schools/:schoolId/health-care/:healthCareId/email', AuthorizationMiddleware(['admin', 'school', 'uks']), async (req, res) => {
    await authController.sendEmailCompleteRegistration(req, res);
})

authRouter.post('/register/schools/:schoolId/health-care/:healthCareId/member', AuthorizationMiddleware(['admin', 'school', 'uks']), async (req, res) => {
    await authController.verifyEmailCompleteRegistration(req, res);
})

authRouter.patch('/users/:userId', AuthorizationMiddleware([]), multerMiddleware.single('avatar'), async (req, res) => {
    await authController.updateUserById(req, res);
})

authRouter.post('/jwt/decode', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    const user = (req as any).user;

    res.status(200).json({
        status: 'Success',
        message: 'User Decoded Successfully',
        data: user
    })
})