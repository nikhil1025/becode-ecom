export declare enum NavigationType {
    CATEGORY = "CATEGORY",
    PAGE = "PAGE",
    CUSTOM = "CUSTOM"
}
export declare class CreateNavigationDto {
    type: NavigationType;
    refId?: string;
    label: string;
    url?: string;
    order?: number;
    description?: string;
    isActive?: boolean;
}
