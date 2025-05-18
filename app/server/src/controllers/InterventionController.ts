import { Request, Response } from "express";
import { InterventionService } from "../services/InterventionService";
import { handleError, validatePayload } from "../common/http";
import { InvariantError } from "../common/exception";
import {
  createInterventionSchema,
  requestInterventionSchema,
} from "../common/http/requestvalidator/InterventionValidator";
import { REQUESTSTATUS } from "@prisma/client";

export class InterventionController {
  constructor(public interventionService: InterventionService) {}

  async requestIntervention(req: Request, res: Response) {
    try {
      validatePayload(requestInterventionSchema, req.body);
      const { puskesmasId, memberId } = req.params;
      if (!puskesmasId || !memberId) {
        throw new InvariantError(
          "Puskesmas ID and  Member ID must be provided"
        );
      }
      const { information } = req.body;
      const user = (req as any).user;
      const { intervention } =
        await this.interventionService.requestIntervention({
          createdBy: user.id,
          familyId: +memberId,
          institutionId: +puskesmasId,
          information,
        });
      res.status(201).json({
        status: "Success",
        message: `Request Intervention to Puskesmas ${puskesmasId} for member ${memberId} created successfully`,
        data: intervention,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getRequestInterventionBelongToSchool(req: Request, res: Response) {
    try {
      const { puskesmasId, schoolId } = req.params;
      if (!puskesmasId || !schoolId) {
        throw new InvariantError(
          "Puskesmas ID and schoolId must be provided in params"
        );
      }
      const { requestInterventions } =
        await this.interventionService.getRequestedInterventionBelongToSchool(
          +puskesmasId,
          +schoolId
        );
      res.status(200).json({
        status: "Success",
        message: `Request Intervention fetched successfully`,
        data: requestInterventions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getRequestInterventionBelongToFamily(req: Request, res: Response) {
    try {
      const { puskesmasId, familyId } = req.params;
      if (!puskesmasId || !familyId) {
        throw new InvariantError(
          "Puskesmas ID and Family ID must be provided in params"
        );
      }
      const { requestInterventions } =
        await this.interventionService.getRequestInterventionBelongToFamily(
          +puskesmasId,
          +familyId
        );
      res.status(200).json({
        status: "Success",
        message: `Request Intervention fetched successfully`,
        data: requestInterventions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getAllRequestIntervention(req: Request, res: Response) {
    try {
      const { puskesmasId } = req.params;
      if (!puskesmasId) {
        throw new InvariantError("Puskesmas ID must be provided in params");
      }
      const { requestInterventions } =
        await this.interventionService.getAllRequestInterventionBelongToInstitution(
          +puskesmasId
        );
      res.status(200).json({
        status: "Success",
        message: `Request Intervention fetched successfully`,
        data: requestInterventions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getRequestedInterventionById(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      if (!requestId) {
        throw new InvariantError("Intervention ID must be provided in params");
      }
      const { intervention } =
        await this.interventionService.getRequestInterventionById(+requestId);

      res.status(200).json({
        status: "Success",
        message: "Intervention fetched successfully",
        data: intervention,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async deleteRequestInterventionById(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      if (!requestId) {
        throw new InvariantError("Intervention ID must be provided in params");
      }
      const { intervention } =
        await this.interventionService.deleteRequestInterventionById(
          +requestId
        );
      res.status(200).json({
        status: "Success",
        message: "Intervention deleted successfully",
        data: intervention,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async updateRequestInterventionById(req: Request, res: Response) {
    try {
      validatePayload(requestInterventionSchema, req.body);
      const { requestId, puskesmasId, memberId } = req.params;
      if (!requestId) {
        throw new InvariantError("Intervention ID must be provided in params");
      }
      const user = (req as any).user;
      const { information } = req.body;
      const { intervention } =
        await this.interventionService.updateRequestInterventionById(
          +requestId,
          {
            institutionId: +puskesmasId,
            familyId: +memberId,
            createdBy: user.id,
            information,
          }
        );
      res.status(200).json({
        status: "Success",
        message: "Intervention updated successfully",
        data: intervention,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async createIntervention(req: Request, res: Response) {
    try {
      validatePayload(createInterventionSchema, req.body);
      const { requestInterventionId, puskesmasId } = req.params;
      if (!requestInterventionId || !puskesmasId) {
        throw new InvariantError(
          "Request Intervention ID and Puskesmas ID must be provided in params"
        );
      }
      const { recommendation } = req.body;
      const user = (req as any).user;

      const { intervention } =
        await this.interventionService.createIntervention({
          createdBy: user.id,
          requestInterventionId: +requestInterventionId,
          puskesmasId: +puskesmasId,
          recommendation,
        });

      res.status(201).json({
        status: "Success",
        message: "Intervention created successfully",
        data: intervention,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getInterventionById(req: Request, res: Response) {
    try {
      const { interventionId } = req.params;
      if (!interventionId) {
        throw new InvariantError("Intervention ID must be provided in params");
      }
      const { intervention } =
        await this.interventionService.getInterventionById(+interventionId);
      res.status(200).json({
        status: "Success",
        message: "Intervention fetched successfully",
        data: intervention,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getInterventionBelongsToFamily(req: Request, res: Response) {
    try {
      const { familyId } = req.params;
      if (!familyId) {
        throw new InvariantError("Family ID must be provided in params");
      }
      const { interventions } =
        await this.interventionService.getInterventionsBelongToFamily(
          +familyId
        );
      res.status(200).json({
        status: "Success",
        message: "Interventions fetched successfully",
        data: interventions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getInterventionsBelongToPuskesmas(req: Request, res: Response) {
    try {
      const { puskesmasId } = req.params;
      if (!puskesmasId) {
        throw new InvariantError("Institution ID must be provided");
      }

      const { interventions } =
        await this.interventionService.getInterventionsBelongToPuskesmas(
          +puskesmasId
        );

      res.status(200).json({
        status: "Success",
        message: "Interventions fetched successfully",
        data: interventions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getInterventionsBelongToSchool(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      if (!schoolId) {
        throw new InvariantError("Institution ID must be provided");
      }

      const { interventions } =
        await this.interventionService.getInterventionBelongsToSchool(
          +schoolId
        );

      res.status(200).json({
        status: "Success",
        message: "Interventions fetched successfully",
        data: interventions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getRequestBelongToHealthcare(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { startDate, endDate, status } = req.query;
      const { requests } =
        await this.interventionService.getRequestBelongToHealthcare(user.id, {
          startDate: startDate as string,
          endDate: endDate as string,
          status: status as REQUESTSTATUS,
        });
      res.status(200).json({
        status: "Success",
        message: "Request retrieved",
        data: requests,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getRequestSummaryBelongToHeallthCare(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { totalActions, totalRequest, totalPendingRequest } =
        await this.interventionService.getRequestSummaryBelongToHeallthCare(
          user.id
        );
      res.status(200).json({
        status: "Success",
        message: "Request Summary retrieved",
        data: {
          totalAction: totalActions,
          totalRequest,
          totalPendingRequest,
        },
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }

  async getSchoolNutritionSummary(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { nutritions } =
        await this.interventionService.getSchoolNutritionSummary(user.id);
      res.status(200).json({
        status: "Success",
        message: "Nutrition summary fetched",
        data: nutritions,
      });
    } catch (err: any) {
      handleError(err, res);
    }
  }
}
