import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";
import { Usuario } from "../users/entities/usuario.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
