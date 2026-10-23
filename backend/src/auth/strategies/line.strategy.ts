import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Strategy } = require('passport-line-auth');

@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, 'line') {
  private readonly logger = new Logger('LineStrategy');

  constructor() {
    const channelID = process.env.LINE_CHANNEL_ID || 'LINE_CHANNEL_ID_PLACEHOLDER';
    const channelSecret = process.env.LINE_CHANNEL_SECRET || 'LINE_CHANNEL_SECRET_PLACEHOLDER';
    const callbackURL = process.env.LINE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/line/callback';

    console.log('=== LINE Strategy Initialization ===');
    console.log('LINE_CHANNEL_ID:', channelID ? `${channelID.substring(0, 10)}...` : 'MISSING!');
    console.log('LINE_CHANNEL_SECRET:', channelSecret ? `${channelSecret.substring(0, 6)}...` : 'MISSING!');
    console.log('LINE_CALLBACK_URL:', callbackURL);
    console.log('Is PLACEHOLDER?', channelID.includes('PLACEHOLDER') ? 'YES ⚠️' : 'NO ✅');
    console.log('====================================');

    super({
      channelID,
      channelSecret,
      callbackURL,
      scope: ['profile', 'openid', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    this.logger.log(`LINE validate() called - Profile ID: ${profile?.id}, DisplayName: ${profile?.displayName}`);
    const email = profile?.email || (profile?._json && profile?._json?.email);
    const displayName = profile?.displayName || profile?._json?.displayName || `line_${profile?.id}`;
    const avatarUrl = profile?.pictureUrl || profile?._json?.pictureUrl || (profile?.photos && profile?.photos[0]?.value);
    const user = {
      provider: 'LINE',
      providerId: profile?.id,
      email: email || undefined,
      displayName: displayName,
      avatarUrl: avatarUrl,
    };
    done(null, user);
  }
}
