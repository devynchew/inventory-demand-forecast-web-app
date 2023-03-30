// Services to fetch data from the MSSQL database
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  // get url from environment.ts
  baseApiUrl: string = environment.baseApiUrl;
  constructor(private http: HttpClient) {}

  // Fetch a unique list of all SKUs
  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseApiUrl + '/api/invoices')
  }

  // Fetch all the invoices for a specific SKU
  getInvoiceById(sku: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.baseApiUrl + '/api/invoices/' + sku);
  }

  // Fetch a single invoice by SKU, type, year and month
  getInvoiceByIdTypeDate(sku: string, type: string, year: number, month: number): Observable<Invoice[]>{
    return this.http.get<Invoice[]>(this.baseApiUrl + `/api/invoices/${sku}/${type}${year}${month}`);
  }

  // Update a single invoice's AdjustedSum, by SKU, type, year and month
  updateInvoice(sku: string, type: string, year: number, month: number, updateInvoiceRequest: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(this.baseApiUrl + `/api/invoices/${sku}/${type}/${year}/${month}`, updateInvoiceRequest );
  }

}
