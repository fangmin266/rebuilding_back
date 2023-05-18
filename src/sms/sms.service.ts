import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: Twilio;
  constructor(private readonly configService: ConfigService) {
    const accountSid = configService.get('TWILIO_ACCOUNT_SID');
    const authToken = configService.get('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }
  //정해져있는 함수(변경할수 없음) // 3분 정도 만료시간있음
  async initiatePhoneNumberVerification(phoneNumber: string) {
    const serviceSid = this.configService.get(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );
    return await this.twilioClient.verify.v2
      .services(serviceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
  }
  async confirmPhoneVerification(phone: string, verificationCode: string) {
    const serviceSid = this.configService.get(
      'TWILIO_VERIFICATION_SERVICE_SID',
    );
    const result = await this.twilioClient.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code: verificationCode });
    if (!result.valid || result.status !== 'approved') {
      throw new BadRequestException('Wrong cod provided');
    }
    return result.valid;
  }
}
