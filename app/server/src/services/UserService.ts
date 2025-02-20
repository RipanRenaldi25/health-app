import { PrismaClient } from "@prisma/client";
import { AuthorizationError, NotFoundError } from "../common/exception";
import { RegisterPayloadType } from "../types/auth";

export class UserService {
    constructor(public prismaClient: PrismaClient) {

    }

    async checkUserExists(uniqueIdentity: string) {
        const user = await this.getUserByUniqueIdentity(uniqueIdentity);

        return !!user;
    }

    async getUserByUniqueIdentity(uniqueIdentity: string, includeParams?: any) {
        const user = await this.prismaClient.user.findFirst({
            where: {
                OR: [
                    {
                        email: uniqueIdentity
                    },
                    {
                        username: uniqueIdentity
                    }
                ]
            },
            ...(Object.keys(includeParams).length && {
                include: includeParams
            })
        });

        return { user };
    }

    async getUserByUsername(username: string) {
        if (username.includes('admin')) {
            throw new AuthorizationError('You are not authorized to view this resource');
        }
        const user = await this.prismaClient.user.findUnique({
            where: {
                username
            }
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return { user };
    }

    async getUserByEmail(email: string) {
        if (email.includes('admin')) {
            throw new AuthorizationError('You are not authorized to view this resource');
        };
        const user = await this.prismaClient.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return { user };
    }

    async getUsers() {
        const users = await this.prismaClient.user.findMany({
            include: {
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return { users };
    }

    async getUserById(id: number) {
        if (id === 1) {
            throw new AuthorizationError('You are not authorized to view this resource');
        }
        const user = await this.prismaClient.user.findUnique({
            where: {
                id
            }
        });

        return { user }
    }

    async getUserWithRelation(uniqueValue: any, includeParams: any | undefined) {

        if (typeof uniqueValue === 'string') {
            const user = await this.prismaClient.user.findFirst({
                where: {
                    OR: [
                        {
                            email: uniqueValue
                        },
                        {
                            username: uniqueValue
                        }
                    ]
                },
                ...(!!includeParams && {
                    include: includeParams
                })
            });

            return { user }
        }
        const user = await this.prismaClient.user.findUnique({
            where: {
                id: +uniqueValue
            },
            ...(includeParams && {
                include: includeParams
            }),
        });

        return { user };
    }

    async getUserRegisterStatistic(startDate: string = "", endDate: string = "") {
        const stats: any[] = await this.prismaClient.$queryRaw`SELECT DATE_FORMAT(created_at, "%Y-%M") AS tanggal, COUNT(*) as total_users FROM users GROUP BY tanggal ORDER BY tanggal DESC`;
        console.log({ stats });
        return {
            stats: stats.map(stats => ({
                tanggal: stats.tanggal,
                total_users: +stats.total_users.toString(),
            }))
        };
    }
};