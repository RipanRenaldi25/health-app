import { PrismaClient } from "@prisma/client";
import { IFacility, IHealthCare, IHealthCareMember, IHealthEducation, IHealthServicePayload, ISchoolEnvironment, IUKSQuisioner } from "../types/school";
import { InvariantError, NotFoundError } from "../common/exception";
import { AuthService } from "./AuthService";
import { calculateServiceScore, categorizeServiceScore } from "../common/utils/CalculateServiceScore";
import { IInstitution } from "../types/auth";

export class SchoolService {
    constructor(public prismaClient: PrismaClient, public authService: AuthService) { }
    // Health Education Services
    async createOrUpdateHealthEducation(schoolId: number, payload: IHealthEducation) {
        const { healthEducation } = await this.getHealthEducation(schoolId);
        if (!healthEducation) {
            return await this.createHealthEducation(schoolId, payload);
        }

        return await this.updateHealthEducation(schoolId, payload);
    }

    async createHealthEducation(schoolId: number, payload: IHealthEducation) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);

        const healthEducation = await this.prismaClient.healthEducation.create({
            data: {
                health_education_plan: payload.healthEducationPlan,
                health_education: payload.healthEducation,
                physical_education: payload.physicalEducation,
                cader_coaching: payload.caderCoaching,
                extracurricular_health_activities: payload.extracurricularHealthActivities,
                fitness_test: payload.fitnessTest,
                healthy_breakfast_program: payload.healthyBreakfastProgram,
                healthy_living_implementation: payload.healthyLivingImplementation,
                literacy_health_program: payload.literacyHealthProgram,
                nutrition_education: payload.nutritionEducation,
                parent_involvement: payload.parentInvolvement,
                physical_class_activities: payload.physicalClassActivities,
                school_id: schoolId,
                category_id: categorize_id,
                score: serviceScore,
            },
            include: {
                service_category: true
            }

        })

        return {
            healthEducation
        }
    }

    async updateHealthEducation(schoolId: number, payload: IHealthEducation) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);
        const { healthEducation } = await this.getHealthEducation(schoolId);
        if (!healthEducation) {
            throw new NotFoundError('Health Education not found');
        }

        const updatedHealthEducation = await this.prismaClient.healthEducation.update({
            where: {
                school_id: schoolId
            },
            data: {
                cader_coaching: payload.caderCoaching,
                extracurricular_health_activities: payload.extracurricularHealthActivities,
                fitness_test: payload.fitnessTest,
                health_education: payload.healthEducation,
                health_education_plan: payload.healthEducationPlan,
                healthy_breakfast_program: payload.healthyBreakfastProgram,
                healthy_living_implementation: payload.healthyLivingImplementation,
                literacy_health_program: payload.literacyHealthProgram,
                nutrition_education: payload.nutritionEducation,
                parent_involvement: payload.parentInvolvement,
                physical_class_activities: payload.physicalClassActivities,
                physical_education: payload.physicalEducation,
                score: serviceScore,
                category_id: categorize_id
            },
            include: {
                service_category: true
            }
        })

        return { healthEducation: updatedHealthEducation }
    }

    async getHealthEducation(schoolId: number) {
        const healthEducation = await this.prismaClient.healthEducation.findUnique({
            where: {
                school_id: schoolId
            },
            include: {
                service_category: true
            }
        });

        return { healthEducation };
    }


    // Health Services Service
    async createOrUpdateHealthServices(schoolId: number, payload: IHealthServicePayload) {
        const { healthService } = await this.getHealthService(schoolId);
        if (!healthService) {
            return await this.createHealthService(schoolId, payload);
        }

        return await this.updateHealthService(schoolId, payload);
    }

    async getHealthService(schoolId: number) {
        const healthService = await this.prismaClient.healthService.findUnique({
            where: {
                school_id: schoolId
            }
        });

        return {
            healthService
        }
    }

    async createHealthService(schoolId: number, payload: IHealthServicePayload) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);

        const healthService = await this.prismaClient.healthService.create({
            data: {
                health_check_routine: payload.healthCheckRoutine,
                referral_handling: payload.referralHandling,
                consuling_facility: payload.consulingFacility,
                periodic_screening_inspection: payload.periodicScreeningInspection,
                school_id: schoolId,
                category_id: categorize_id,
                score: serviceScore,
            },
            include: {
                service_category: true
            }
        });

        return { healthService };
    }

    async updateHealthService(schoolId: number, payload: IHealthServicePayload) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);
        const healthService = await this.prismaClient.healthService.update({
            where: {
                school_id: schoolId
            },
            data: {
                referral_handling: payload.referralHandling,
                consuling_facility: payload.consulingFacility,
                periodic_screening_inspection: payload.periodicScreeningInspection,
                health_check_routine: payload.healthCheckRoutine,
                score: serviceScore,
                category_id: categorize_id
            },
            include: {
                service_category: true
            }
        })

        return { healthService };
    }

    // School Environment Service
    async createOrUpdateSchoolEnvironment(schoolId: number, payload: ISchoolEnvironment) {
        const { schoolEnvironment } = await this.getSchoolEnvironment(schoolId);
        if (!schoolEnvironment) {
            return await this.createSchoolEnvironment(schoolId, payload);
        }

        return await this.updateSchoolEnvironment(schoolId, payload);
    }

    async getSchoolEnvironment(schoolId: number) {
        const schoolEnvironment = await this.prismaClient.schoolEnvironment.findUnique({
            where: {
                school_id: schoolId
            },
            include: {
                service_category: true
            }
        });

        return { schoolEnvironment };
    }

    async createSchoolEnvironment(schoolId: number, payload: ISchoolEnvironment) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);

        const schoolEnvironment = await this.prismaClient.schoolEnvironment.create({
            data: {
                canteen: payload.canteen,
                green_space: payload.greenSpace,
                trash_can: payload.trashCan,
                unprotected_area_policy: payload.unprotectedAreaPolicy,
                school_id: schoolId,
                category_id: categorize_id,
                score: serviceScore,
            },
            include: {
                service_category: true
            }
        });

        return { schoolEnvironment };
    }

    async updateSchoolEnvironment(schoolId: number, payload: ISchoolEnvironment) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);
        const schoolEnvironment = await this.prismaClient.schoolEnvironment.update({
            where: {
                school_id: schoolId
            },
            data: {
                canteen: payload.canteen,
                green_space: payload.greenSpace,
                trash_can: payload.trashCan,
                unprotected_area_policy: payload.unprotectedAreaPolicy,
                score: serviceScore,
                category_id: categorize_id
            },
            include: {
                service_category: true
            }
        });

        return { schoolEnvironment };
    }

    async createOrUpdateHealthCare(schoolId: number, payload: IHealthCare, senderEmail: string) {
        const { healthCare } = await this.getHealthCareBySchoolId(schoolId);
        if (!healthCare) {
            return await this.createInitHealthCare(schoolId, payload, senderEmail);
        }
        return await this.updateHealthCare(schoolId, payload);
    }

    async createInitHealthCare(schoolId: number, payload: IHealthCare, senderEmail: string) {
        const { healthCare } = await this.createHealthCare(schoolId, payload)
        await this.authService.sendEmailRegistration({ schoolId, healthCareId: healthCare.id, email: payload.email, name: payload.leadName, senderEmail, positionId: payload.positionId })
        return {
            healthCare
        }
    }

    async createHealthCare(schoolId: number, payload: IHealthCare) {
        const newHealthCare = await this.prismaClient.healthCare.create({
            data: {
                school_id: schoolId,
                lead_name: payload.leadName,
                name: payload.name,
            }
        });

        return {
            healthCare: newHealthCare
        }
    }

    async updateHealthCare(schoolId: number, payload: IHealthCare) {
        const updatedHealthCare = await this.prismaClient.healthCare.update({
            where: {
                school_id: schoolId
            },
            data: {
                lead_name: payload.leadName,
                name: payload.name
            }
        });

        return {
            healthCare: updatedHealthCare
        }
    }

    async getHealthCareBySchoolId(schoolId: number) {
        const healthCare = await this.prismaClient.healthCare.findUnique({
            where: {
                school_id: schoolId
            },
        });

        return { healthCare };
    }

    async addHealthCareMember(payload: IHealthCareMember) {
        const { healthCareMember } = await this.getHealthCareMemberByName(payload.name);

        if (payload.positionId === 1) {
            await this.ensureLeadPositionIsNotOccupied(payload.positionId);
        }

        if (!!healthCareMember) {
            throw new InvariantError('Health Care Member already exists');
        }

        const createdHealthCareMember = await this.prismaClient.healthCareMember.create({
            data: {
                name: payload.name,
                health_care: {
                    connect: {
                        id: payload.healthCareId
                    }
                },
                position: {
                    connect: {
                        id: payload.positionId
                    }
                },
                ...(payload.userId && ({
                    user: {
                        connect: {
                            id: payload.userId
                        }
                    }
                }))
            },
            include: {
                health_care: true,
                position: true,
                user: true
            }
        })

        return {
            healthCareMember: createdHealthCareMember
        };
    }

    async getHealthCareMemberByName(name: string) {
        const healthCareMember = await this.prismaClient.healthCareMember.findFirst({
            where: {
                name: {
                    contains: name
                }
            }
        });

        return {
            healthCareMember
        }
    }

    async ensureLeadPositionIsNotOccupied(positionId: number) {
        const position = await this.prismaClient.healthCareMember.findFirst({
            where: {
                position_id: positionId
            }
        });

        if (!!position) {
            throw new InvariantError('Lead Position is already occupied');
        }

        return {
            position
        }
    }


    async createFacility(schoolId: number, payload: IFacility, facilityType: number) {
        const facility = await this.prismaClient.schoolFacility.create({
            data: {
                name: payload.name,
                description: payload.description,
                school_id: schoolId,
                facility_type_id: facilityType
            },
            include: {
                facility_type: true
            }
        });

        return {
            facility
        }
    }

    async getFacilityBySchoolId(schoolId: number) {
        const facilities = await this.prismaClient.schoolFacility.findMany({
            where: {
                school_id: schoolId
            },
            include: {
                school: true,
                facility_type: true
            }
        });

        return {
            facilities
        }
    }

    async getFacilityById(facilityId: number, schoolId: number) {
        const facility = await this.prismaClient.schoolFacility.findUnique({
            where: {
                id: facilityId,
                school_id: schoolId
            },
            include: {
                facility_type: true,
                school: true
            }
        });

        return {
            facility
        }
    };

    async deleteFacility(facilityId: number, schoolId: number) {
        const deletedFacility = await this.prismaClient.schoolFacility.delete({
            where: {
                id: facilityId,
                school_id: schoolId
            },
            include: {
                facility_type: true,
                school: true
            }
        });

        return {
            facility: deletedFacility
        }
    }

    async updateFacility(facilityId: number, payload: IFacility & { facilityTypeId: number }, schoolId: number) {
        const { facility } = await this.getFacilityById(facilityId, schoolId);
        if (!facility) {
            throw new NotFoundError('Facility not found');
        };

        const updatedFacility = await this.prismaClient.schoolFacility.update({
            where: {
                id: facilityId,
                school_id: schoolId
            },
            data: {
                name: payload.name,
                description: payload.description,
                facility_type_id: payload.facilityTypeId
            },
            include: {
                facility_type: true,
                school: true
            }
        });

        return {
            facility: updatedFacility
        }
    }

    async createOrUpdateUKSQuisioner(schoolId: number, payload: IUKSQuisioner) {
        const { uksQuisioner } = await this.getUKSQuisioner(schoolId);
        if (!uksQuisioner) {
            return await this.createUKSQuisioner(schoolId, payload);
        }

        return await this.updateUKSQuisioner(schoolId, payload);
    }

    async createUKSQuisioner(schoolId: number, payload: IUKSQuisioner) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);

        const uksQuisioner = await this.prismaClient.uKSManagementQuisioner.create({
            data: {
                activity_plan: payload.activityPlan,
                budget: payload.budget,
                health_care_partnership: payload.healthCarePartnership,
                health_hand_book: payload.healthHandBook,
                health_kie: payload.healthKie,
                person_in_charge: payload.personInCharge,
                score: serviceScore,
                school_id: schoolId,
                sport_infrastructure: payload.sportInfrastructure,
                category_id: categorize_id
            },
            include: {
                service_category: true
            }
        });

        return {
            uksQuisioner
        }
    }

    async updateUKSQuisioner(schoolId: number, payload: IUKSQuisioner) {
        const serviceScore = calculateServiceScore(Object.values(payload));
        const categorize_id = categorizeServiceScore(serviceScore);
        const { uksQuisioner } = await this.getUKSQuisioner(schoolId);
        if (!uksQuisioner) {
            throw new NotFoundError('UKS Quisioner not found');
        }

        const updatedUKSQuisioner = await this.prismaClient.uKSManagementQuisioner.update({
            where: {
                school_id: schoolId
            },
            data: {
                activity_plan: payload.activityPlan,
                budget: payload.budget,
                health_care_partnership: payload.healthCarePartnership,
                health_hand_book: payload.healthHandBook,
                health_kie: payload.healthKie,
                person_in_charge: payload.personInCharge,
                score: serviceScore,
                sport_infrastructure: payload.sportInfrastructure,
                category_id: categorize_id
            },
            include: {
                service_category: true
            }
        });

        return {
            uksQuisioner: updatedUKSQuisioner
        }
    }

    async getUKSQuisioner(schoolId: number) {
        const uksQuisioner = await this.prismaClient.uKSManagementQuisioner.findUnique({
            where: {
                school_id: schoolId
            },
            include: {
                service_category: true
            }
        });

        return {
            uksQuisioner
        }
    }

    async getSchoolStratifications(schoolId: number) {
        const schoolStratification = await this.prismaClient.institution.findUnique({
            where: {
                id: schoolId
            },
            include: {
                health_education: {
                    include: {
                        service_category: true
                    }
                },
                health_service: {
                    include: {
                        service_category: true
                    }
                },
                school_environment: {
                    include: {
                        service_category: true
                    }
                },
                uks_management_quisioner: {
                    include: {
                        service_category: true
                    }
                }
            }
        });

        return {
            schoolStratification
        }
    }

    async getStudentLatestNutrition(schoolId: number) {
        const studentNutritions = await this.prismaClient.familyMember.findMany({
            where: {
                institution_id: schoolId,
                relation: 'ANAK',
            },
            include: {
                nutrition: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    },
                    include: {
                        nutrition_status: true
                    }
                }
            }
        });

        return { studentNutritions }
    }

    async getStudentWithNutritionStatus(schoolId: number, nutritionStatus: number) {
        const students = await this.prismaClient.familyMember.findMany({
            where: {
                institution_id: schoolId,
                relation: 'ANAK',
                nutrition: {
                    some: {
                        nutrition_status: {
                            id: nutritionStatus
                        }
                    }
                }
            },
            include: {
                nutrition: {
                    take: 1,
                    orderBy: {
                        created_at: 'desc'
                    },
                    include: {
                        nutrition_status: true
                    }
                }
            }
        });

        return { students }
    }


    async getAllSchools() {
        const schools = await this.prismaClient.institution.findMany({
            where: {
                type: 1
            }
        });

        return { schools }
    }

    async getSchoolById(schoolId: number) {
        const school = await this.prismaClient.institution.findUnique({
            where: {
                id: schoolId,
                type: 1
            }
        });

        return { school }
    }

    async updateSchool(schoolId: number, payload: IInstitution) {
        const { school } = await this.getSchoolById(schoolId);
        if (!school) {
            throw new NotFoundError('School not found');
        }
        const updatedSchool = await this.prismaClient.institution.update({
            where: {
                id: schoolId,
                type: 1
            },
            data: {
                ...school,
                name: payload.name,
                address: payload.address,
                phone_number: payload.phoneNumber,
                email: payload.email,
                head_name: payload.headName,
                head_nip: payload.headNIP
            }
        });

        return { school: updatedSchool }
    }

    async getStratifiedSchool(schoolId: number) {
        const { stratify: healthEducationStratification } = await this.getServiceStratification(schoolId, 'HEALTH_EDUCATION') ?? null;
        const { stratify: healthServiceStratification } = await this.getServiceStratification(schoolId, 'HEALTH_SERVICE') ?? null;
        const { stratify: schoolEnvironmentStratification } = await this.getServiceStratification(schoolId, 'SCHOOL_ENVIRONMENT') ?? null;
        const { stratify: uksStratification } = await this.getServiceStratification(schoolId, 'UKS_MANAGEMENT') ?? null;

        return {
            healthEducationStratification,
            healthServiceStratification,
            schoolEnvironmentStratification,
            uksStratification
        }
    }

    async getServiceStratification(schoolId: number, service: string) {
        const { stratify: isMinimal } = await this.checkHealthEducationStratification(schoolId, service, 'MINIMAL');
        const { stratify: isStandar } = await this.checkHealthEducationStratification(schoolId, service, 'STANDAR');
        const { stratify: isOptimal } = await this.checkHealthEducationStratification(schoolId, service, 'OPTIMAL');
        const { stratify: isParipurna } = await this.checkHealthEducationStratification(schoolId, service, 'PARIPURNA');
        if (isMinimal && isStandar && isOptimal && isParipurna) {
            return {
                stratify: 'PARIPURNA'
            }
        }
        if (isMinimal && isStandar && isOptimal) {
            return {
                stratify: 'OPTIMAL'
            }
        }
        if (isMinimal && isStandar) {
            return {
                stratify: 'STANDAR'
            }
        }
        return {
            stratify: 'MINIMAL'
        }
    }

    async getHealthEducationStratification(schoolId: number) {
        const { stratify } = await this.getServiceStratification(schoolId, 'HEALTH_EDUCATION');
        return {
            stratify
        }
    }

    async checkHealthEducationStratification(schoolId: number, service: string, stratification: 'MINIMAL' | 'STANDAR' | 'OPTIMAL' | 'PARIPURNA') {
        console.log({ schoolId, service, stratification })
        const serviceQuisioner = await this.prismaClient.question.findMany({
            where: {
                quisioner: {
                    stratification: `${service}_${stratification}`,
                    for: 'SCHOOL',
                }
            },
            include: {
                _count: true
            }
        });
        if (!serviceQuisioner.length) {
            throw new NotFoundError(`Quisioner is not found or not created yet for school with id ${schoolId} ${service}_${stratification}`);
        }
        const serviceAnswer = await this.prismaClient.answer.findMany({
            where: {
                response: {
                    institution_id: schoolId,
                    quisioner: {
                        stratification: `${service}_${stratification}`,
                        for: 'SCHOOL'
                    }
                }
            }
        });
        console.log({ serviceAnswer })

        if (!serviceAnswer.length) {
            throw new NotFoundError(`Answer is not found or not created yet by school with id ${schoolId} ${service}_${stratification}`);
        }


        const stratify = serviceQuisioner.length === serviceAnswer.length && serviceAnswer.every(answer => answer.boolean_value);
        return {
            stratify
        }

    }

}