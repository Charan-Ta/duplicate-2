import { Component, OnInit} from '@angular/core';
import {Collection} from '../../../Interfaces/collection';
import {FilterConfig} from '../../../Interfaces/templates';
import {StoresCollection} from '../../../Services/collection.service';

@Component({
  selector: 'app-allstores',
  templateUrl: './allstores.component.html',
  styleUrls: ['./allstores.component.css'],
  providers: [{provide: Collection, useClass: StoresCollection}]
})
export class AllstoresComponent implements OnInit {
  public tableConfig;
  public storesCollection;
  public filterConfig;
  constructor(private collection: Collection) {}

  ngOnInit() {
    this.storesCollection = this.collection;
    this.setTableConfig();
    this.setFilterConfig();
  }

  setTableConfig() {
      this.tableConfig = {
        tableHeight: 100, // in %(optional)
        tableHeadingHeight: 10, // in %(optional)
        tableBodyHeight: 90, // in %(optional)
        tableWidth: 100, // in %(optional)
        cellPadding: 15, // in px(optional)
        cellMinWidth: 100, // in px(optional)
        resize: true, // (optional)
        sort: true, // (optional)
        isFiltered: false, // (optional)
        filter: null, // (optional)
        columnNames: ['StoreName', 'AppleID', 'City', 'ContractID', 'Country', 'District']// (mandatory)
      };
  }

  setFilterConfig() {
    this.filterConfig = FilterConfig;
  }

  filterData(event) {
      this.tableConfig.isFiltered = true;
      this.tableConfig.filter = event;
      this.tableConfig = Object.assign({}, this.tableConfig);
  }

}
