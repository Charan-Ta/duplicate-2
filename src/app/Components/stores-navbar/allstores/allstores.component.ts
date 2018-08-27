import { Component, OnInit} from '@angular/core';
import {Collection} from '../../../Interfaces/collection';
import {StoresCollection} from '../../../Services/collection.service';

@Component({
  selector: 'app-allstores',
  templateUrl: './allstores.component.html',
  styleUrls: ['./allstores.component.css'],
  providers:[{provide:Collection,useClass:StoresCollection}]
})
export class AllstoresComponent implements OnInit {
  public tableConfig;
  public storesCollection;
  constructor(private collection:Collection) {}

  ngOnInit() {
    this.storesCollection = this.collection;
    this.setTableConfig();
  }
  
  setTableConfig(){   
      this.tableConfig = {
        tableHeight: 300,//in px(optional)
        tableWidth: 100,// in %(optional)
        cellPadding: 15,// in px(optional)
        cellMinWidth: 100,// in px(optional)
        resize: true,//(optional)
        sort: true,//(optional)
        isFiltered: false,//(optional)
        filter:null,//(optional)
        columnNames:['StoreName','AppleID','City','ContractID','Country']//(mandatory)
      }
  }

  filterData(event){
      this.tableConfig.isFiltered=true;
      this.tableConfig.filter=event;
      this.tableConfig = Object.assign({}, this.tableConfig);
  }
  
}
