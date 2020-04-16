import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {StockInterface} from '../models/stok.interface';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  public tempData: StockInterface[] = [];
  public humidityData: StockInterface[] = [];
  private baseUrl =  'http://localhost:3000';

  constructor(private http: HttpClient) {
  }

  getWeather(lat: number, lng: number) {
    return this.http.get(`${this.baseUrl}/getWeather?lat=${lat}&lng=${lng}`).pipe(map(res => {
      return res;
    }));
  }
}
