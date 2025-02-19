import joi from 'joi';

export const createFacilitySchema = joi.object({
    name: joi.string().required(),
    description: joi.string(),
    facilityTypeId: joi.number().required()
});

export const createUKSQuisionerSchema = joi.object({
    healthHandBook: joi.boolean().required(),
    personInCharge: joi.boolean().required(),
    healthKie: joi.boolean().required(),
    sportInfrastructure: joi.boolean().required(),
    budget: joi.boolean().required(),
    healthCarePartnership: joi.boolean().required(),
    activityPlan: joi.boolean().required()
})

export const createSchoolSchema = joi.object({
    name: joi.string(),
    address: joi.string(),
    phone: joi.string(),
    email: joi.string().email(),
    headName: joi.string(),
    headNIP: joi.string(),
    licenseDocument: joi.string()
})