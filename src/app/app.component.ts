import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from './components/chart/chart.component';
import { DataLoaderComponent } from './components/data-loader/data-loader.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChartComponent, DataLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  show = false;
  title = 'graphs';

  onDataLoaded() {
    this.show = true;
  }
}
