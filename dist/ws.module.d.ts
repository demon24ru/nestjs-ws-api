import { DynamicModule, HttpStatus, PipeTransform } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ExceptionFilterWs } from "./ws.interfaces";
export type IWsApiConfig = {
    validationConfig: PipeTransform;
    filterConfig?: ExceptionFilterWs;
    responseConfig?: any;
    validate: (socket: Socket) => Promise<HttpStatus>;
    authMessage?: (socket: Socket) => Promise<void>;
    publicConfig?: Record<string, any>;
};
export interface IWsApiConfigModule {
    useFactory: (...args: any[]) => Promise<IWsApiConfig> | IWsApiConfig;
    inject?: any[];
    imports?: any[];
}
export declare class WsModule {
    static registerAsync(options: IWsApiConfigModule): DynamicModule;
}
//# sourceMappingURL=ws.module.d.ts.map