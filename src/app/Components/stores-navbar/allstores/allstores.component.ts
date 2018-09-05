import { Component, OnInit, ViewChild } from '@angular/core';
import { Collection } from '../../../Interfaces/collection';
import { FilterConfig,
         AllStoresTableConfig,
         BaseLineInformation,
         AncilliaryElements,
         DemoElements,
         FixtureDetails,
         ProgramDetails,
         ProgramPipeline,
         twoDandthreeDElements } from '../../../Config/config';
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
  public storedFields;
  public totalAvailableFields;
  constructor(private collection: Collection) { }

  ngOnInit() {
    this.storesCollection = this.collection;
    this.setTableConfig();
    this.setFilterConfig();
  }

  setTableConfig() {
    this.tableConfig = AllStoresTableConfig;
    this.storedFields = this.tableConfig.columnNames;
    this.totalAvailableFields = BaseLineInformation;
  }

  setFilterConfig() {
    this.filterConfig = FilterConfig;
    this.filterConfig.columnNames = this.tableConfig.columnNames;
  }

  filterData(event) {
    this.tableConfig.isFiltered = true;
    this.tableConfig.filter = event;
    this.tableConfig = Object.assign({}, this.tableConfig);
  }

  // Method to execute the popup
  popup() {
    this.columnSelectPopup.open();
  }

  masterArrayHandler(event: any) {
    this.storedFields = event;
    this.tableConfig.columnNames = this.storedFields;
    this.filterConfig.columnNames = this.storedFields;
    this.tableConfig = Object.assign({}, this.tableConfig);
    this.filterConfig = Object.assign({}, this.filterConfig);
  }


}
