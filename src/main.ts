import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./exception.filter";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";
import ngrok from "ngrok";
import { TelegramAdapter } from "./utils/telegram.adapter/telegram.adapter";

const axios = require("axios");

const appSettings = (app: INestApplication) => {
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(
      {
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const errorsForResponse = [];
          console.log(errors, "ERRORS");

          errors.forEach(e => {
            const constrainedKeys = Object.keys(e.constraints);
            //console.log(constrainedKeys, "constrainedKeys");
            constrainedKeys.forEach((ckey) => {
              errorsForResponse.push({
                message: e.constraints[ckey],
                field: e.property
              });
              console.log(errorsForResponse, "errorsForResponse");

            });

          });
          throw new BadRequestException(errorsForResponse);
        }
      }
    )
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
};

async function connectToNgrok() {
  try {
    //ngrok config add-authtoken 2Nmf1p0bshnqknYHXgYe5mYGLub_4g4TnaAGFDp5YJJjNUoFB
    const url = await ngrok.connect(8080);
    console.log(url, " url");
    return url;
  } catch (e) {
    console.error("Connect to ngrok error:");
    console.log(e);
  }

}



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  const telegramAdapter = await app.resolve<TelegramAdapter>(TelegramAdapter)
  /*const config = new DocumentBuilder()
    .setTitle('social-network example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('social-network')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);*/
  const port = 8080;
  await app.listen(port);
  console.log(`app started working on ${port} port`);

  const baseUrl = await connectToNgrok();
  console.log(baseUrl, " baseUrl");
  await telegramAdapter.sendOurHookToTelegram(baseUrl + "/telegram/notifications/hook");
}

bootstrap();
