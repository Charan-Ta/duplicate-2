import { Component, OnInit } from '@angular/core';
import { Collection } from '../../../Interfaces/collection';
import { FilterConfig, AllStoresTableConfig } from '../../../Config/config';
import { StoresCollection } from '../../../Services/collection.service';

@Component({
  selector: 'app-allstores',
  templateUrl: './allstores.component.html',
  styleUrls: ['./allstores.component.css'],
  providers: [{ provide: Collection, useClass: StoresCollection }]
})
export class AllstoresComponent implements OnInit {
  public tableConfig;
  public storesCollection;
  public filterConfig;
  public fields_displayed = [];
  constructor(private collection: Collection) { }

  ngOnInit() {
    this.storesCollection = this.collection;
    this.setTableConfig();
    this.setFilterConfig();
  }

  setTableConfig() {
    this.tableConfig = AllStoresTableConfig;
  }

  setFilterConfig() {
    this.filterConfig = FilterConfig;
  }

  filterData(event) {
    this.tableConfig.isFiltered = true;
    this.tableConfig.filter = event;
    this.tableConfig = Object.assign({}, this.tableConfig);
  }
  fieldsDisplayed(event) {
    this.fields_displayed = event;
    console.log(this.fields_displayed);
  }
}
