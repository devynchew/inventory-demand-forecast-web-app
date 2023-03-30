import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Invoice } from 'src/app/models/invoice.model';
import { InvoicesService } from 'src/app/services/invoices.service';
import * as d3 from 'd3';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  private svg: any;
  private width: number = 1400;
  private height: number = 500;

  private renderLineChart(allData?: any) {
    // Group data for multi-line chart plot
    const sumstat = d3.group(allData, (d: any) => d.type);

    this.svg = d3.select('svg.individual-sku');

    const xValue = (d) => d.date;

    const yValue = (d) => d.adjustedSum;

    const margin = { top: 25, right: 60, bottom: 70, left: 60 };
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleTime()
      .domain(<any>d3.extent(allData, xValue))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(<any>d3.extent(allData, yValue))
      .range([innerHeight, 0])
      .nice();

    const g = this.svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xAxis = d3.axisBottom(xScale).tickSize(7).tickPadding(15);

    const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);

    const yAxisG = g.append('g').call(yAxis).attr('class', 'y-axis');

    // Adding month ticks
    const xAxisG = g
      .append('g')
      .call(xAxis.ticks(d3.timeMonth))
      .attr('class', 'x-axis-ticks')
      .attr('transform', `translate(0,${innerHeight})`);

    xAxisG.selectAll('.tick text').remove();

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis.ticks(d3.timeYear))
      .attr('class', 'x-axis');

    // color palette
    const color = d3
      .scaleOrdinal()
      .range(['#59a5d8', '#4daf4a', '#ef476f', '#7d8597']);

    const lineClass = d3
      .scaleOrdinal()
      .range([
        'quantity-sold',
        'balance-stock',
        'safety-stock',
        'reorder-quantity',
      ]);

    d3.select('svg > g')
      .selectAll('.line')
      .append('g')
      .attr('class', 'line')
      .data(sumstat)
      .enter()
      .append('path')
      .attr('class', function (d) {
        return lineClass(d[0]);
      } as any)
      .attr('fill', 'none')
      .attr('stroke', function (d) {
        return color(d[0]);
      } as any)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('d', function (d) {
        return d3
          .line()
          .x((d) => xScale(xValue(d)))
          .y((d) => yScale(yValue(d)))
          .curve(d3.curveBumpX)(d[1]);
      });

    // Add legends
    // Quantity Sold
    g.append('rect')
      .attr('x', innerWidth - 1025)
      .attr('y', -innerHeight + 864)
      .attr('stroke', 'none')
      .attr('width', '30')
      .attr('height', '12')
      .attr('fill', '#59a5d8');
    g.append('text')
      .attr('x', innerWidth - 985)
      .attr('y', -innerHeight + 870)
      .text('Quantity Sold')
      .attr('class', 'legend')
      .attr('alignment-baseline', 'middle');

    // Balance Stock
    g.append('rect')
      .attr('x', innerWidth - 875)
      .attr('y', -innerHeight + 864)
      .attr('stroke', 'none')
      .attr('width', '30')
      .attr('height', '12')
      .attr('fill', '#4daf4a');

    g.append('text')
      .attr('x', innerWidth - 835)
      .attr('y', -innerHeight + 870)
      .text('Balance Stock')
      .attr('class', 'legend')
      .attr('alignment-baseline', 'middle');

    // Safety stock
    g.append('rect')
      .attr('x', innerWidth - 725)
      .attr('y', -innerHeight + 864)
      .attr('stroke', 'none')
      .attr('width', '30')
      .attr('height', '12')
      .attr('fill', '#ef476f');
    g.append('text')
      .attr('x', innerWidth - 685)
      .attr('y', -innerHeight + 870)
      .text('Safety stock')
      .attr('class', 'legend')
      .attr('alignment-baseline', 'middle');

    // Reorder quantity
    g.append('rect')
      .attr('x', innerWidth - 575)
      .attr('y', -innerHeight + 864)
      .attr('stroke', 'none')
      .attr('width', '30')
      .attr('height', '12')
      .attr('fill', '#7d8597');
    g.append('text')
      .attr('x', innerWidth - 535)
      .attr('y', -innerHeight + 870)
      .text('Reorder quantity')
      .attr('class', 'legend')
      .attr('alignment-baseline', 'middle');
    
    // Keep line filter set by user
    if (this.quantitySold == 'active') {
      d3.selectAll('.quantity-sold').attr('display', 'block');
    } else {
      d3.selectAll('.quantity-sold').attr('display', 'none');
    }
    if (this.balanceStock == 'active') {
      d3.selectAll('.balance-stock').attr('display', 'block');
    } else {
      d3.selectAll('.balance-stock').attr('display', 'none');
    }
    if (this.safetyStock == 'active') {
      d3.selectAll('.safety-stock').attr('display', 'block');
    } else {
      d3.selectAll('.safety-stock').attr('display', 'none');
    }
    if (this.reorderQuantity == 'active') {
      d3.selectAll('.reorder-quantity').attr('display', 'block');
    } else {
      d3.selectAll('.reorder-quantity').attr('display', 'none');
    }
  }

  // Variable to store both past and predicted sales
  allData: Invoice[] = [];

  // Store reorder quantity data for edit
  reorderQuantityData: Invoice[] = [];

  safetyStockData: Invoice[] = [];

  // Variable to store sorted invoice of a particular item code
  sortedInvoice: Invoice[] = [];

  // Update data
  public updateData(data: any) {

    // Convert date to datetime object
    const arr1 = data.map((obj) => {
      return { ...obj, date: new Date(<any>obj.date) };
    });

    // Sort date
    this.sortedInvoice = <any>arr1.sort(function (a, b) {
      return <any>a.date - <any>b.date;
    });

    this.allData = this.sortedInvoice.slice();
    console.log(this.allData);

    // Store reorder quantity data
    this.reorderQuantityData = this.allData
      .filter((d) => d.type == 'Reorder Quantity')
      .slice(-6);
    console.log(this.reorderQuantityData);

    // Store safety stock data
    this.safetyStockData = this.allData
      .filter((d) => d.type == 'Safety')
      .slice(-6);
    console.log(this.safetyStockData);
  }

  // Toggle line chart function
  quantitySold: string = 'active';
  balanceStock: string = 'active';
  safetyStock: string = 'active';
  reorderQuantity: string = 'active';

  public toggleChart(event: any) {
    switch (event.target.id) {
      case 'quantitySold':
        if (this.quantitySold == 'active') {
          this.quantitySold = 'not-active';
          d3.selectAll('.quantity-sold').attr('display', 'none');
        } else {
          this.quantitySold = 'active';
          d3.selectAll('.quantity-sold').attr('display', 'block');
        }
        break;
      case 'balanceStock':
        if (this.balanceStock == 'active') {
          this.balanceStock = 'not-active';
          d3.selectAll('.balance-stock').attr('display', 'none');
        } else {
          this.balanceStock = 'active';
          d3.selectAll('.balance-stock').attr('display', 'block');
        }

        break;
      case 'safetyStock':
        if (this.safetyStock == 'active') {
          this.safetyStock = 'not-active';
          d3.selectAll('.safety-stock').attr('display', 'none');
        } else {
          this.safetyStock = 'active';
          d3.selectAll('.safety-stock').attr('display', 'block');
        }

        break;
      case 'reorderQuantity':
        if (this.reorderQuantity == 'active') {
          this.reorderQuantity = 'not-active';
          d3.selectAll('.reorder-quantity').attr('display', 'none');
        } else {
          this.reorderQuantity = 'active';
          d3.selectAll('.reorder-quantity').attr('display', 'block');
        }
    }
  }

  invoiceDetails: Invoice = {
    id: 0,
    sku: '',
    date: '',
    year: 0,
    month: 0,
    type: '',
    sum: 0,
    adjustedSum: 0,
    mean: 0,
    max: 0,
    min: 0,
    confidenceLevel: 0,
    upperBound: 0,
    lowerBound: 0,
    filterList: '',
    stationarity: '',
    cluster: 0,
    application: '',
    itemGroupDefault: '',
    bestModel: '',
  };

  editReorder(invoice: any) {
    this.invoiceDetails = this.reorderQuantityData.filter(
      (d) => d.id == invoice.id
    )[0];

    this.reorderQuantityForm.setValue({
      reorderQuantity: invoice.adjustedSum,
    });
  }

  updateReorder(item) {
    this.invoiceDetails.adjustedSum = item.value.reorderQuantity;

    this.invoicesService
      .updateInvoice(
        this.sku,
        this.invoiceDetails.type,
        this.invoiceDetails.year,
        this.invoiceDetails.month,
        this.invoiceDetails
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          // Update line chart to plot user adjusted values
          d3.selectAll('rect').remove();
          d3.selectAll('g').remove();
          this.renderLineChart(this.allData);
        },
      });
  }

  editSafety(invoice: any) {
    this.invoiceDetails = this.safetyStockData.filter(
      (d) => d.id == invoice.id
    )[0];

    this.safetyStockForm.setValue({
      safetyStock: invoice.adjustedSum,
    });
  }

  updateSafety(item) {
    console.log(item);
    this.invoiceDetails.adjustedSum = item.value.safetyStock;

    this.invoicesService
      .updateInvoice(
        this.sku,
        this.invoiceDetails.type,
        this.invoiceDetails.year,
        this.invoiceDetails.month,
        this.invoiceDetails
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          // Update line chart to plot user adjusted values
          d3.selectAll('rect').remove();
          d3.selectAll('g').remove();
          this.renderLineChart(this.allData);
        },
      });
  }
  // Reset user adjusted reorder quantity 
  resetReorder() {
    // Loop to update the adjustedSum value back to original
    for (let i = 0; i < this.reorderQuantityData.length; i++) {
      this.invoiceDetails = this.reorderQuantityData[i];
      this.invoiceDetails.adjustedSum = this.invoiceDetails.sum;

      this.invoicesService
        .updateInvoice(
          this.sku,
          this.invoiceDetails.type,
          this.invoiceDetails.year,
          this.invoiceDetails.month,
          this.invoiceDetails
        )
        .subscribe({
          next: (response) => {
            console.log(response);
            // Update line chart to plot user adjusted values
            d3.selectAll('rect').remove();
            d3.selectAll('g').remove();
            this.renderLineChart(this.allData);
          },
        });
    }
  }

    // Reset user adjusted safety stock
  resetSafety() {
    // Loop to update the adjustedSum value back to original
    for (let i = 0; i < this.safetyStockData.length; i++) {
      this.invoiceDetails = this.safetyStockData[i];
      this.invoiceDetails.adjustedSum = this.invoiceDetails.sum;

      this.invoicesService
        .updateInvoice(
          this.sku,
          this.invoiceDetails.type,
          this.invoiceDetails.year,
          this.invoiceDetails.month,
          this.invoiceDetails
        )
        .subscribe({
          next: (response) => {
            console.log(response);
            // Update line chart to plot user adjusted values
            d3.selectAll('rect').remove();
            d3.selectAll('g').remove();
            this.renderLineChart(this.allData);
          },
        });
    }
  }

  reorderQuantityForm: FormGroup | any;
  safetyStockForm: FormGroup | any;

  constructor(
    private invoicesService: InvoicesService,
    private route: ActivatedRoute
  ) {}

  // Variable to store current SKU
  sku: string = 'SKU00019';

  ngOnInit(): void {
    // Create form to update reorder and safety
    this.reorderQuantityForm = new FormGroup({
      reorderQuantity: new FormControl(),
    });

    this.safetyStockForm = new FormGroup({
      safetyStock: new FormControl(),
    });

    // Get data for current SKU
    this.route.paramMap.subscribe({
      next: (params) => {
        const sku = params.get('sku');
        this.sku = <any>sku;

        if (sku) {
          this.invoicesService.getInvoiceById(sku).subscribe({
            next: (response) => {
              console.log(response);
              this.updateData(response);
              this.renderLineChart(this.allData);
            },
          });
        }
      },
    });
  }
}
