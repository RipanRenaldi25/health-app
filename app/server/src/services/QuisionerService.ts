import { PrismaClient } from "@prisma/client";
import { InvariantError, NotFoundError } from "../common/exception";
import { IOption, IQuestions, IQuisioner, IResponsePayload, QuisionerPayload } from "../types/quisioner";

export class QuisionerService {
    constructor(public prismaClient: PrismaClient) { }

    async createQuisioner(payload: QuisionerPayload) {
        if (payload.stratification) {
            const { quisioner } = await this.getQuisionerByStratification(payload.stratification);
            if (quisioner) {
                throw new InvariantError('Quisioner already exist for this stratification');
            }
        }
        const quisioner = await this.prismaClient.quisioner.create({
            data: {
                title: payload.title,
                description: payload.description,
                stratification: payload.stratification,
                for: payload.for,
                questions: {
                    create: payload.questions.map((question: IQuestions) => ({
                        question: question.question,
                        type: question.type,
                        is_required: question.isRequired,
                        ...((question.type === 'MULTIPLE_CHOICE' || question.type === 'SCALE') && {
                            options: {
                                create: question.options?.map(option => ({
                                    title: option.title,
                                    score: option.score ?? 0
                                }))
                            }
                        })
                    }))
                }
            },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });

        return { quisioner }
    }

    async getQuisionerByStratification(stratification: string) {
        const quisioner = await this.prismaClient.quisioner.findUnique({
            where: {
                stratification
            },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });

        return { quisioner }
    }

    async getQuisionerByStratifications(stratification: string) {
        const quisioners = await this.prismaClient.quisioner.findMany({
            where: {
                stratification: {
                    startsWith: stratification
                }
            },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });

        return { quisioners }
    }

    async getQuisionerStratificationsBelongToSchool() {
        const quisioners = await this.prismaClient.quisioner.findMany({
            where: {
                for: 'SCHOOL'
            },
            include: {
                questions: {
                    include: {
                        options: true
                    },
                }
            }
        });

        return {
            quisioners
        }
    }

    async getQuisionerBelongsToParent() {
        const quisioners = await this.prismaClient.quisioner.findMany({
            where: {
                for: 'PARENT'
            },
            include: {
                questions: {
                    include: {
                        options: true
                    },
                },
                response: {
                    include: {
                        answers: true
                    }
                }
            }
        });
        return { quisioners }
    }

    async deleteQuisioner(id: number) {
        const { quisioner: isQuisionerExist } = await this.getQuisionerById(id);
        if (!isQuisionerExist) {
            throw new NotFoundError('Quisioner not found');
        }

        const deletedQuisioner = await this.prismaClient.quisioner.delete({
            where: {
                id
            }
        });

        return {
            quisioner: deletedQuisioner
        }
    }

    async getQuisionerById(id: number) {
        const quisioner = await this.prismaClient.quisioner.findUnique({
            where: {
                id
            },
            include: {
                questions: {
                    include: {
                        options: true,
                    },
                },
                response: {
                    include: {
                        answers: true
                    }
                }

            }
        });


        return { quisioner };
    }

    async getAllQuisioners(forWho?: string) {
        const quisioners = await this.prismaClient.quisioner.findMany({
            ...(forWho && ({
                where: {
                    for: forWho
                }
            })),
            include: {
                questions: {
                    include: {
                        options: true,
                    }
                },
                response: {
                    include: {
                        answers: true
                    }
                },
            },
        });

        const quisionerCount = await this.prismaClient.quisioner.count({
            where: {
                ...(forWho && {
                    for: forWho
                })
            }
        });


        return {
            quisioners,
            count: quisionerCount
        }
    }

    async responseQuisioner(responsePayload: IResponsePayload) {
        const { quisioner } = await this.getQuisionerById(responsePayload.response.quisionerId);
        if (!quisioner) {
            throw new NotFoundError('Quisioner not found');
        }
        if (responsePayload.response.familyMemberId) {
            await this.checkIfQuisionerIsAnswered(responsePayload.response.familyMemberId, responsePayload.response.quisionerId);
        }
        if (responsePayload.response.institutionId) {
            await this.checkIfQuisionerIsAnswered(responsePayload.response.institutionId, responsePayload.response.quisionerId);
        }
        const response = await this.prismaClient.response.create({
            data: {
                quisioner_id: responsePayload.response.quisionerId,
                family_member_id: responsePayload.response.familyMemberId,
                institution_id: responsePayload.response.institutionId,
                total_score: responsePayload.response.totalScore,
                answers: {
                    create: responsePayload.answers.map(answer => ({
                        question_id: answer.questionId,
                        score: answer.score ?? 0,
                        boolean_value: answer.booleanValue,
                        option_id: answer.optionId,
                        scaleValue: answer.scaleValue,
                        text_value: answer.textValue,
                    }))
                },
            },
            include: {
                quisioner: {
                    include: {
                        questions: {
                            include: {
                                options: true
                            }
                        }
                    }
                },
                answers: true,
                family_member: true,
                institution: true
            }
        });

        return { response }
    }



