import { BullModule } from '@nestjs/bullmq';
import { Global, Inject, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisService } from 'ampersand-common-module';
import { NextFunction, Request, Response } from 'express';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdmissionController } from './feature/admission/admission.controller';
import { AdmissionModule } from './feature/admission/admission.module';
import { AuthModule } from './feature/auth/auth.module';
import { CompetencyTestController } from './feature/competencyTest/competencyTest.controller';
import { CompetencyTestModule } from './feature/competencyTest/competencyTest.module';
import { CronModule } from './feature/cron/cron.module';
import { DashboardModule } from './feature/dashboard/dashboard.module';
import { DataImportModule } from './feature/dataImport/dataImport.module';
import { AppEnquiryController } from './feature/enquiry/app/appEnquiry.controller';
import { AppEnquiryModule } from './feature/enquiry/app/appEnquiry.module';
import { EnquiryController } from './feature/enquiry/enquiry.controller';
import { EnquiryModule } from './feature/enquiry/enquiry.module';
import { EnquiryLogModule } from './feature/enquiryLog/enquiryLog.module';
import { EnquiryStageController } from './feature/enquiryStage/enquiryStage.controller';
import { EnquiryStageModule } from './feature/enquiryStage/enquiryStage.module';
import { EnquiryTypeController } from './feature/enquiryType/enquiryType.controller';
import { EnquiryTypeModule } from './feature/enquiryType/enquiryType.module';
import { ExternalEnquiryModule } from './feature/external/enquiry/externalEnquiry.module';
import { ExternalEnquiryTypeModule } from './feature/external/enquiryType/externalEnquiryType.module';
import { FollowUpController } from './feature/followUp/followUp.controller';
import { FollowUpModule } from './feature/followUp/followUp.module';
import { MyTaskController } from './feature/myTask/myTask.controller';
import { MyTaskModule } from './feature/myTask/myTask.module';
import { AppRegistrationController } from './feature/registration/app/appRegistration.controller';
import { AppRegistrationModule } from './feature/registration/app/appRegistration.module';
import { RegistrationController } from './feature/registration/registration.controller';
import { RegistrationModule } from './feature/registration/registration.module';
import { SchoolVisitController } from './feature/schoolVisit/schoolVisit.controller';
import { SchoolVisitModule } from './feature/schoolVisit/schoolVisit.module';
import { SlotController } from './feature/slots/slot.controller';
import { SlotModule } from './feature/slots/slot.module';
import { GlobalModule } from './global/global.module';
import { AuthenticationMiddleware } from './middleware/auth/authentication.middleware';
import { AuthorizationMiddlewareFactory } from './middleware/auth/authorizationMiddlewareFactory';
import { excludedRoutes } from './middleware/auth/authorizedRoutes';
import { LoggerService, ResponseService } from './utils';
import { KafkaModule } from './kafka/kafka.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    GlobalModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get<string>('MONGO_USERNAME')}:${configService.get<string>('MONGO_PASSWORD')}@${configService.get<string>('MONGO_HOST')}:${configService.get<string>('MONGO_PORT')}/${configService.get<string>('MONGO_DATABASE')}`,
        // uri: `mongodb+srv://${configService.get<string>('MONGO_USERNAME')}:${configService.get<string>('MONGO_PASSWORD')}@${configService.get<string>('MONGO_HOST')}/${configService.get<string>('MONGO_DATABASE')}`,
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_SERVER_URL'), // Replace with your Redis host
          port: 6379,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    DashboardModule,
    AuthModule,
    EnquiryStageModule,
    DataImportModule,
    EnquiryTypeModule,
    FollowUpModule,
    SchoolVisitModule,
    CompetencyTestModule,
    EnquiryModule,
    EnquiryLogModule,
    RegistrationModule,
    AdmissionModule,
    AppEnquiryModule,
    AppRegistrationModule,
    SlotModule,
    CronModule,
    MyTaskModule,
    ExternalEnquiryModule,
    ExternalEnquiryTypeModule,
    KafkaModule
  ],

  controllers: [AppController],
  providers: [
    AppService,
    AuthorizationMiddlewareFactory,
    {
      provide: 'REDIS_INSTANCE',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_SERVER_URL');
        return redisUrl ? new RedisService(redisUrl) : null;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_INSTANCE'],
})
export class AppModule {
  private readonly configService: ConfigService;
  private readonly responseService: ResponseService;
  private readonly loggerService: LoggerService;
  public readonly redisInstance: RedisService;

  constructor(
    private readonly authorizationMiddlewareFactory: AuthorizationMiddlewareFactory,
    @Inject('REDIS_INSTANCE') redisInstance: RedisService,
  ) {
    this.configService = new ConfigService();
    this.responseService = new ResponseService();
    this.loggerService = new LoggerService();
    this.redisInstance = redisInstance;
  }
  configure(consumer: MiddlewareConsumer) {
    /**
     * Below code is used to apply authentication middleware to all the routes of the Controllers passed as an argument to forRoutes().
     * By passing Controllers to forRoutes() method, we ensure, that every route has only one auth middleware attached to it.
     * This has solved the routes overlapping issue while applying middleware through iterating the routes, because of which authentication middeware were applied to a same route N times (where N = number of overlapping routes).
     * The below implementation makes the authenticate flag null and void
     */
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        return new AuthenticationMiddleware(
          this.configService,
          this.responseService,
          this.loggerService,
          this.redisInstance,
        ).use(req, res, next, { authorize: true });
      })
      .exclude(...excludedRoutes)
      .forRoutes(
        EnquiryController,
        AdmissionController,
        FollowUpController,
        RegistrationController,
        EnquiryStageController,
        EnquiryTypeController,
        SchoolVisitController,
        CompetencyTestController,
        MyTaskController,
        AppEnquiryController,
        AppRegistrationController,
        SlotController,
      );

    /**
     * Below code is used to apply authorization middleware by iterating through routes array.
     * NOTE: The issue of attaching middleware multiple times because of overlapping routes still persists here.
     * TODO: Find a solution for this.
     * NOTE: Current implementation wont cause any issue, but here authorization middleware will be called N times for a single route (overallping route) (where N = number of overlapping routes)
     */
    // routes.forEach((route) => {
    //   const middlewares = [];
    //   route.authorize
    //     ? middlewares.push(
    //         this.authorizationMiddlewareFactory.create(
    //           route.permissions,
    //           this.redisInstance,
    //         ),
    //       )
    //     : '';

    //   if (route.path === '/marketing/admission/:enquiryId/subject-details') {
    //     console.log("route matched", route, middlewares)
    //   }
    //   if (middlewares.length) {
    //     consumer
    //       .apply(...middlewares)
    //       .exclude(...excludedRoutes)
    //       .forRoutes({ path: route.path, method: route.method });
    //   }
    // });
    consumer
      .apply(
        this.authorizationMiddlewareFactory.create('*', this.redisInstance),
      )
      .exclude(...excludedRoutes)
      .forRoutes(
        EnquiryController,
        AdmissionController,
        FollowUpController,
        RegistrationController,
        EnquiryStageController,
        EnquiryTypeController,
        SchoolVisitController,
        CompetencyTestController,
        MyTaskController,
        AppEnquiryController,
        AppRegistrationController,
        SlotController,
      );
  }
}
