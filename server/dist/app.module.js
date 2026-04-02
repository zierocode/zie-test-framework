var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DATABASE_HOST', 'localhost'),
                    port: config.get('DATABASE_PORT', 5432),
                    username: config.get('DATABASE_USER', 'postgres'),
                    password: config.get('DATABASE_PASSWORD', 'postgres'),
                    database: config.get('DATABASE_NAME', 'ztf'),
                    autoLoadEntities: true,
                    synchronize: config.get('DATABASE_SYNC', false),
                }),
            }),
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
export { AppModule };