    async checkIfQuisionerIsAnswered(answeredBy: number, quisionerId: number, isFamilyMember: boolean = false) {
        const quisioner = await this.prismaClient.quisioner.findFirst({
            where: {
                id: quisionerId,
                response: {
                    some: {
                        ...(isFamilyMember && {
                            family_member_id: answeredBy
                        }),
                        ...(!isFamilyMember && {
                            institution_id: answeredBy
                        })
                    }
                }
            }
        })
        if (!!quisioner) {
            throw new InvariantError(`Quisioner already answered by ${isFamilyMember ? 'family member' : 'institution'}`);
        }
    }

    async getQuisionerResponseById(responseId: number) {
        const response = await this.prismaClient.response.findUnique({
            where: {
                id: responseId,
            },
            include: {
                quisioner: true,
                answers: true,
                family_member: true,
                institution: true
            }
        });

        return { response };
    }

    async getResponsesByFamilyId(familyId: number) {
        const responses = await this.prismaClient.response.findMany({
            where: {
                family_member: {
                    id: familyId
                }
            },
            include: {
                answers: true,
                quisioner: {
                    include: {
                        questions: {
                            include: {
                                options: true
                            }
                        }
                    }
                },
                family_member: true,
            }
        });

        return { responses }
    }

    async getResponseByInstitutionId(institutionId: number) {
        const responses = await this.prismaClient.response.findMany({
            where: {
                institution: {
                    id: institutionId
                }
            },
            include: {
                answers: true,
                quisioner: {
                    include: {
                        questions: {
                            include: {
                                options: true
                            }
                        }
                    }
                },
                institution: true,
            }
        });

        return { responses }
    }

    async updateQuisioner(quisionerId: number, payload: Partial<IQuisioner>) {
        const { quisioner } = await this.getQuisionerById(quisionerId);
        if (!quisioner) {
            throw new NotFoundError('Quisioner not found');
        }
        const isQuisionerHaveResponse = await this.checkIfQuisionerHaveResponse(quisionerId);
        console.log({ isQuisionerHaveResponse, payload })
        if (isQuisionerHaveResponse && (!!payload.for || !!payload.stratification)) {
            throw new InvariantError('Quisioner already have response, cannot update for and stratification');
        }

        const updatedQuisioner = await this.prismaClient.quisioner.update({
            where: {
                id: quisionerId
            },
            data: {
                title: payload.title,
                description: payload.description,
                for: payload.for,
                stratification: payload.stratification
            }
        });

        return {
            quisioner: updatedQuisioner
        }
    }

    async checkIfQuisionerHaveResponse(quisionerId: number) {
        const quisioner = await this.prismaClient.quisioner.findUnique({
            where: {
                id: quisionerId
            },
            include: {
                response: true
            }
        });
        console.log({ quisionerResponse: quisioner?.response })
        return quisioner?.response.length ? true : false;
    }



    async checkIfQuestionHaveResponse(questionId: number) {
        const question = await this.prismaClient.question.findUnique({
            where: {
                id: questionId
            },
            include: {
                quisioner: {
                    include: {
                        response: true
                    }
                }
            }
        });

        return question?.quisioner.response.length ? true : false;
    }

    async getQuestionById(questionId: number) {
        const question = await this.prismaClient.question.findUnique({
            where: {
                id: questionId
            },
            include: {
                options: true
            }
        });

        return { question }
    }

    async updateOption(optionId: number, payload: Partial<IOption>) {
        const { option } = await this.getOptionById(optionId);
        if (!option) {
            throw new NotFoundError('Option not found');
        }
        if (await this.checkIfOptionHaveResponse(optionId)) {
            throw new InvariantError('Option already have response, cannot change option');
        }

        const updatedOption = await this.prismaClient.option.update({
            where: {
                id: optionId
            },
            data: {
                title: payload.title,
                score: payload.score
            }
        });

        return {
            option: updatedOption
        }
    }

