import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'corona-tracker-app';
  stateWiseData;
  districtData;
  total;
  newConfirmed;
  recovered;
  active;
  deceased;
  newRecovered;
  newDeceased;
  lastUpdated;
  stateWiseUpdatedData;
  stateName;

  displayedColumns: string[] = ['district', 'confirmed', 'active', 'recovered', 'deceased'];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.total = 0;
    this.recovered = 0;
    this.newConfirmed = 0;
    this.active = 0;
    this.deceased = 0;
    this.getTheData();
    this.callTheAPIAtInterval();
  }

  callTheAPIAtInterval() {
    setInterval(() => {
      this.getTheData();
    }, 1000 * 60 * 5);
  }

  getTheData() {
    this.http.get('https://api.covid19india.org/data.json').subscribe((totalData) => {
      this.stateWiseUpdatedData = totalData['statewise'];
      this.total = totalData['statewise'][0].confirmed;
      this.newConfirmed = totalData['statewise'][0].deltaconfirmed;
      this.recovered = totalData['statewise'][0].recovered;
      this.newRecovered = totalData['statewise'][0].deltarecovered;
      this.newDeceased = totalData['statewise'][0].deltadeaths;
      this.active = totalData['statewise'][0].active;
      this.deceased = totalData['statewise'][0].deaths;
      // this.lastUpdated = totalData['statewise'][0].lastupdatedtime;
    })

    this.http.get('https://api.covid19india.org/v2/state_district_wise.json').subscribe((data) => {
      this.stateWiseData = data;
    })
  }

  filterDistrictData(stateData) {
    const filterData = this.stateWiseData.filter((data) => {
      return (data.statecode === stateData)
    });
    const lastUpdated = this.stateWiseUpdatedData.filter((data) => {
      return (data.statecode === stateData)
    })
    const dateWithoutPattern = lastUpdated[0].lastupdatedtime.split(' ')[0];
    const lastUpdatedTimeFormatted = dateWithoutPattern.split('/')[2] + '-' + dateWithoutPattern.split('/')[1] +
      '-' + dateWithoutPattern.split('/')[0] + ' ' + lastUpdated[0].lastupdatedtime.split(' ')[1];
    const timeDifference = new Date().getTime() - new Date(lastUpdatedTimeFormatted).getTime();
    let lastUpdatedInHOrM;
    let timeIn = '';
    if (timeDifference / (1000 * 60) > 60) {
      lastUpdatedInHOrM = timeDifference / (1000 * 60 * 60);
      timeIn = lastUpdatedInHOrM >= 2 ? 'Hours' : 'Hour';
    } else {
      lastUpdatedInHOrM = timeDifference / (1000 * 60);
      timeIn = lastUpdatedInHOrM >= 2 ? 'Minutes' : 'Minute';
    }
    this.lastUpdated = parseInt(lastUpdatedInHOrM) + ' ' + timeIn;
    this.stateName = filterData[0].state;
    this.districtData = filterData[0].districtData;
  }

}
