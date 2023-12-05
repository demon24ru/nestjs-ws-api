# nestjs-ws-api

1) Turns a normal REST api into a websocket.
2) Accelerates api by 10 times due to one open ws channel.
3) Controllers also remain native swagger REST API.

## Setup
```npm install git://github.com/demon24ru/nestjs-ws-api.git```

or

```yarn add git://github.com/demon24ru/nestjs-ws-api.git```

then inside your `app.module.ts` add config:

```javascript
@Module({
  imports: [
    ConfigModule.forRoot(),
    WsModule.registerAsync({
      useFactory: (): IWsApiConfig => {
          return {
              validationConfig: new ValidationPipe(),
              filterConfig: new HttpExceptionFilter(),
              responseConfig: DefaultResponseWsDto,
              publicConfig: { hello: 'world' },
              async validate(socket: Socket): Promise<HttpStatus> {
                  // console.log(new ExecutionContextHost([socket]));
                  console.log(socket.handshake);
                  const { token } = socket.handshake.auth;
                  try {
                      if (token) {
                          socket.data.user = verifyToken(token, process.env.JWT_PRIVATE_KEY)
                          return HttpStatus.OK
                      }
                  } catch (e) {
                      console.error(e)
                  }
                  return HttpStatus.UNAUTHORIZED;
              },
              async authMessage(socket: Socket): Promise<void> {
                  // console.log(new ExecutionContextHost([socket]))
                  console.log(socket.data)
                  if (socket.data?.user?.exp && socket.data?.user?.exp > (new Date()).getTime()/1000)
                      return;
                  throw new UnauthorizedException('Unauthorized');
              }
          };
      }
    }),
  ],
})
export class AppModule {}
```

And more use in controllers
```javascript
  @Get(':id')
  @WsAction('user')
  getUser(@Param('id', ParseIntPipe) id: number): UserDto {
    return this.appService.getUser(id);
  }
```

See full demo https://github.com/gustoase/nestjs-ws-api-demo

## License
MIT
