import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID:
        process.env.FACEBOOK_APP_ID || 'FACEBOOK_APP_ID_PLACEHOLDER',
      clientSecret:
        process.env.FACEBOOK_APP_SECRET || 'FACEBOOK_APP_SECRET_PLACEHOLDER',
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL ||
        'http://localhost:5000/api/v1/auth/facebook/callback',
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
