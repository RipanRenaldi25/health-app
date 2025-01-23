import { boolean } from "joi";

export interface IHealthEducation {
    healthEducationPlan: boolean;
    healthEducation: boolean
    physicalEducation: boolean
    extracurricularHealthActivities: boolean
    literacyHealthProgram: boolean
    caderCoaching: boolean
    healthyBreakfastProgram: boolean
    physicalClassActivities: boolean
    fitnessTest: boolean
    nutritionEducation: boolean
    healthyLivingImplementation: boolean
    parentInvolvement: boolean
}

export interface IHealthServicePayload {
    healthCheckRoutine: boolean;
    referralHandling: boolean;
    consulingFacility: boolean;
    periodicScreeningInspection: boolean;
}

export interface ISchoolEnvironment {
    canteen: boolean;
    greenSpace: boolean;
    trashCan: boolean;
    unprotectedAreaPolicy: boolean;
}