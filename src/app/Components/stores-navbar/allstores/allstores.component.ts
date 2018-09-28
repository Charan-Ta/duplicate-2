import { Component, OnInit, ViewChild } from '@angular/core';
import { Collection } from '../../../Interfaces/collection';
import { AllStoresTableConfig, AdvanceFilterConfig } from '../../../Config/config';
import { PopupWindowComponent } from '../../popup-window/popup-window.component';
import { StoresCollection } from '../../../Services/collection.service';

@Component({
  selector: 'app-allstores',
  templateUrl: './allstores.component.html',
  styleUrls: ['./allstores.component.css'],
  providers: [{ provide: Collection, useClass: StoresCollection }]
})
export class AllstoresComponent implements OnInit {
  @ViewChild(PopupWindowComponent) columnSelectPopup: PopupWindowComponent;
  public tableConfig;
  public storesCollection;
  public filterConfig;
  public advanceFilterConfig;
  public tableColumns;
  public columnCategory = 'stores';
  constructor(private collection: Collection) { }

  ngOnInit() {
    this.storesCollection = this.collection;
    this.getTableColumns();
    this.setAdvanceFilterConfig();
  }

  getTableColumns() {
    this.collection.getTableColumns().subscribe( res => {
      this.tableColumns = res;
      this.setTableConfig(this.tableColumns.stores);
    });
  }

  setTableConfig(columns) {
    this.tableConfig = AllStoresTableConfig;
    this.tableConfig.columnNames = columns.visibleColumns;
    this.setBasicFilterConfig();
  }

  setBasicFilterConfig() {
    if(this.tableConfig.columnNames){
      this.filterConfig = this.tableConfig.columnNames;
    }
  }

  setAdvanceFilterConfig() {
    this.advanceFilterConfig = AdvanceFilterConfig;
  }

  filterData(event) {
    this.tableConfig.isFiltered = true;
    this.tableConfig.filter = event;
    this.tableConfig = Object.assign({}, this.tableConfig);
  }

  filterAdvanceData(event) {
    console.log(event);
  }

  chooseColumnCategory(category) {
    this.columnCategory = category;
    let visibleCategories = [];
    if(this.columnCategory==='stores') {
      visibleCategories=visibleCategories.concat(this.tableColumns.stores.visibleColumns);
    }else if(this.columnCategory==='programs') {
      visibleCategories=visibleCategories.concat(this.tableColumns.stores.visibleColumns);
      visibleCategories=visibleCategories.concat(this.tableColumns.programs.visibleColumns);
    }else if(this.columnCategory==='fixtures') {
        visibleCategories=visibleCategories.concat(this.tableColumns.stores.visibleColumns);
        visibleCategories=visibleCategories.concat(this.tableColumns.programs.visibleColumns);
        visibleCategories=visibleCategories.concat(this.tableColumns.fixtures.visibleColumns);
     }else if (this.columnCategory==='elements') {
        visibleCategories=visibleCategories.concat(this.tableColumns.stores.visibleColumns);
        visibleCategories=visibleCategories.concat(this.tableColumns.programs.visibleColumns);
        visibleCategories=visibleCategories.concat(this.tableColumns.fixtures.visibleColumns);
        visibleCategories=visibleCategories.concat(this.tableColumns.elements.visibleColumns);
     }
    console.log(visibleCategories);
    this.tableConfig.columnNames = visibleCategories;
    this.filterConfig.columnNames = visibleCategories;
    this.tableConfig = Object.assign({}, this.tableConfig);
    this.filterConfig = Object.assign({}, this.filterConfig);
  }

  // masterArrayHandler(event: any) {
  //   this.storedFields = event;
  //   this.tableConfig.columnNames = this.storedFields;
  //   this.filterConfig.columnNames = this.storedFields;
  //   this.tableConfig = Object.assign({}, this.tableConfig);
  //   this.filterConfig = Object.assign({}, this.filterConfig);
  // }

}
