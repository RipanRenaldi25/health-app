import { Request, Response } from "express";
import { InvariantError, PayloadError } from "../common/exception";
import {
  handleError,
  institutionRegisterPayloadSchema,
  registerPayloadSchema,
  validatePayload,
  verifyEmailSchema,
} from "../common/http";
import { CompleteRegistrationSchema } from "../common/http/requestvalidator/CompleteRegistrationValidator";
import { AuthService } from "../services";
import { IInstitution, RegisterPayloadType } from "../types/auth";
import { registerTeacherSchema } from "../common/http/requestvalidator/RegisterValidator";

export class AuthController {
  constructor(public authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      validatePayload(registerPayloadSchema, req.body);
      const { username, password, email, role, isVerified, institutionId } =
        req.body;
      const { newUser } = await this.authService.register({
        username,
        email,
        password,
        roleId: role,
        isVerified: isVerified ?? false,
        ...(institutionId && {
          institutionId,
        }),
      });

      res.status(201).json({
        status: "Success",
        message: "User Registered Successfully",
        data: newUser,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async registerForParent(req: Request, res: Response) {
    try {
      validatePayload(registerPayloadSchema, req.body);
      const { username, password, email } = req.body;
      const { newUser } = await this.authService.register({
        username,
        email,
        password,
        roleId: 4,
        isVerified: true,
      });

      res.status(201).json({
        status: "Success",
        message: "User Registered Successfully",
        data: newUser,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async registerForTeacher(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      if (!schoolId) {
        throw new InvariantError("schoolId is required in params");
      }
      validatePayload(registerTeacherSchema, req.body);
      const { username, password, email, name } = req.body;
      const file = req.file;
      const { teacher } = await this.authService.registerForTeacher({
        username,
        email,
        password,
        schoolId: +schoolId,
        name,
        avatar: file?.originalname ?? undefined,
      });

      res.status(201).json({
        status: "Success",
        message: "User Registered Successfully",
        data: teacher,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async registerForStaff(req: Request, res: Response) {
    try {
      const { healthCareId } = req.params;
      if (!healthCareId) {
        throw new InvariantError("schoolId is required in params");
      }
      validatePayload(registerTeacherSchema, req.body);
      const { username, password, email, name } = req.body;
      const file = req.file;
      const { staff } = await this.authService.registerForStaff({
        username,
        email,
        password,
        healthCareId: +healthCareId,
        name,
        avatar: file?.originalname ?? undefined,
      });

      res.status(201).json({
        status: "Success",
        message: "User Registered Successfully",
        data: staff,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async registerForInstitution(req: Request, res: Response) {
    try {
      validatePayload(institutionRegisterPayloadSchema, req.body);

      const {
        username,
        email,
        password,
        roleId,
        address,
        headNIP,
        headName,
        name,
        phoneNumber,
        institutionId,
      }: Omit<IInstitution, "licenseDocument"> &
        Omit<RegisterPayloadType, "is_verified"> & {
          institutionId: string;
        } = req.body;

      const { userInstitution } = await this.authService.registerForInstitution(
        {
          username,
          email,
          password,
          roleId: +roleId,
          address,
          headNIP,
          headName,
          name,
          phoneNumber,
        }
      );

      res.status(201).json({
        status: "Success",
        message: "User Registered Successfully",
        data: userInstitution,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async sendEmailCompleteRegistration(req: Request, res: Response) {
    try {
      validatePayload(CompleteRegistrationSchema, req.body);
      const { schoolId, healthCareId } = req.params;
      const { email, fullName, positionId } = req.body;
      const { email: senderEmail } = (req as any).user;

      await this.authService.sendEmailRegistration({
        schoolId: +schoolId,
        healthCareId: +healthCareId,
        email,
        name: fullName,
        senderEmail,
        positionId,
      });
      res.status(200).json({
        status: "Success",
        message: "Email for Registration Sent Successfully",
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { uniqueIdentity, password } = req.body;
      const { accessToken } = await this.authService.login(
        uniqueIdentity,
        password
      );
      res.status(200).json({
        status: "Success",
        message: "User Logged In Successfully",
        data: {
          accessToken,
        },
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async sendEmailVerification(req: Request, res: Response) {
    try {
      validatePayload(verifyEmailSchema, req.body);
      const { email } = req.body;
      const { user } = await this.authService.sendEmailVerification(email);

      if (!user) {
        return res.status(200).json({
          status: "Not Changed",
          message: "User Already Verified",
        });
      }

      res.status(200).json({
        status: "Success",
        message: "Email Verification Sent Successfully",
      });
    } catch (error: any) {
      handleError(error, res);
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (typeof token !== "string") {
        throw new PayloadError("Token is required");
      }
      const { user, message } = await this.authService.verifyEmail(token);
      if (!user) {
        return res.status(200).json({
          status: "Not Changed",
          message: "User Already Verified",
        });
      }
      res.status(200).json({
        status: "Success",
        message,
        data: user,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async verifyEmailCompleteRegistration(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token) {
        throw new PayloadError("Token is required");
      }
      const payload: Omit<RegisterPayloadType, "email"> = req.body;
      if (!payload.username || !payload.password) {
        throw new PayloadError("Username and Password is required");
      }
      const { healthCareMember } =
        await this.authService.verifyHealthcareMemberRegistrationEmail(
          token as string,
          payload
        );
      res.status(200).json({
        status: "Success",
        message: `User Registered Successfully as Health Care Member`,
        data: healthCareMember,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  // decodeJWT(req: Request, res: Response) {
  //     try {
  //         const { accessToken } = req.body;
  //         const decodedToken = this.jwt.verify(accessToken, process.env.SECRET_ACCESS_TOKEN);
  //         res.status(200).json({
  //             status: 'Success',
  //             message: 'Token Decoded Successfully',
  //             data: decodedToken
  //         })

  //     } catch (err: any) {
  //         handleError(err, res);
  //     }

  // }
}
