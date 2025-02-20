export interface IIntervention {
    recommendation: string;
    requestInterventionId: number;
    puskesmasId: number;
    createdBy: number;
    interventionDocumentUrl: string?
}

export interface IRequestIntervention {
    institutionId: number;
    familyId: number;
    createdBy: number;
    information: string;
    request_document_url: string?;
}
