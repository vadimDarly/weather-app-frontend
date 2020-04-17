import {Component, OnInit, OnDestroy, SimpleChanges, OnChanges, ElementRef, ViewChild} from '@angular/core';
import {WeatherService} from './services/weather.service';
import {WeatherDataInterface} from './models/weather.interface';
import * as d3 from 'd3';
import * as d3Shape from 'd3-shape';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('chart', null) chartElement: ElementRef;

  private lat: number;
  private lng: number;
  public isSubscribe = false;
  private subscribeInterval: any;
  public data: WeatherDataInterface[] = [];
  public title = 'Weather Chart';
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private x;
  private y;
  private svg: any;
  private tempLine: d3Shape.Line<[number, number]>;
  private hubmitityLine: d3Shape.Line<[number, number]>;

  constructor(private weatherService: WeatherService) {
  }

  ngOnInit() {
    this.buildChart();
    this.drawLine();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.drawLine();
  }

  subscribeForWeatherAPI(): void {
    navigator.geolocation.getCurrentPosition((params) => {
      this.lat = params.coords.latitude;
      this.lng = params.coords.longitude;
    }, error);

    function error(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    this.subscribeInterval = setInterval(() => {
      if (this.lng && this.lat) {
        this.isSubscribe = true;
        this.weatherService.getWeather(this.lat, this.lng).subscribe((res: WeatherDataInterface) => {
          if (res) {
            this.data.push(res);
          }
        });
      }
      this.drawLine();
    }, 3000);
  }

  buildChart() {
    const width = 960 - this.margin.left - this.margin.right;
    const height = 500 - this.margin.top - this.margin.bottom;

    const parseTime = d3.timeParse('%H:%M:%S');
    this.x = d3.scaleTime().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    this.tempLine = d3.line()
      .x((d) => {
        return this.x(d.time);
      })
      .y((d) => {
        return this.y(d.temp);
      });

    this.hubmitityLine = d3.line()
      .x((d) => {
        return this.x(d.time);
      })
      .y((d) => {
        return this.y(d.humidity);
      });

    this.svg = d3.select('body').append('svg')
      .attr('width', width + this.margin.left + this.margin.right)
      .attr('height', height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.data.forEach((d) => {
      d.time = parseTime(d.time);
    });

    this.x.domain(d3.extent(this.data, (d) => {
      return d.time;
    }));

    this.y.domain([0, d3.max(this.data, (d) => {
      return Math.max(d.temp, d.humidity);
    })]);

    this.svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(this.x));

    this.svg.append('g')
      .call(d3.axisLeft(this.y));
  }

  drawLine() {
    this.svg.append('path')
      .data([this.data])
      .attr('class', 'line')
      .style('stroke', 'blue')
      .attr('d', this.tempLine);

    this.svg.append('path')
      .data([this.data])
      .attr('class', 'line')
      .style('stroke', 'red')
      .attr('d', this.hubmitityLine);
  }

  unSubscribeForWeatherAPI(): void {
    clearInterval(this.subscribeInterval);
    this.isSubscribe = false;
  }

  ngOnDestroy(): void {
    this.unSubscribeForWeatherAPI();
  }
}
