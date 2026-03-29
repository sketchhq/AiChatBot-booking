// import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
@Injectable()
export class HttpUtils {
  constructor(private readonly http: any) {}

  async get(url: string) {
    return await this.http.axiosRef.get(url);
  }

  async post(url: string, body: any, headers: any) {
    return await this.http.axiosRef.post(url, body, { headers: headers });
  }
}
