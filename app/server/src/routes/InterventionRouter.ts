import express, { Request, Response } from "express";
import { AuthorizationMiddleware } from "../middlewares/AuthorizationMiddleware";
import { InterventionService } from "../services/InterventionService";
import { InterventionController } from "../controllers/InterventionController";
import { prismaDBClient } from "../../config/prisma";

const interventionService = new InterventionService(prismaDBClient);
const interventionController = new InterventionController(interventionService);

export const interventionRouter = express.Router();

interventionRouter.post(
  "/requests/:puskesmasId/members/:memberId",
  AuthorizationMiddleware(["admin", "healthcare", "school", "uks"]),
  async (req: Request, res: Response) => {
    interventionController.requestIntervention(req, res);
  }
);

interventionRouter.get(
  "/requests/:puskesmasId/schools/:schoolId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getRequestInterventionBelongToSchool(req, res);
  }
);

interventionRouter.get(
  "/requests/puskesmas/:puskesmasId/families/:familyId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getRequestInterventionBelongToFamily(req, res);
  }
);

interventionRouter.get(
  "/requests/puskesmas/:puskesmasId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getAllRequestIntervention(req, res);
  }
);

// Rueqst with JWT
interventionRouter.get(
  "/requests/healthcare",
  AuthorizationMiddleware(["staff-puskesmas", "healthcare"]),
  async (req: Request, res: Response) => {
    interventionController.getRequestBelongToHealthcare(req, res);
  }
);

interventionRouter.get(
  "/requests/:requestId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getRequestedInterventionById(req, res);
  }
);

interventionRouter.delete(
  "/requests/:requestId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.deleteRequestInterventionById(req, res);
  }
);

interventionRouter.put(
  "/requests/:requestId/puskesmas/:puskesmasId/members/:memberId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.updateRequestInterventionById(req, res);
  }
);

// Intervention
interventionRouter.post(
  "/puskesmas/:puskesmasId/requests/:requestInterventionId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.createIntervention(req, res);
  }
);

interventionRouter.get(
  "/:interventionId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getInterventionById(req, res);
  }
);

interventionRouter.get(
  "/families/:familyId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getInterventionBelongsToFamily(req, res);
  }
);

interventionRouter.get(
  "/schools/:schoolId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getInterventionsBelongToSchool(req, res);
  }
);

interventionRouter.get(
  "/puskesmas/:puskesmasId",
  AuthorizationMiddleware([]),
  async (req: Request, res: Response) => {
    interventionController.getInterventionsBelongToPuskesmas(req, res);
  }
);
