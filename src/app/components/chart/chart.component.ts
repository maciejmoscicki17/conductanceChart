import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Sample } from '../../models/proba';
import { CsvService } from '../../services/csv.service';
import { ChartModule, UIChart } from 'primeng/chart';
@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements OnInit {
  @ViewChild(UIChart) chart?: UIChart;
  scaleToOne = false;

  public ds: any[] = [];
  show = false;
  xyPairs: any;
  data: any;

  getVisibleDatasets() {
    return this.chart?.chart.data.datasets.filter((ds: any, i: any) =>
      this.chart?.chart.isDatasetVisible(i) ? ds : undefined
    );
  }

  exportData() {
    const visibleData = this.getVisibleDatasets();

    const finalData = this.ds.filter((x) =>
      visibleData.map((x: { label: any }) => x.label).includes(x.label)
    );
    let header = 'Nr;Czas;';
    finalData.forEach((x) => {
      header += this.removeSubstring(x.label, ' [µS/cm]') + ';';
    });
    header = header.substring(0, header.length - 1);

    let lines: string[] = [];
    for (let i = 0; i < finalData[0].data.length; i++) {
      let line = i + 1 + ';' + this.data.labels[i] + ';';
      visibleData.forEach((x: { data: string[] }) => {
        line += x.data[i] + ';';
      });
      line = line.substring(0, line.length - 1);
      lines.push(line);
    }
    let output = header + '\n';
    output += lines.join('\n');
    this.downloadCSV(output);
  }

  downloadCSV(dataString: string) {
    const blob = new Blob([dataString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  constructor(private csvService: CsvService) {}

  ngOnInit(): void {
    this.csvService.dataLoaded.asObservable().subscribe((x) => {
      this.initChart();
    });
    this.initChart();
  }
  options = {
    maintainAspectRatio: false,
    aspectRatio: 0.6,

    plugins: {
      legend: {
        labels: {
          color: '#000000',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#034958',
        },
        grid: {
          color: '#e6e6e6',
        },
        title: {
          display: true,
          text: 'czas [s]',
        },
      },
      y: {
        ticks: {
          color: '#034958',
        },
        grid: {
          color: '#e6e6e6',
        },
        title: {
          display: true,
          text: 'Stężenie bezwymiarowe',
        },
      },
    },
  };

  initChart(): void {
    let bezwymiarowe = false;
    const data = this.csvService.results;
    if (!data.length) return;
    const headers = data[0];
    const datasets: any[] = [];

    const columnData: any[] = [];
    for (let i = 1; i < headers.length; i++) {
      const columnName = headers[i];
      columnData[columnName] = { times: [], values: [] };
    }
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let ts = row[1] as string;
      if (ts === undefined) continue;
      if (!ts.includes(',')) bezwymiarowe = true;
      let timestamp: number;
      let date;
      if (!bezwymiarowe) {
        ts = ts.substring(0, ts.length - 2);
        timestamp = Date!.parse(ts);
        date = new Date!(timestamp);
      }

      for (let j = 2; j < row.length; j++) {
        const columnName = headers[j];
        const value = parseFloat(row[j].replace(',', '.'));
        if (!bezwymiarowe) {
          columnData[columnName].times.push(date);
        } else {
          columnData[columnName].times.push(ts);
        }
        columnData[columnName].values.push(value);
      }
    }

    for (const columnName in columnData) {
      datasets.push({
        label: columnName.split('[')[0].split('(')[0],
        data: columnData[columnName].values,
        times: columnData[columnName].times,
      });
    }
    datasets.shift();
    if (!bezwymiarowe) {
      datasets.forEach((x) => {
        x.times.shift();
      });
    }
    let labels: string[] = [];
    if (bezwymiarowe) {
      labels = datasets[0].times;
    } else {
      labels = this.transformTimes(datasets[0].times);
    }
    this.ds = datasets;
    this.ds.forEach((x) => (x.label = x.label.replace('�', 'µ')));

    let dataset: Sample[] = [];
    datasets.forEach((x, index) => {
      dataset.push({
        label: x.label.replace('�', 'µ'),
        data: x.data,
        fill: false,
        borderColor: this.colors[index],
        tension: 1,
        borderWidth: 1,
        pointRadius: 0.5,
      });
    });
    dataset = this.transformSamples(dataset);
    this.data = {
      labels: labels,
      datasets: dataset,
    };
    this.show = true;
  }

  private transformSamples(samples: Sample[]): Sample[] {
    samples.forEach((s) => {
      s.data.shift();
      const min = Math.min(...s.data);
      const max = Math.max(...s.data);
      if (this.scaleToOne) {
        s.data = s.data.map((x) => {
          return this.mapRange(x, min, max, 0, 1);
        });
      } else {
        s.data = s.data.map((x) => {
          return this.mapRange(x, min, s.data[s.data.length - 1], 0, 1);
        });
      }
    });

    return samples;
  }

  private transformTimes(times: Date[]): string[] {
    const rozniceWDziesiatychSekundach: string[] = [];

    const pierwszaData = times[0];

    for (const data of times) {
      const roznica = (data.getTime() - pierwszaData.getTime()) / 1000;
      rozniceWDziesiatychSekundach.push(roznica.toString());
    }
    return rozniceWDziesiatychSekundach;
  }

  private mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  colors: string[] = [
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#000000',
    '#FF00FF',
    '#00FFFF',
  ];

  removeSubstring(input: string, substring: string): string {
    return input.split(substring).join('');
  }

  changeScale(scaleToOne: boolean) {
    this.scaleToOne = !scaleToOne;
    this.initChart();
  }
}
