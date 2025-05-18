import { Prisma, PrismaClient, REQUESTSTATUS } from "@prisma/client";
import { NotFoundError } from "../common/exception";
import { IIntervention, IRequestIntervention } from "../types/puskesmas";

export class InterventionService {
  constructor(public prismaClient: PrismaClient) {}

  async requestIntervention(payload: IRequestIntervention) {
    const puskesmas = await this.prismaClient.institution.findUnique({
      where: {
        id: payload.institutionId,
        type: 2,
      },
    });
    if (!puskesmas) {
      throw new NotFoundError("Puskesmas not found");
    }
    const teacher = await this.prismaClient.teacher.findUnique({
      where: {
        user_id: payload.createdBy,
      },
    });
    if (!teacher) {
      throw new NotFoundError(
        "Cannot create request because user is not a teacher"
      );
    }
    const intervention = await this.prismaClient.requestIntervention.create({
      data: {
        puskesmas_id: payload.institutionId,
        created_by: payload.createdBy,
        family_member_id: payload.familyId,
        information: payload.information,
        school_id: teacher.school_id,
      },
      include: {
        institution: true,
        family_member: true,
        user: {
          include: {
            institution: true,
          },
        },
      },
    });

    return { intervention };
  }

  async createIntervention(payload: IIntervention) {
    const intervention = await this.prismaClient.intervention.create({
      data: {
        recommendation: payload.recommendation,
        request_intervention_id: payload.requestInterventionId,
        puskesmas_id: payload.puskesmasId,
        created_by: payload.createdBy,
      },
      include: {
        institution: true,
        program: true,
        user: {
          include: {
            institution: true,
          },
        },
        request_intervention: true,
      },
    });

    return { intervention };
  }

  async getRequestedInterventionBelongToSchool(
    puskesmasId: number,
    schoolId: number
  ) {
    const requestInterventions =
      await this.prismaClient.requestIntervention.findMany({
        where: {
          AND: [
            {
              puskesmas_id: puskesmasId,
            },
            {
              user: {
                institution: {
                  id: schoolId,
                },
              },
            },
          ],
        },
        include: {
          family_member: true,
          user: {
            include: {
              institution: true,
            },
          },
          institution: true,
          intervention: true,
        },
      });

    return { requestInterventions };
  }

  async getRequestInterventionBelongToFamily(
    puskesmasId: number,
    familyId: number
  ) {
    const requestInterventions =
      await this.prismaClient.requestIntervention.findMany({
        where: {
          puskesmas_id: puskesmasId,
          family_member: {
            family: {
              id: familyId,
            },
          },
        },
        include: {
          family_member: {
            include: {
              family: true,
            },
          },
          user: {
            include: {
              institution: true,
            },
          },
          institution: true,
          intervention: true,
        },
      });

    return { requestInterventions };
  }

  async getAllRequestInterventionBelongToInstitution(puskesmasId: number) {
    const requestInterventions =
      await this.prismaClient.requestIntervention.findMany({
        where: {
          puskesmas_id: puskesmasId,
        },
        include: {
          family_member: {
            include: {
              family: true,
            },
          },
          user: {
            include: {
              institution: true,
            },
          },
          institution: true,
          intervention: true,
        },
      });

    return { requestInterventions };
  }

  async getRequestInterventionById(interventionId: number) {
    const intervention = await this.prismaClient.requestIntervention.findUnique(
      {
        where: {
          id: interventionId,
        },
        include: {
          user: {
            include: {
              institution: true,
            },
          },
          family_member: true,
          intervention: true,
        },
      }
    );

    return { intervention };
  }

  async deleteRequestInterventionById(interventionId: number) {
    const intervention = await this.prismaClient.requestIntervention.delete({
      where: {
        id: interventionId,
      },
    });
    return { intervention };
  }

  async updateRequestInterventionById(
    interventionId: number,
    payload: IRequestIntervention
  ) {
    const { intervention: isInterventionExist } =
      await this.getRequestInterventionById(interventionId);
    if (!isInterventionExist) {
      throw new NotFoundError("Intervention not found");
    }
    const intervention = await this.prismaClient.requestIntervention.update({
      where: {
        id: interventionId,
      },
      data: {
        puskesmas_id: payload.institutionId,
        family_member_id: payload.familyId,
        created_by: payload.createdBy,
        information: payload.information,
      },
    });
    return { intervention };
  }

  async getInterventionById(interventionId: number) {
    const intervention = await this.prismaClient.intervention.findUnique({
      where: {
        id: interventionId,
      },
      include: {
        institution: true,
        program: true,
        user: true,
        request_intervention: true,
      },
    });

    return { intervention };
  }

  async getInterventionsBelongToFamily(familyId: number) {
    const interventions = await this.prismaClient.intervention.findMany({
      where: {
        request_intervention: {
          family_member: {
            family: {
              id: familyId,
            },
          },
        },
      },
      include: {
        request_intervention: true,
        user: {
          include: {
            institution: true,
          },
        },
      },
    });
    return { interventions };
  }

  async getInterventionsBelongToPuskesmas(puskesmasId: number) {
    const interventions = await this.prismaClient.intervention.findMany({
      where: {
        institution: {
          id: puskesmasId,
        },
      },
      include: {
        institution: true,
        program: true,
        user: true,
        request_intervention: {
          include: {
            family_member: true,
            user: true,
          },
        },
      },
    });

    return { interventions };
  }

