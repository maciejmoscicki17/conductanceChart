import { Component, OnInit } from '@angular/core';
import { CsvService } from '../../services/csv.service';

@Component({
  selector: 'data-loader',
  standalone: true,
  imports: [],
  templateUrl: './data-loader.component.html',
  styleUrl: './data-loader.component.scss',
})
export class DataLoaderComponent implements OnInit {
  selectedFile?: File;
  constructor(private csvService: CsvService) {}

  ngOnInit(): void {}

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files === null) console.error('Event is null');
    else {
      const file = target.files[0];
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const csvData = e.target.result;
          this.csvService.parseLoadedFile(csvData);
        };
        reader.readAsText(file);
      }
    }
  }
}
