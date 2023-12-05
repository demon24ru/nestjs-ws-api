import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  GatewayMetadata,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import EventsService from './ws.service';
import {HttpException, HttpStatus, Inject, Logger, PipeTransform, UnauthorizedException} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { WS_OPTIONS } from './ws.types';
import { IWsApiConfig } from './ws.module';
import {ExceptionFilterWs} from "./ws.interfaces";

@WebSocketGateway<GatewayMetadata>({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  path: '/ws-api',
})
export class WsGateway implements OnGatewayConnection, OnGatewayInit {
  private readonly logger = new Logger(WsGateway.name);
  private readonly validator: PipeTransform;
  private readonly filter?: ExceptionFilterWs;
  private readonly response?: any;

  @WebSocketServer()
  server!: Server;

  constructor(
    private moduleRef: ModuleRef,
    @Inject(WS_OPTIONS) private options: IWsApiConfig,
  ) {
    this.validator = options.validationConfig;
    this.filter = options.filterConfig;
    this.response = options.responseConfig;
  }

  afterInit() {
    EventsService.events.forEach((action) => {
      // Получаем контекст конкретного инициализированного класса где вызван был декоратор
      action.context = this.moduleRef.get(action.targetClass.constructor, {
        strict: false,
      });
      this.logger.log(
        `Add WS action: ${action.targetClass.constructor.name} => ${action.moduleName}:${action.actionName}`,
      );
    });
  }

  catchConnection(socket: Socket) {
    socket.offAny();
    socket.disconnect(true);
  }

  async handleConnection(socket: Socket): Promise<void> {
    const stat = await this.options.validate(socket);
    if (stat >= 400) {
      socket.emit('status', stat);
      this.catchConnection(socket)
      return;
    }

    for (const action of EventsService.events) {
      socket.on(
        `${action.moduleName}:${action.actionName}`,
        async (payload: any, response: (data: any) => void) => {
          try {

            !!this.options.authMessage && await this.options.authMessage(socket)

            const handler = action.handler.bind(action.context);

            if (action.metadata) {
              await this.validator.transform(payload, action.metadata);
            }

            const result = await handler(payload, socket);

            response(this.response ? new this.response(HttpStatus.OK, result) : { status: HttpStatus.OK, result });
          } catch (e) {
            this.logger.error(e);
            let status, body;

            if (this.filter) {
              const result = this.filter.catchWs(e)
              status = result.status
              body = result.body
            } else {
              status = HttpStatus.INTERNAL_SERVER_ERROR
              // @ts-ignore
              body = {error: e || e?.message}
            }

            response(this.response ? new this.response(status, body) : {status, body});

            (e instanceof UnauthorizedException) && this.catchConnection(socket)
          }
        }
      );
    }

    // пример передачи на фронт конфига с сервера, так же можно понять что АПИ готово для работы
    socket.emit('ready', { date: ~~((new Date()).getTime()/1000), ...this.options?.publicConfig });
  }
}
