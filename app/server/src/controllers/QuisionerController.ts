import { Request, Response } from "express";
import { QuisionerService } from "../services/QuisionerService";
import { handleError, validatePayload } from "../common/http";
import { addQuestionToQuisionerSchema, createQuisionerSchema, createResponseQuisioner } from "../common/http/requestvalidator/QuisionerValidator";
import { InvariantError, NotFoundError } from "../common/exception";
import { IAnswer, IResponsePayload } from "../types/quisioner";

export class QuisionerController {
    constructor(public quisionerService: QuisionerService) { }

    async createQuisioner(req: Request, res: Response) {
        try {
            validatePayload(createQuisionerSchema, req.body);
            const payload = req.body;
            const quistioner = await this.quisionerService.createQuisioner(payload);
            res.status(201).json({
                status: 'success',
                message: 'Quisioner created successfully',
                data: quistioner
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async deleteQuisionerById(req: Request, res: Response) {
        try {
            const { quisionerId } = req.params
            if (!quisionerId) {
                throw new InvariantError('Quisioner id is required');
            }
            const { quisioner } = await this.quisionerService.deleteQuisioner(+quisionerId);
            res.status(200).json({
                status: 'Success',
                message: `Quisioner with id ${quisioner.id} deleted successfully`,
                data: quisioner
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getQuisionerById(req: Request, res: Response) {
        try {
            const { quisionerId } = req.params;
            if (!quisionerId) {
                throw new Error('Quisioner id is required');
            }
            const { quisioner } = await this.quisionerService.getQuisionerById(+quisionerId);
            if (!quisioner) {
                throw new NotFoundError('Quisioner not found');
            }
            res.status(200).json({
                status: 'Success',
                message: `Quisioner with id ${quisioner.id} fetched successfully`,
                data: quisioner
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getAllQuisioners(req: Request, res: Response) {
        try {
            const { forWho } = req.query;
            console.log({ forWho });
            const quisioners = await this.quisionerService.getAllQuisioners(forWho as string ?? undefined);
            res.status(200).json({
                status: 'Success',
                message: 'Quisioners fetched successfully',
                data: quisioners
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getAllQuisionersByFor(req: Request, res: Response) {
        try {
            const { forWho } = req.query;
            const quisioners = await this.quisionerService.getAllQuisioners(forWho as string);
            res.status(200).json({
                status: 'Success',
                message: 'Quisioners fetched successfully',
                data: quisioners
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async responseQuisioner(req: Request, res: Response) {
        try {
            validatePayload(createResponseQuisioner, req.body);
            const { quisionerId } = req.params;
            if (!quisionerId) {
                throw new InvariantError('Quisioner id is required');
            }
            const { familyMemberId, institutionId } = req.body;
            if (!familyMemberId && !institutionId) {
                throw new InvariantError('Family member id or institution id is required in body');
            }
            const payload = req.body;
            const { booleanValue, textValue, scaleValue, optionId } = payload.answers[0];
            console.log({ answer: payload.answers[0] });
            if (!booleanValue && !textValue && !scaleValue && !optionId) {
                throw new InvariantError('Answer.value is required');
            }

            const totalScore = payload.answers?.reduce((acc: number, answer: any) => {
                if (typeof answer.booleanValue === 'boolean') {
                    return acc + answer.booleanValue ? 1 : 0
                };
                return acc + answer.score
            }, 0) ?? 0;



            const { response } = await this.quisionerService.responseQuisioner({
                response: {
                    familyMemberId: payload.familyMemberId,
                    institutionId: payload.institutionId,
                    quisionerId: +quisionerId,
                    totalScore: totalScore ?? 0
                },
                answers: payload.answers.map((answer: IAnswer) => ({
                    questionId: answer.questionId,
                    score: answer.score,
                    booleanValue: answer.booleanValue,
                    textValue: answer.textValue,
                    scaleValue: answer.scaleValue,
                    optionId: answer.optionId
                }))
            });

            res.status(201).json({
                status: 'Success',
                message: 'Quisioner response created successfully',
                data: response
            })

        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getQuisionerResponseById(req: Request, res: Response) {
        try {
            const { responseId } = req.params;
            if (!responseId) {
                throw new InvariantError('Quisioner id is required');
            }
            const { response } = await this.quisionerService.getQuisionerResponseById(+responseId);
            if (!response) {
                throw new NotFoundError('Quisioner response not found');
            }
            res.status(200).json({
                status: 'Success',
                message: `Quisioner response with id ${response.id} fetched successfully`,
                data: response
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getResponseByFamilyId(req: Request, res: Response) {
        try {
            const { familyMemberId } = req.params;
            if (!familyMemberId) {
                throw new InvariantError('Family member id is required');
            }
            const { responses } = await this.quisionerService.getResponsesByFamilyId(+familyMemberId);
            if (!responses) {
                throw new NotFoundError('Quisioner response not found');
            }
            res.status(200).json({
                status: 'Success',
                message: `Quisioner responses fetched successfully`,
                data: responses
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getQuisionerResponseByInstitutionId(req: Request, res: Response) {
        try {
            const { institutionId } = req.params;
            if (!institutionId) {
                throw new InvariantError('Institution id is required');
            }
            const { responses } = await this.quisionerService.getResponseByInstitutionId(+institutionId);
            if (!responses) {
                throw new NotFoundError('Quisioner response not found');
            }
            res.status(200).json({
                status: 'Success',
                message: `Quisioner responses fetched successfully`,
                data: responses
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async updateQuisionerById(req: Request, res: Response) {
        try {
            const { quisionerId } = req.params;
            if (!quisionerId) {
                throw new InvariantError('Quisioner id is required');
            }
            const { title, description, stratification, for: forWho } = req.body;
            if (!title || !description) {
                throw new InvariantError('Title, for and stratification is required');
            }
            const { quisioner } = await this.quisionerService.updateQuisioner(+quisionerId, { title, description, stratification, for: forWho });
            res.status(200).json({
                status: 'Success',
                message: `Quisioner with id ${quisioner.id} updated successfully`,
                data: quisioner
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }



    async deleteQuestionById(req: Request, res: Response) {
        try {
            const { questionId } = req.params;
            if (!questionId) {
                throw new InvariantError('Question id is required');
            }
            const { question } = await this.quisionerService.deleteQuestion(+questionId);
            res.status(200).json({
                status: 'Success',
                message: `Question with id ${question.id} deleted successfully`,
                data: question
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async updateOptionById(req: Request, res: Response) {
        try {
            const { optionId } = req.params;
            if (!optionId) {
                throw new InvariantError('Option id is required');
            }
            const { title, score } = req.body;
            const { option: updatedOption } = await this.quisionerService.updateOption(+optionId, { title, score });
            res.status(200).json({
                status: 'Success',
                message: `Option with id ${updatedOption.id} updated successfully`,
                data: updatedOption
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async deleteOptionById(req: Request, res: Response) {
        try {
            const { optionId } = req.params;
            if (!optionId) {
                throw new InvariantError('Option id is required');
            }
            const { option } = await this.quisionerService.deleteOption(+optionId);
            res.status(200).json({
                status: 'Success',
                message: `Option with id ${option.id} deleted successfully`,
                data: option
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async updateQuestionById(req: Request, res: Response) {
        try {
            const { questionId } = req.params;
            if (!questionId) {
                throw new InvariantError('Question id is required');
            }
            const { question, type, options, isRequired } = req.body;
            if (!question || !isRequired || !type) {
                throw new InvariantError('question, isRequired and type is required');
            }
            if (type === 'MULTIPLE_CHOICE' && (!options || options.length === 0)) {
                throw new InvariantError('Options is required for multiple choice question');
            }
            if (type === "SCALE" && (!options || options.length === 0)) {
                throw new InvariantError('Options is required for scale question');
            }
            const { question: updatedQuestion } = await this.quisionerService.updateQuestion(+questionId, { question, type, options, isRequired });
            res.status(200).json({
                status: 'Success',
                message: `Question with id ${question.id} updated successfully`,
                data: updatedQuestion
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async addQuestionToQuisioner(req: Request, res: Response) {
        try {
            validatePayload(addQuestionToQuisionerSchema, req.body);
            const { quisionerId } = req.params;
            if (!quisionerId) {
                throw new InvariantError('Quisioner id is required');
            }
            const { question, type, options, isRequired } = req.body;
            const { question: newQuestion } = await this.quisionerService.addQuestionToQuisioner(+quisionerId, { question, type, options, isRequired });
            res.status(201).json({
                status: 'Success',
                message: `Question added to quisioner with id ${quisionerId} successfully`,
                data: newQuestion
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    // async getQuisionerByStratification(req: Request, res: Response) {
    //     try {
    //         const { stratification } = req.params;
    //         if (!stratification) {
    //             throw new InvariantError('Stratification is required in params');
    //         }
    //         const quisioners = await this.quisionerService.getQuisionerByStratification(stratification as string);
    //         res.status(200).json({
    //             status: 'Success',
    //             message: 'Quisioners fetched successfully',
    //             data: quisioners
    //         })
    //     } catch (err: any) {
    //         handleError(err, res);
    //     }
    // }

    async getQuisionerByStratifications(req: Request, res: Response) {
        try {
            const { stratification } = req.params;
            if (!stratification) {
                throw new InvariantError('stratification is required in params');
            }
            const quisioners = await this.quisionerService.getQuisionerByStratifications(stratification as string);
            res.status(200).json({
                status: 'Success',
                message: 'Quisioners fetched successfully',
                data: quisioners
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getQuisionerByStratificationsBelongToSchool(req: Request, res: Response) {
        try {
            const { quisioners } = await this.quisionerService.getQuisionerStratificationsBelongToSchool();
            res.status(200).json({
                status: 'Success',
                message: 'Quisioners fetched successfully',
                data: quisioners
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getQuisionerByStratificationsBelongToParent(req: Request, res: Response) {
        try {
            const { quisioners } = await this.quisionerService.getQuisionerBelongsToParent();
            res.status(200).json({
                status: 'Success',
                message: 'Quisioners fetched successfully',
                data: quisioners
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getAllResponses(req: Request, res: Response) {
        try {
            const { forWho } = req.query;
            console.log({ forWho });
            const responses = await this.quisionerService.getAllResponses(forWho as string ?? undefined);
            res.status(200).json({
                status: 'Success',
                message: 'Responses fetched successfully',
                data: responses
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }

    async getQuisionerCategories(req: Request, res: Response) {
        try {
            const { categories } = await this.quisionerService.getQuisionerCategories();
            res.status(200).json({
                status: 'Success',
                message: 'Categories retrieved',
                data: categories
            })
        } catch (err: any) {
            handleError(err, res);
        }
    }
}