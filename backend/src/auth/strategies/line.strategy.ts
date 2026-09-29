import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Strategy } = require('passport-line-auth');

@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, 'line') {
  constructor() {
    super({
      channelID: process.env.LINE_CHANNEL_ID || 'LINE_CHANNEL_ID_PLACEHOLDER',
      channelSecret:
        process.env.LINE_CHANNEL_SECRET || 'LINE_CHANNEL_SECRET_PLACEHOLDER',
      callbackURL:
        process.env.LINE_CALLBACK_URL ||
        'http://localhost:5000/api/v1/auth/line/callback',
      scope: ['profile', 'openid', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const email = profile?.email || (profile?._json && profile?._json?.email);
    const user = {
      provider: 'LINE',
      providerId: profile?.id,
      email: email || undefined,
      displayName: profile?.displayName || `line_${profile?.id}`,
      avatarUrl: profile?.pictureUrl || (profile?.photos && profile?.photos[0]?.value),
    };
    done(null, user);
  }
}
