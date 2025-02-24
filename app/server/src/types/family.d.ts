import { EDUCATION, GENDER, RELATION, RESIDENCESTATUS } from "@prisma/client";

export interface IFamily {
    headFamily: string;
    kkNumber: string?;
    headPhoneNumber: string;
    description: string?;
}

export interface IJob {
    income: number;
    jobTypeId: number;
}

export interface IResidence {
    id: number?;
    status: RESIDENCESTATUS,
    address: string?;
    description: string?;
}

export interface IKnowledgeNutritions {
    knowledge: string;
    score: int?
}

export interface INutrition {
    height: number;
    weight: number;
    bmi: number?;
    birth_weight: number?;
    createdBy: number;
    updatedBy: number;
}


export interface IBehaviour {
    eatFrequency: number;
    drinkFrequency: number;
    sleepQuality: number;
    physicalActivity: number;
    phbs: number;
}

export interface IFamilyMember {
    fullName: string;
    birthDate: Date;
    education: EDUCATION;
    job: IJOB & { id: number };
    knowledgeNutrition: (IKnowledgeNutritions & { id: number })?;
    residence: IResidence & { id: number }
    gender: GENDER;
    relation: RELATION;
    institutionId: number?;
    nutrition: INutrition;
    behaviour: IBehaviour?;
    phoneNumber: string?;
    class: string?;
    kkNumber: string?;
    description: string?;
    className: string?;
}


export interface IMember {
    fullName: string;
    birthDate: Date;
    education: EDUCATION;
    gender: GENDER;
    relation: RELATION;
    job: IJob;
    residence: IResidence?;
    nutrition: INutrition;
    institutionId: number?;
    class: string?;
    phoneNumber: string?;
    kkNumber: string?;
    description: string?;
}