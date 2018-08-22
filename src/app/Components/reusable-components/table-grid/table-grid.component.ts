import { Component, OnInit, OnChanges, SimpleChange, Input, Renderer, Output, EventEmitter  } from '@angular/core';
import { faSort, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import {Collection} from '../../../Interfaces/collection';
import {StoresCollection} from '../../../Services/collection.service';

declare var $: any;
@Component({
  selector: 'table-grid',
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.css'],
  providers:[{provide: Collection,useClass:StoresCollection}]
})
export class TableGridComponent implements OnInit, OnChanges {
  @Input('tableData')tableData;
  @Input('config')tableConfig;
  @Input('filterData')filterData;s
  public columnWidth=[];
  public start;
  public pressed=false;
  public lazyLoad=false;
  public startX;
  public leftColIndex;
  public rightColIndex;
  public leftColWidth;
  public rightColWidth;
  public _tableData=[];
  public selectedindex=0;
  public selectedSortColumn=localStorage.getItem('selectedColumn')||null;
  public sortingOrder=localStorage.getItem('sortingOrder')||null;;
  public faSort = faSort;
  public faSortDown = faCaretDown;
  public faSortUp = faCaretUp;
  constructor(private renderer: Renderer,private collection:Collection) { 
  }

  ngOnInit() {
    if(localStorage.getItem('columnWidth')){
      this.columnWidth = localStorage.getItem('columnWidth').split(",");
    }
  }

  ngOnChanges(changes:{[propKey: string]:SimpleChange}){
    if(changes.tableData && changes.tableData.currentValue!=undefined){
      this.updateData(changes.tableData.currentValue);
    }
    if(changes.tableConfig && changes.tableConfig.currentValue!=undefined){
      this.setTableConfig(changes.tableConfig.currentValue);
    }
  }

  setTableConfig(res){
    this.tableConfig=res;
    //Setting Default Parameters if the user hasn't passed any of the following
    if(!this.tableConfig.tableHeight)
    this.tableConfig.tableHeight=300;//in px
    if(!this.tableConfig.tableWidth)
    this.tableConfig.tableWidth=100;//in %
    if(!this.tableConfig.cellPadding)
    this.tableConfig.cellPadding=10;// in px
    if(!this.tableConfig.cellMinWidth)
    this.tableConfig.cellMinWidth=100;// in px
    if(!this.tableConfig.resize)
    this.tableConfig.resize=true;// boolean
    if(!this.tableConfig.sort)
    this.tableConfig.sort=true;// boolean
    if(!this.tableConfig.isFiltered)
    this.tableConfig.isFiltered=false;// boolean
    if(this.columnWidth.length==0&&this.tableConfig.columnNames){
      for(let i=0;i<this.tableConfig.columnNames.length;i++){
        this.columnWidth.push(($('.tableWrapper').width()-17)/this.tableConfig.columnNames.length); 
      }
    }
  }
  
  updateData(res){
    this.lazyLoad=false; 
    this._tableData=res;  
  }
  
  onMouseDown(event){
      this.start = event.target;
      this.pressed = true;
      this.startX = event.pageX;
      this.leftColIndex = $(this.start).parent().parent().index();
      this.rightColIndex = this.leftColIndex+1; 
      this.leftColWidth = parseFloat(this.columnWidth[this.leftColIndex]);
      this.rightColWidth = parseFloat(this.columnWidth[this.rightColIndex]);
      event.stopPropagation();
      event.preventDefault();
      this.initResizableColumns();
    }
    
    initResizableColumns() {
      let minWidth = this.tableConfig.cellMinWidth;
      this.renderer.listenGlobal('body', 'mousemove', (event) => {
        if(this.pressed) {
          var rightWidth = this.rightColWidth - (event.pageX - this.startX);
          var leftWidth = this.leftColWidth + (event.pageX - this.startX);
          if(leftWidth < minWidth) {
            rightWidth = leftWidth + rightWidth - minWidth;
            leftWidth = minWidth;
          }
          if($('.table-header').width()<$('.tableWrapper').width()){
            this.columnWidth[this.rightColIndex] = rightWidth;
          }
          this.columnWidth[this.leftColIndex]=leftWidth;          
        }
      });
      this.renderer.listenGlobal('body', 'mouseup', (event) => {
        if(this.pressed) {
          this.pressed = false;
          localStorage.setItem("columnWidth",this.columnWidth.join(","));
      }
    });
  }
  
    handleScroll() {
    this.lazyLoad=true;
    this.lazyLoadData(this.lazyLoad);
    }
    
    sortBy(heading, order, i) {
      this.selectedSortColumn=i;
      this.sortingOrder = order;
      localStorage.setItem('selectedColumn',this.selectedSortColumn);
      localStorage.setItem('sortingOrder',this.sortingOrder);
      this.sortData({column:heading,order:order});
    }

    lazyLoadData(event){
      if(event){
        this.collection.loadNext(this.tableConfig.isFiltered,this.tableConfig.filter).subscribe(res=>{
          this._tableData=this._tableData.concat(res);
          if(this._tableData.length>0)
          this.collection.updateURLParams();
        });
      }
    }
  
    sortData(event){
      this.collection.sort(event.column,event.order,this.tableConfig.isFiltered,this.tableConfig.filter).subscribe(res=>{
        this._tableData=[];
        this._tableData=this._tableData.concat(res);
        if(this._tableData.length>0)
          this.collection.updateURLParams();
      });
    }
}
