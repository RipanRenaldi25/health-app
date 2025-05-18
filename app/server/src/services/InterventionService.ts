import { PrismaClient } from "@prisma/client";
import { IIntervention, IRequestIntervention } from "../types/puskesmas";
import { NotFoundError } from "../common/exception";

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
    const intervention = await this.prismaClient.requestIntervention.create({
      data: {
        puskesmas_id: payload.institutionId,
        created_by: payload.createdBy,
        family_member_id: payload.familyId,
        information: payload.information,
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
  async getRequestBelongToHealthcare(puskesmasId: number) {
    const healthCareRequest =
      await this.prismaClient.requestIntervention.findMany({
        where: {
          puskesmas_id: puskesmasId,
        },
        include: {
          family_member: true,
          user: {
            include: {
              institution: true,
            },
          },
        },
      });

    return { requests: healthCareRequest };
  }
}
