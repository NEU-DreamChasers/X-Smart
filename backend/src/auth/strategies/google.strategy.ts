import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        try {
            // 1. BÓC TÁCH DỮ LIỆU TỪ GOOGLE (Quan trọng)
            const { name, emails, photos } = profile;

            const userProfile = {
                email: emails[0].value,
                firstName: name.givenName,
                lastName: name.familyName,
                picture: photos[0].value,
            };

            // 2. Gửi dữ liệu ĐÃ LÀM SẠCH sang AuthService
            const user = await this.authService.validateGoogleUser(userProfile);

            done(null, user);
        } catch (error) {
            done(error, false);
        }
    }
}