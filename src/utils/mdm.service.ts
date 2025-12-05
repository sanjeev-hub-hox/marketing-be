import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HTTP_METHODS } from 'ampersand-common-module';

import { LoggerService } from './logger.service';

@Injectable()
export class MdmService {
  private logger: LoggerService;
  private configService: ConfigService;
  private readonly appToken: string;
  private readonly baseUrl: string;
  constructor() {
    this.logger = new LoggerService();
    this.configService = new ConfigService();
    this.appToken = this.configService.get<string>('MDM_TOKEN');
    this.baseUrl = this.configService.get<string>('MDM_URL');
  }

  private createHeaders(): { [key: string]: string } {
    return {
      Authorization: `Bearer ${this.appToken}`,
      'Content-Type': 'application/json; charset=utf-8',
      // Add other headers if needed
    };
  }

  async fetchDataFromAPI(url: string, queryParams?: any): Promise<any> {
    // console.log('inside fetch')
    const headers = this.createHeaders();
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = this.baseUrl + url + (queryString ? `?${queryString}` : '');
    // console.log(fullUrl);
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });
    return response.json();
  }

  async postDataToAPI(url: string, data: any, queryParams?: any): Promise<any> {
    const headers = this.createHeaders();
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = this.baseUrl + url + (queryString ? `?${queryString}` : '');

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    // if (response.status != HttpStatus.OK) {
    //     throw new HttpException('Failed to post data to the API', HttpStatus.INTERNAL_SERVER_ERROR);
    // }

    return response.json();
  }

  async putDataToAPI(url: string, data: any, queryParams?: any): Promise<any> {
    const headers = this.createHeaders();
    const queryString = new URLSearchParams(queryParams).toString();
    const fullUrl = this.baseUrl + url + (queryString ? `?${queryString}` : '');

    const response = await fetch(fullUrl, {
      method: HTTP_METHODS.PUT,
      headers,
      body: JSON.stringify(data),
    });

    return response.json();
  }

  // Add other methods as needed for different HTTP methods (e.g., PUT, DELETE, etc.)

  // Generalized method to make HTTP requests with any method
  // makeRequest(method: string, url: string, data?: any, queryParams?: any): Promise<any> {
  //     const headers = this.createHeaders();
  //     const config = { headers, params: queryParams };
  //     switch (method.toUpperCase()) {
  //         case 'GET':
  //             return this.httpService.get(url, config);
  //         case 'POST':
  //             return this.httpService.post(url, data, config);
  //         // Add cases for other HTTP methods as needed
  //         default:
  //             throw new Error(`Unsupported HTTP method: ${method}`);
  //     }
  // }
}
