import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

export class SeedService {
    constructor(public prismaClient: PrismaClient) {
    }

    async seed() {
        await this.seedRole();
        await this.seedInstitutionType();
        await this.seedPositions();
        await this.seedAdminAccount();
    }

    async seedRole() {
        const isRoleExist = await this.prismaClient.role.findMany();
        if (isRoleExist.length === 0) {
            await this.prismaClient.role.createMany({
                data: [
                    {
                        id: 1,
                        name: 'admin'
                    },
                    {
                        id: 2,
                        name: 'school'
                    },
                    {
                        id: 3,
                        name: 'healthcare'
                    },
                    {
                        id: 4,
                        name: 'parent'
                    },
                    {
                        id: 5,
                        name: 'uks'
                    }
                ]
            })
        }
        console.log('Role seeded');
    }

    async seedInstitutionType() {
        const isInstitutionTypeExists = await this.prismaClient.institutionType.findMany();
        if (isInstitutionTypeExists.length === 0) {
            await this.prismaClient.institutionType.createMany({
                data: [
                    {
                        id: 1,
                        name: 'school'
                    },
                    {
                        id: 2,
                        name: 'healthcare'
                    },
                ]
            })
        }
        console.log('Institution Type seeded');
    }

    async seedAdminAccount() {
        const isUserExist = await this.prismaClient.user.findMany();
        if (!isUserExist.length) {
            await this.prismaClient.user.create({
                data: {
                    id: 1,
                    username: process.env.ADMIN_USERNAME ?? 'admin',
                    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD ?? 'admin', 10),
                    email: process.env.SMTP_EMAIL ?? 'admin@gmail.com',
                    is_verified: true,
                    role_id: 1,
                }
            })
        }
        console.log('Admin account seeded');
    }

    async seedPositions() {
        const isPositionExist = await this.prismaClient.position.findMany();
        if (!isPositionExist.length) {
            await this.prismaClient.position.createMany({
                data: [{
                    id: 1,
                    name: 'Kepala uks',
                    modules: 'healthcare'
                },
                {
                    id: 2,
                    name: 'petugas kesehatan',
                    modules: "healthcare"
                },
                ]
            })
        }
        console.log('Position Seeded');
    }
}