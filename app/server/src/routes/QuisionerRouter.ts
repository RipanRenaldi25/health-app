import { QuisionerService } from "../services/QuisionerService";
import { QuisionerController } from "../controllers/QuisionerController";
import { AuthorizationMiddleware } from "../middlewares/AuthorizationMiddleware";
import express, { Request, Response } from 'express';
import { prismaDBClient } from "../../config/prisma";

const quisionerService = new QuisionerService(prismaDBClient);
const quisionerController = new QuisionerController(quisionerService);

export const quisionerRouter = express.Router();

// Quisioner
quisionerRouter.get('/', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getAllQuisioners(req, res);
})

quisionerRouter.get('/:quisionerId', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getQuisionerById(req, res);
})

quisionerRouter.get('/stratifications/:stratification', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getQuisionerByStratifications(req, res);
})

quisionerRouter.get('/institutions/all', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getQuisionerByStratificationsBelongToSchool(req, res);
});

quisionerRouter.get('/categories/all', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.getQuisionerCategories(req, res);
})

quisionerRouter.get('/parents/all', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getQuisionerByStratificationsBelongToParent(req, res);
});

quisionerRouter.post('/', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.createQuisioner(req, res);
})

quisionerRouter.put('/:quisionerId', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.updateQuisionerById(req, res);
});

quisionerRouter.delete('/:quisionerId', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.deleteQuisionerById(req, res);
})


// Responses / Answers
quisionerRouter.post('/:quisionerId/responses', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.responseQuisioner(req, res);
});

quisionerRouter.get('/responses/:responseId', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getQuisionerResponseById(req, res);
});

quisionerRouter.get('/responses/institutions/:institutionId', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getQuisionerResponseByInstitutionId(req, res);
});

quisionerRouter.get('/responses/families/:familyMemberId', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getResponseByFamilyId(req, res);
});

quisionerRouter.get('/answers/all', AuthorizationMiddleware([]), (req: Request, res: Response) => {
    quisionerController.getAllResponses(req, res);
});

// Question
quisionerRouter.put('/:quisionerId/questions/:questionId', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.updateQuestionById(req, res);
})

quisionerRouter.delete('/:quisionerId/questions/:questionId', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.deleteQuestionById(req, res);
})
quisionerRouter.post('/:quisionerId/questions', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.addQuestionToQuisioner(req, res);
});

// options
quisionerRouter.put('/:quisionerId/questions/:questionId/options/:optionId', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.updateOptionById(req, res);
});

quisionerRouter.delete('/:quisionerId/questions/:questionId/options/:optionId', AuthorizationMiddleware(['admin']), (req: Request, res: Response) => {
    quisionerController.deleteOptionById(req, res);
});
