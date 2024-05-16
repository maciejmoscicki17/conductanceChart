import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  @Output() dataLoaded = new EventEmitter<void>();

  results: any[] = [];
  rawData: any;
  constructor(private http: HttpClient) {}

  parseCsvFile(url: string): Observable<any[]> {
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((data) => {
        this.rawData = data;
        var results: any[] = [];
        const lines = data.split('\n');
        lines.forEach((line) => {
          results.push(line.split(';'));
        });
        this.results = results;
        return results;
      })
    );
  }

  parseLoadedFile(data: string): any[] {
    this.rawData = data;
    var results: any[] = [];
    const lines = data.split('\n');
    lines.forEach((line) => {
      results.push(line.split(';'));
    });
    this.results = results;
    this.dataLoaded.next();
    return results;
  }
}
