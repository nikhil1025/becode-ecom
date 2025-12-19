import { HomeService } from './home.service';
export declare class HomeController {
    private homeService;
    constructor(homeService: HomeService);
    getHomePage(): Promise<any>;
}
