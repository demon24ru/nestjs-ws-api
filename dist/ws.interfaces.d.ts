import { ExceptionFilter, HttpStatus } from "@nestjs/common";
export interface ExceptionFilterWs<T = any> extends ExceptionFilter {
    /**
     * Method to implement a custom exception filter.
     *
     * @param exception the class of the exception being handled
     * the in-flight request
     */
    catchWs(exception: T): {
        status: HttpStatus;
        body: string | object;
    };
}
//# sourceMappingURL=ws.interfaces.d.ts.map