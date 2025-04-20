import { PrismaClient, QUESTIONTYPE } from "@prisma/client";
import bcrypt from "bcrypt";
import { seedQuisionerQuestions } from "./Seed";
import { schoolQuisionerQuestions } from "./Seed/SchoolQuisioner";
export const roles = [
  {
    id: 1,
    name: "admin",
  },
  {
    id: 2,
    name: "school",
  },
  {
    id: 3,
    name: "healthcare",
  },
  {
    id: 4,
    name: "parent",
  },
  {
    id: 5,
    name: "uks",
  },
  {
    id: 6,
    name: "teacher",
  },
  {
    id: 7,
    name: "staff-puskesmas",
  },
];

export class SeedService {
  constructor(public prismaClient: PrismaClient) {}

  async seed() {
    await Promise.all([
      await this.seedRole(),
      await this.seedInstitutionType(),
      await this.seedPositions(),
      await this.seedAdminAccount(),
      await this.seedNutritionStatus(),
      await this.seedKIEtype(),
      await this.seedFacilityType(),
      await this.seedCategoryStratification(),
      await this.seedJobType(),
      await this.seedQuisioners(),
    ]);
  }

  async seedRole() {
    const isRoleExist = await this.prismaClient.role.findMany();
    if (isRoleExist.length === 0) {
      await this.prismaClient.role.createMany({
        data: roles,
      });
    }
    console.log("Role seeded");
  }

  async seedInstitutionType() {
    const isInstitutionTypeExists =
      await this.prismaClient.institutionType.findMany();
    if (isInstitutionTypeExists.length === 0) {
      await this.prismaClient.institutionType.createMany({
        data: [
          {
            id: 1,
            name: "school",
          },
          {
            id: 2,
            name: "healthcare",
          },
        ],
      });
    }
    console.log("Institution Type seeded");
  }

  async seedAdminAccount() {
    const isUserExist = await this.prismaClient.user.findMany();
    if (!isUserExist.length) {
      await this.prismaClient.user.create({
        data: {
          id: 1,
          // username: process.env.ADMIN_USERNAME ?? 'admin',
          username: "admin",
          password: bcrypt.hashSync("admin", 10),
          email: "admin@gmail.com",
          is_verified: true,
          role_id: 1,
        },
      });
    }
    console.log("Admin account seeded");
  }

  async seedPositions() {
    const isPositionExist = await this.prismaClient.position.findMany();
    if (!isPositionExist.length) {
      await this.prismaClient.position.createMany({
        data: [
          {
            id: 1,
            name: "Kepala uks",
            modules: "healthcare",
          },
          {
            id: 2,
            name: "petugas kesehatan",
            modules: "healthcare",
          },
        ],
      });
    }
    console.log("Position Seeded");
  }

  async seedNutritionStatus() {
    const isNutritionStatusExist =
      await this.prismaClient.nutritionStatus.findMany();
    if (!isNutritionStatusExist.length) {
      await this.prismaClient.nutritionStatus.createMany({
        data: [
          {
            id: 1,
            status: "KURUS",
            information: "Kekurangan bb tingkat berat",
          },
          {
            id: 2,
            status: "KURUS",
            information: "Kekurangan bb tingkat ringan",
          },
          {
            id: 3,
            status: "NORMAL",
            information: "Gizi normal",
          },
          {
            id: 4,
            status: "GEMUK",
            information: "Kelebihan bb tingkat ringan",
          },
          {
            id: 5,
            status: "GEMUK",
            information: "Kelebihan bb tingkat berat",
          },
        ],
      });
    }
    console.log("Nutrition Status Seeded");
  }

  async seedKIEtype() {
    const isKIETypeExist = await this.prismaClient.kIEType.findMany();
    if (!isKIETypeExist.length) {
      await this.prismaClient.kIEType.createMany({
        data: [
          {
            id: 1,
            name: "Article",
          },
          {
            id: 2,
            name: "Poster",
          },
          {
            id: 3,
            name: "Video",
          },
        ],
      });
    }
    console.log("KIE Type Seeded");
  }