    async getOptionById(optionId: number) {
        const option = await this.prismaClient.option.findUnique({
            where: {
                id: optionId
            }
        });

        return { option }
    }

    async checkIfOptionHaveResponse(optionId: number) {
        const option = await this.prismaClient.option.findUnique({
            where: {
                id: optionId
            },
            include: {
                question: {
                    select: {
                        quisioner: {
                            select: {
                                response: true
                            }
                        }
                    }
                }

            }
        });

        return option?.question.quisioner.response.length ? true : false;
    }

    async deleteQuestion(questionId: number, force: boolean = false) {
        const { question } = await this.getQuestionById(questionId);
        if (!question) {
            throw new NotFoundError('Question not found');
        }
        if (await this.checkIfQuestionHaveResponse(questionId) && !force) {
            throw new InvariantError('Question already have response, cannot delete');
        }

        const deletedQuestion = await this.prismaClient.question.delete({
            where: {
                id: questionId
            }
        });

        return {
            question: deletedQuestion
        }
    }

    async deleteOption(optionId: number, force: boolean = false) {
        const { option } = await this.getOptionById(optionId);
        if (!option) {
            throw new NotFoundError('Option not found');
        }
        if (await this.checkIfOptionHaveResponse(optionId) && !!force) {
            throw new InvariantError('Option already have response, cannot delete');
        }

        const deletedOption = await this.prismaClient.option.delete({
            where: {
                id: optionId
            }
        });

        return {
            option: deletedOption
        }
    }

    async updateQuestion(questionId: number, payload: Partial<IQuestions>) {
        if ((payload.type === "MULTIPLE_CHOICE" || payload.type === "SCALE") && !payload.options) {
            throw new InvariantError('Options is required for multiple choice and scale type');
        }
        const { question: isQuestionExist } = await this.getQuestionById(questionId);
        if (!isQuestionExist) {
            throw new NotFoundError('Question not found');
        }
        const question = await this.prismaClient.question.update({
            data: {
                question: payload.question,
                type: payload.type,
                is_required: payload.isRequired,
                ...((payload.type === 'MULTIPLE_CHOICE' || payload.type === 'SCALE') && {
                    options: {
                        create: payload.options?.map(option => ({
                            title: option.title,
                            score: option.score ?? 0
                        }))
                    }
                }),
                ...((isQuestionExist.type === 'MULTIPLE_CHOICE' || isQuestionExist.type === 'SCALE') && (payload.type == 'BOOLEAN' || payload.type === 'TEXT')) && {
                    options: {
                        deleteMany: {}
                    }
                }
            },
            where: {
                id: questionId
            },
        });

        return { question };
    }


    async addQuestionToQuisioner(quisionerId: number, payload: Omit<IQuestions, 'quisionerId'>) {
        const { quisioner } = await this.getQuisionerById(quisionerId);
        if (!quisioner) {
            throw new NotFoundError('Quisioner not found');
        }
        const question = await this.prismaClient.question.create({
            data: {
                quisioner_id: quisionerId,
                question: payload.question,
                type: payload.type,
                is_required: payload.isRequired,
                ...((payload.type === 'MULTIPLE_CHOICE' || payload.type === 'SCALE') && {
                    options: {
                        create: payload.options?.map(option => ({
                            title: option.title,
                            score: option.score ?? 0
                        }))
                    }
                })
            },
            include: {
                quisioner: true
            }
        });

        return { question }
    }

    async getAllResponses(forWho: string) {
        const responses = await this.prismaClient.response.findMany({
            ...(forWho && ({
                where: {
                    quisioner: {
                        for: forWho
                    }
                }
            })),
        });
        const responseCount = await this.prismaClient.response.count({
            ...(forWho && ({
                where: {
                    quisioner: {
                        for: forWho
                    }
                }
            })),
        });
        return {
            responses,
            count: responseCount
        }
    }

    async getQuisionerCategories() {
        const quisioners = await this.prismaClient.quisioner.findMany({
        });
        const categories = new Map();
        for (const quisioner of quisioners) {
            if (categories.has(quisioner.title)) {
                continue;
            }
            categories.set(quisioner.title, quisioner.title);
        };
        return {
            categories: Array.from(categories.values())
        }
    }
}