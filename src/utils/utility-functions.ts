import { RedisService } from 'ampersand-common-module';
import { Request } from 'express';

import { SERVICE_NAME } from './constant';

export function camelise(text: string) {
  return text.substring(0, 1).toLowerCase() + text.substring(1, text.length);
}

export function applyTemplate(template: string, data: Record<string, string>) {
  return template.replace(/{{(.*?)}}/g, (placeholder, key) => {
    return key in data ? data[key] : placeholder;
  });
}

export function isAppRequest(req: Request): boolean {
  let isAppRequest = false;
  const queryString = req.url.split('?')[1];
  if (queryString) {
    const queryStringParams = queryString.split('&');
    for (const param of queryStringParams) {
      const [key, value] = param.split('=');
      if (key === 'platform' && value === 'app') {
        isAppRequest = true;
        break;
      }
    }
  }
  return isAppRequest;
}

export async function getSessionData(
  req: Request,
  redisInstance: RedisService,
): Promise<Record<string, any>> {
  const token = req.headers.authorization.replace('Bearer ', '');
  const redisData = redisInstance ? await redisInstance.getData(token) : null;
  if (redisData) {
    return redisData?.[SERVICE_NAME];
  }
  return req.session[token] ?? {};
}
