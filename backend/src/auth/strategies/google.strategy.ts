import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleStrategy');

  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER';
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback';

    // 🔍 Debug: แสดงค่าที่ Strategy ได้รับตอนเริ่มต้น (ซ่อนส่วนท้ายเพื่อความปลอดภัย)
    console.log('=== Google Strategy Initialization ===');
    console.log('GOOGLE_CLIENT_ID:', clientID ? `${clientID.substring(0, 15)}...` : 'MISSING!');
    console.log('GOOGLE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 6)}...` : 'MISSING!');
    console.log('GOOGLE_CALLBACK_URL:', callbackURL);
    console.log('Is PLACEHOLDER?', clientID.includes('PLACEHOLDER') ? 'YES ⚠️' : 'NO ✅');
    console.log('=====================================');

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log(`Google validate() called - Profile ID: ${profile?.id}, Email: ${profile?.emails?.[0]?.value}`);
    const { id, displayName, emails, photos } = profile;
    const user = {
      provider: 'GOOGLE',
      providerId: id,
      email: emails && emails.length > 0 ? emails[0].value : undefined,
      displayName: displayName || (emails && emails[0]?.value ? emails[0].value.split('@')[0] : `google_${id}`),
      avatarUrl: photos && photos.length > 0 ? photos[0].value : undefined,
    };
    done(null, user);
  }
}
