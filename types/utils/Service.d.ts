export function createService(defaults: any): {
    new (host: any, promise: any): {
        host: any;
        promise: any;
        state: string;
        setPromise(promise: any): void;
        setError(msg: any): void;
        errorMessage: any;
        request(params: any): any;
        data: any;
        /**
         * Use states individually, useful if you may need to render stuff in different locations
         */
        initialized(templateFn: any): any;
        pending(templateFn: any): any;
        success(templateFn: any): any;
        error(templateFn: any): any;
        /**
         * Combined render method, if you want to just render everything in place
         */
        render(templates: any): any;
    };
};
