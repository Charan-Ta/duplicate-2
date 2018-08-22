import { Component, OnInit} from '@angular/core';
import {Collection} from '../../../Interfaces/collection';
import {StoresCollection} from '../../../Services/collection.service';

@Component({
  selector: 'app-allstores',
  templateUrl: './allstores.component.html',
  styleUrls: ['./allstores.component.css'],
  providers:[{provide: Collection,useClass:StoresCollection}]
})
export class AllstoresComponent implements OnInit {
  public parameters;
  public tableData=[];
  public tableConfig;
  constructor(private collection:Collection) {}

  ngOnInit() {
    this.collection.getURLParams();
    this.collection.load().subscribe(res=>{
      this.processData(res);
    });
  }
  
  processData(res){
    this.tableData=res;
    if(this.tableData){
      let tableHeadingNames = Object.keys(this.tableData[1]);
      tableHeadingNames = tableHeadingNames.splice(1, tableHeadingNames.length - 6);
      this.tableConfig = {
        tableHeight: 300,//in px
        tableWidth: 100,// in %
        cellPadding: 15,// in px
        cellMinWidth: 100,// in px
        resize: true,
        sort: true,
        isFiltered: false,
        columnNames:tableHeadingNames
      }
    }
  }

  filterData(event){
      this.tableConfig.isFiltered=true;
      this.tableConfig.filter=event;
      this.collection.filter(event).subscribe(res=>{
        this.tableData=[];
        this.tableData=this.tableData.concat(res);
        if(this.tableData.length>0)
          this.collection.updateURLParams();
      });
  }
  
}