  async getInterventionBelongsToSchool(schoolId: number) {
    const interventions = await this.prismaClient.intervention.findMany({
      where: {
        request_intervention: {
          user: {
            institution: {
              id: schoolId,
            },
          },
        },
      },
      include: {
        request_intervention: true,
        user: {
          include: {
            institution: true,
          },
        },
        institution: true,
      },
    });

    return { interventions };
  }

  // GET WITH JWT
  async getRequestBelongToHealthcare(
    userId: number,
    query: {
      startDate?: string;
      endDate?: string;
      status?: REQUESTSTATUS;
      page?: number;
      show?: number;
    }
  ) {
    const staff = await this.prismaClient.staff.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!staff) {
      throw new NotFoundError("Staff not found");
    }
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const show = query.show ?? 10;
    const page = query.page ?? 1;
    const skip = show * (page - 1);
    console.log({ skip });

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;
    const healthCareRequest =
      await this.prismaClient.requestIntervention.findMany({
        where: {
          puskesmas_id: staff.health_care_id,
          ...(Object.keys(dateFilter).length && { created_at: dateFilter }),
          ...(query.status && { status: query.status }),
        },
        include: {
          family_member: true,
          user: {
            include: {
              institution: true,
            },
          },
        },
        take: show,
        skip,
      });

    const whereFilter = {
      puskesmas_id: staff.health_care_id,
      ...(Object.keys(dateFilter).length && { created_at: dateFilter }),
      ...(query.status && { status: query.status }),
    };

    const total = await this.prismaClient.requestIntervention.count({
      where: whereFilter,
    });

    return { requests: healthCareRequest, currentPage: page, show, total };
  }

  async getRequestSummaryBelongToHeallthCare(userId: number) {
    const user = await this.prismaClient.staff.findUnique({
      where: {
        user_id: userId,
      },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const totalRequest = await this.prismaClient.requestIntervention.count({
      where: {
        puskesmas_id: user.health_care_id,
      },
    });
    const totalActions = await this.prismaClient.intervention.count({
      where: {
        puskesmas_id: user.health_care_id,
      },
    });
    const totalPendingRequest =
      await this.prismaClient.requestIntervention.count({
        where: {
          puskesmas_id: user.health_care_id,
          status: "PENDING",
        },
      });

    return {
      totalRequest,
      totalActions,
      totalPendingRequest,
    };
  }

  async getSchoolNutritionSummary(userId: number) {
    const user = await this.prismaClient.staff.findUnique({
      where: {
        user_id: userId,
      },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const requestedSchool =
      await this.prismaClient.requestIntervention.findMany({
        distinct: "school_id",
      });
    const schoolIds = requestedSchool
      .map((request) => request.school_id)
      .filter(Boolean);

    const nutritions: any[] = await this.prismaClient.$queryRaw`
      SELECT n.status_id, CASE
      WHEN n.status_id = 1 THEN "Kekurangan Gizi Tingkat Berat"
      WHEN n.status_id = 2 THEN "Kekurangan Gizi Tingkat Ringan"
      WHEN n.status_id = 3 THEN "Gizi Normal"
      WHEN n.status_id = 4 THEN "Beresiko Kelebihan Gizi Tingkat Ringan"
      WHEN n.status_id = 5 THEN "Beresiko Kelebihan Gizi Tingkat Berat"
      ELSE "Tidak Diketahui"
      END AS "nutrition_status",
      COUNT(n.id) as total
      FROM nutritions as n
      JOIN family_members fm ON n.family_member_id = fm.id
      JOIN institutions i ON fm.institution_id = i.id
      JOIN families f ON fm.family_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE i.id IN (${Prisma.join(schoolIds)})
      GROUP BY n.status_id
      `;

    //     const nutritions = await this.prismaClient.$queryRawUnsafe(`
    //   SELECT
    //     n.status_id,
    //     CASE
    //       WHEN n.status_id = 1 THEN 'Kekurangan Gizi Tingkat Berat'
    //       WHEN n.status_id = 2 THEN 'Kekurangan Gizi Tingkat Ringan'
    //       WHEN n.status_id = 3 THEN 'Gizi Normal'
    //       WHEN n.status_id = 4 THEN 'Beresiko Kelebihan Gizi Tingkat Ringan'
    //       WHEN n.status_id = 5 THEN 'Beresiko Kelebihan Gizi Tingkat Berat'
    //       ELSE 'Tidak Diketahui'
    //     END AS nutrition_status,
    //     COUNT(*) AS total
    //   FROM nutritions n
    //   JOIN family_members fm ON n.family_member_id = fm.id
    //   JOIN institutions i ON fm.institution_id = i.id
    //   JOIN families f ON fm.family_id = f.id
    //   JOIN users u ON f.user_id = u.id
    //   WHERE i.id IN (${Prisma.join(schoolIds)})
    //   GROUP BY n.status_id;
    // `);

    return {
      nutritions: nutritions.map((nutrition) => ({
        ...nutrition,
        total: +nutrition.total.toString(),
      })),
    };
  }
}
