import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ModuleRef } from '@nestjs/core';
import { IWsApiConfig } from './ws.module';
export declare class WsGateway implements OnGatewayConnection, OnGatewayInit {
    private moduleRef;
    private options;
    private readonly logger;
    private readonly validator;
    private readonly filter?;
    private readonly response?;
    server: Server;
    constructor(moduleRef: ModuleRef, options: IWsApiConfig);
    afterInit(): void;
    catchConnection(socket: Socket): void;
    handleConnection(socket: Socket): Promise<void>;
}
//# sourceMappingURL=ws.gateway.d.ts.map