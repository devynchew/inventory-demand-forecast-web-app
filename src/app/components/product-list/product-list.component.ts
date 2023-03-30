import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { InvoicesService } from 'src/app/services/invoices.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  // Variable to store SKUs
  skuList: any = [];

  // Variable to store item codes
  itemCodes: any = [];

  filteredItemCodes: any = [];

  selectedItemCode: any = '';

  searchText = '';

  searchToggle = '';


  totalRecords: any;
  page: any = 1;

  // When user searches for an item code
  public searchValue(event: any) {
    let userData = event.target.value;
    
    if (userData) {
      this.filteredItemCodes = this.itemCodes.filter((data) => {
        return data
          .toLocaleLowerCase()
          .startsWith(userData.toLocaleLowerCase());
      });

      this.searchToggle = 'active';

    } else {
      this.searchToggle = '';
    }
  }

  constructor(private invoicesService: InvoicesService) {}

  ngOnInit(): void {
    //Get data for invoices
    this.invoicesService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.skuList = invoices;
        console.log(this.skuList);
        
        this.itemCodes = invoices.map((item) => item.sku)
      },
      error: (response) => {
        console.log(response);
      },
    });
  }
}
