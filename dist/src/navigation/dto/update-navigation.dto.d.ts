import { NavigationType } from './create-navigation.dto';
export declare class UpdateNavigationDto {
    type?: NavigationType;
    refId?: string;
    label?: string;
    url?: string;
    order?: number;
    description?: string;
    isActive?: boolean;
}
