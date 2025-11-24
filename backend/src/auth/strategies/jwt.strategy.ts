import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// LƯU Ý: Trong dự án thật, hãy đưa KEY này vào file .env
export const jwtConstants = {
    secret: 'DAY_LA_BI_MAT_KHONG_DUOC_LO_RA_NGOAI',
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any) {
        // Payload đã giải mã từ Token. Trả về cái này để gán vào req.user
        return { userId: payload.sub, username: payload.username, role: payload.role };
    }
}