import { Request, Response } from "express";
import { InvariantError } from "../common/exception";
import { handleError, validatePayload } from "../common/http";
import { addMemberSchema, createFamilySchema } from "../common/http/requestvalidator/FamilyValidator";
import { FamilyService } from "../services/FamilyService";
import { IFamily, IFamilyMember } from "../types/family";

export class FamilyController {
    constructor(public familyService: FamilyService) {
    }

    async createOrUpdateFamily(req: Request, res: Response) {
        try {
            validatePayload(createFamilySchema, req.body);
            const { familyId } = req.params;
            const familyPayload: IFamily = req.body
            const { family } = await this.familyService.createOrUpdateFamily(familyId ? +familyId : undefined, familyPayload);

            res.status(201).json({
                status: 'Success',
                msesage: 'Family created successfully',
                data: family
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async addFamilyMember(req: Request, res: Response) {
        try {
            validatePayload(addMemberSchema, req.body);
            const { familyId } = req.params;
            if (!familyId) {
                throw new InvariantError('Family id is required in params to add member');
            }
            const user = (req as any).user
            console.log({ user });
            const payload: IFamilyMember = req.body;
            console.log({ payload, createdBy: user.id });
            const { familyMember } = await this.familyService.addFamilyMember(+familyId, { ...payload, birthDate: new Date(payload.birthDate) }, user.id);

            res.status(201).json({
                status: 'Success',
                message: 'Family member added successfully',
                data: {
                    familyMember: {
                        ...familyMember,
                        job: {
                            ...familyMember.job,
                            income: familyMember.job.income.toString()
                        }
                    }
                }
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }
}