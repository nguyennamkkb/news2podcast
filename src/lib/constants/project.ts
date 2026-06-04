export const PROJECT_STATUS_FILTERS = ["ALL", "DRAFT", "QUEUED", "GENERATING", "COMPLETED", "FAILED", "ARCHIVED"] as const;
export type ProjectStatusFilter = typeof PROJECT_STATUS_FILTERS[number];

export const PROJECT_STATUSES = ["DRAFT", "QUEUED", "GENERATING", "COMPLETED", "FAILED", "ARCHIVED"] as const;
export type ProjectStatus = typeof PROJECT_STATUSES[number];