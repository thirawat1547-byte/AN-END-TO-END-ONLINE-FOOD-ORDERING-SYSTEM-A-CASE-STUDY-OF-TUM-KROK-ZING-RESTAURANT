import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger('FacebookStrategy');

  constructor() {
    const clientID = process.env.FACEBOOK_APP_ID || 'FACEBOOK_APP_ID_PLACEHOLDER';
    const clientSecret = process.env.FACEBOOK_APP_SECRET || 'FACEBOOK_APP_SECRET_PLACEHOLDER';
    const callbackURL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/facebook/callback';

    console.log('=== Facebook Strategy Initialization ===');
    console.log('FACEBOOK_APP_ID:', clientID ? `${clientID.substring(0, 10)}...` : 'MISSING!');
    console.log('FACEBOOK_APP_SECRET:', clientSecret ? `${clientSecret.substring(0, 6)}...` : 'MISSING!');
    console.log('FACEBOOK_CALLBACK_URL:', callbackURL);
    console.log('Is PLACEHOLDER?', clientID.includes('PLACEHOLDER') ? 'YES ⚠️' : 'NO ✅');
    console.log('========================================');

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'public_profile'],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    this.logger.log(`Facebook validate() called - Profile ID: ${profile?.id}, Email: ${profile?.emails?.[0]?.value}`);
    const { id, displayName, emails, photos } = profile;
    const user = {
      provider: 'FACEBOOK',
      providerId: id,
      email: emails && emails.length > 0 ? emails[0].value : undefined,
      displayName: displayName || `facebook_${id}`,
      avatarUrl: photos && photos.length > 0 ? photos[0].value : undefined,
    };
    done(null, user);
  }
}
