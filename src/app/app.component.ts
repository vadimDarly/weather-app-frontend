import {Component, OnInit, OnDestroy, SimpleChanges, OnChanges, ElementRef, ViewChild} from '@angular/core';
import {WeatherService} from './services/weather.service';
import {WeatherDataInterface} from './models/weather.interface';
import * as d3 from 'd3';
import * as d3Shape from 'd3-shape';
import {StockInterface} from './models/stok.interface';


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
  public tempData: StockInterface[] = [{date: '10:11:23', value: 3}, {date: '10:11:26', value: 7}, {date: '10:11:30', value: 11}];
  public humidityData: StockInterface[] = [{date: '10:11:23', value: 23}, {date: '10:11:26', value: 17}, {date: '10:11:30', value: 54}];
  public title = 'Weather Chart';
  private margin = {top: 20, right: 20, bottom: 30, left: 50};
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<[number, number]>;
  private svgElement: HTMLElement;
  private chartProps: any;

  constructor(private weatherService: WeatherService) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
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
            this.tempData.push({
              date: new Date(),
              value: res.temp,
            });
            this.humidityData.push({
              date: new Date(),
              value: res.humidity,
            });
          }
        });
      }
    }, 3000);
  }

  buildChart() {

    const parseTime = d3.timeParse('%H:%M:%');

    this.tempData.forEach((d) => {
      d.date = parseTime(d.date);
      d.value = +d.value;
    });

    this.chartProps = {};

    const margin = {top: 30, right: 20, bottom: 30, left: 50};
    const width = 900 - margin.left - margin.right;
    const height = 540 - margin.top - margin.bottom;

    this.chartProps.x = d3.scaleTime().range([0, width]);
    this.chartProps.y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(this.chartProps.x); // date
    const yAxis = d3.axisLeft(this.chartProps.y); // value

    const tempLine = d3.line()
      .x((d) => {
        return this.chartProps.x(d.value);
      })
      .y((d) => {
        return this.chartProps.y(d.date);
      });

    const humidityLine = d3.line()
      .x((d) => {
        return this.chartProps.x(d.value);
      })
      .y((d) => {
        return this.chartProps.y(d.date);
      });

    const svg = d3.select(this.chartElement.nativeElement)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.chartProps.x.domain(d3.extent(this.tempData, (d) => {
      return d.date;
    }));
    this.chartProps.y.domain([0, d3.max(this.tempData, (d) => {
      return Math.max(d.value, d.value);
    })]);

    svg.append('path')
      .attr('class', 'line line1')
      .style('stroke', 'black')
      .style('fill', 'none')
      .attr('d', tempLine(this.tempData));

    svg.append('path')
      .attr('class', 'line line2')
      .style('stroke', 'green')
      .style('fill', 'none')
      .attr('d', humidityLine(this.humidityData));

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

    // Setting the required objects in chartProps so they could be used to update the chart
    this.chartProps.svg = svg;
    this.chartProps.tempLine = tempLine;
    this.chartProps.humidityLine = humidityLine;
    this.chartProps.xAxis = xAxis;
    this.chartProps.yAxis = yAxis;
  }

  unSubscribeForWeatherAPI(): void {
    clearInterval(this.subscribeInterval);
    this.isSubscribe = false;
  }

  ngOnDestroy(): void {
    this.unSubscribeForWeatherAPI();
  }
}
