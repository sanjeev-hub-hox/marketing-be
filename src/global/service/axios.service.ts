import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';
import {
  PARENT_USER_TYPE,
  SERVICE_ID,
} from 'src/feature/enquiry/enquiry.constant';
import { APPLICATION_ID, LoggerService, MDM_API_URLS } from 'src/utils';

export enum EHttpCallMethods {
  GET = 'GET',
  POST = 'POST',
  PATCH = 'PATCH',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

@Injectable({ scope: Scope.TRANSIENT })
export class AxiosService {
  private response: AxiosResponse;
  private baseUrl: string;
  private method: EHttpCallMethods;
  private url: string;
  private queryString: string;
  private body: Record<string, any> | null;
  private config: AxiosRequestConfig;
  private configService: ConfigService;
  private readonly appToken: string;
  crossPlatformRequest: boolean = false;
  private loggerService: LoggerService;

  constructor() {
    this.configService = new ConfigService();
    this.appToken = this.configService.get<string>('MDM_TOKEN');
    this.baseUrl = this.configService.get<string>('MDM_URL');
    this.loggerService = new LoggerService();
  }

  isCrossPlatformRequest(flag: boolean) {
    this.crossPlatformRequest = flag;
    return this;
  }

  setMethod(method: EHttpCallMethods): AxiosService {
    this.method = method;
    return this;
  }

  setQueryStringParams(params: Record<string, any>[]): AxiosService {
    this.queryString = params.reduce((previousParams, currentParam) => {
      return previousParams + '&' + currentParam[0] + '=' + currentParam[1];
    }, '?');
    return this;
  }

  setHeaders(headers: AxiosRequestHeaders): AxiosService {
    this.config = { headers };
    return this;
  }

  setBody(body: Record<string, any>): AxiosService {
    this.body = body;
    return this;
  }

  setBaseUrl(baseUrl: string): AxiosService {
    this.baseUrl = baseUrl;
    return this;
  }

  setUrl(apiUrl: string): AxiosService {
    this.url = apiUrl;
    return this;
  }

  async sendRequest(): Promise<AxiosResponse> {
    let requestUrl = this.baseUrl + this.url;
    console.log('requestURL___', requestUrl)
    if (this.queryString) requestUrl += this.queryString;
    if (this.crossPlatformRequest) {
      if (requestUrl.split('?').length > 1) {
        requestUrl += '&platform=app';
      } else {
        requestUrl += '?platform=app';
      }
    }
    try {
      switch (this.method) {
        case EHttpCallMethods.GET:
          this.response = await axios.get(requestUrl, this.config ?? {});
          break;
        case EHttpCallMethods.POST:
          this.response = await axios.post(
            requestUrl,
            this.body,
            this.config ?? {},
          );
          break;
        case EHttpCallMethods.PATCH:
          this.response = await axios.patch(
            requestUrl,
            this.body,
            this.config ?? {},
          );
          break;
        case EHttpCallMethods.PUT:
          break;
        case EHttpCallMethods.DELETE:
          this.response = await axios.delete(requestUrl, this.body);
          break;
      }
      return this.response;
    } catch (err) {
      this.loggerService.error(
        `Axios error message: ${JSON.stringify(err?.message ?? {})}`,
        null,
      );
      if (err.response) {
        this.loggerService.error(
          `Axios error data: ${JSON.stringify(err?.response?.data ?? {})}`,
          null,
        );
      }
      throw err;
    }
  }

  async sendNotification({
    slug = '',
    employeeId = [],
    globalIds = [],
    toMail = [],
    toMobile = [],
    params = {},
  }) {
    try {
      const response = await axios.post(
        `https://notifications-reminders-backend-219111640528.us-central1.run.app/send`,
        {
          slug: slug,
          to_mail: ['shreytrivedi002@gmail.com'],

          // ...(toMail && { mail_to: toMail }),
          // ...(employeeId && { employee_ids: employeeId }),
          // ...(toMobile && { employee_ids: toMobile }),
          ...(params && { param: params }),
          // ...(globalIds && { global_ids: globalIds }),
        },
        {},
      );
      console.log('============>2', response);

      return response;
    } catch (error) {
      console.log('============>3', error);
      return;
    }
  }

  async getParentGlobalId(mobileNumber: string) {
    const response = await axios.post(
      `${this.baseUrl}${MDM_API_URLS.GLOBAL_USER}`,
      {
        user_type: PARENT_USER_TYPE,
        mobile_no: mobileNumber,
        application_id: APPLICATION_ID,
        service_id: SERVICE_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${this.appToken}`,
        },
      },
    );
    return response?.data?.data[0]?.global_number ?? null;
  }
}