  async seedFacilityType() {
    const facilities = await this.prismaClient.facilityType.findMany();
    if (!facilities.length) {
      await this.prismaClient.facilityType.createMany({
        data: [
          {
            id: 1,
            name: "Kesehatan",
          },
          {
            id: 2,
            name: "Pendidikan",
          },
          {
            id: 3,
            name: "Lingkungan",
          },
          {
            id: 4,
            name: "Pelayanan",
          },
          {
            id: 5,
            name: "Olahraga",
          },
        ],
      });
    }
  }

  async seedCategoryStratification() {
    const categories = await this.prismaClient.serviceCategory.findMany();
    if (!categories.length) {
      await this.prismaClient.serviceCategory.createMany({
        data: [
          {
            id: 1,
            name: "Minimal",
          },
          {
            id: 2,
            name: "Standar",
          },
          {
            id: 3,
            name: "Optimal",
          },
          {
            id: 4,
            name: "Paripurna",
          },
        ],
      });
    }
    console.log("Category Stratification Seeded");
  }

  async seedJobType() {
    const jobTypes = await this.prismaClient.jobType.findMany();
    if (!jobTypes.length) {
      await this.prismaClient.jobType.createMany({
        data: [
          {
            id: 1,
            type: "TIDAK_BEKERJA_BURUH_SEJENISNYA",
            name: "Tidak bekerja/buruh dan sejenisnya",
          },
          {
            id: 2,
            type: "PEKERJA_HONORER_KONTRAK",
            name: "Pekerja honorer/kontrak",
          },
          {
            id: 3,
            type: "PEGAWAI_NEGERI_KARYAWAN_SWASTA",
            name: "Pegawai negeri/karyawan swasta",
          },
        ],
      });
    }

    console.log("Job Type Seeded");
  }

  async seedQuisioners() {
    await Promise.all([this.seedParentQuisioner(), this.seedSchoolQuisioner()]);
  }

  async seedParentQuisioner() {
    for (const quisionerData of seedQuisionerQuestions) {
      const existingQuisioner = await this.prismaClient.quisioner.findFirst({
        where: { title: quisionerData.title },
      });

      if (!existingQuisioner) {
        await this.prismaClient.$transaction(async (tx) => {
          const newQuisioner = await tx.quisioner.create({
            data: {
              title: quisionerData.title,
              description: quisionerData.description,
              for: quisionerData.for,
            },
          });

          for (const questionData of quisionerData.questions) {
            const newQuestion = await tx.question.create({
              data: {
                quisioner_id: newQuisioner.id,
                question: questionData.question,
                type: questionData.type as QUESTIONTYPE,
                is_required: questionData.isRequired,
              },
            });

            if (questionData.options) {
              await tx.option.createMany({
                data: questionData.options.map((option) => ({
                  question_id: newQuestion.id,
                  title: option.title,
                  score: option.score,
                })),
              });
            }
          }
        });
        console.log(`Quisioner "${quisionerData.title}" has been seeded.`);
      }
    }

    console.log("Parent Quisioner Seeded");
  }

  async seedSchoolQuisioner() {
    for (const quisionerData of schoolQuisionerQuestions) {
      const existingQuisioner = await this.prismaClient.quisioner.findFirst({
        where: { stratification: quisionerData.stratification },
      });

      if (!existingQuisioner) {
        await this.prismaClient.$transaction(async (tx) => {
          const newQuisioner = await tx.quisioner.create({
            data: {
              title: quisionerData.title,
              description: quisionerData.description,
              for: quisionerData.for,
              stratification: quisionerData.stratification,
            },
          });

          for (const questionData of quisionerData.questions) {
            const newQuestion = await tx.question.create({
              data: {
                quisioner_id: newQuisioner.id,
                question: questionData.question,
                type: questionData.type as QUESTIONTYPE,
                is_required: questionData.isRequired,
              },
            });

            if (questionData.options) {
              await tx.option.createMany({
                data: questionData.options.map((option) => ({
                  question_id: newQuestion.id,
                  title: option.title,
                  score: option.score,
                })),
              });
            }
          }
        });
        console.log(`Quisioner "${quisionerData.title}" has been seeded.`);
      }
    }
    console.log("School Quisioner Seeded");
  }
}
