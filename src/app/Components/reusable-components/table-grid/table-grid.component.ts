import { Component, OnInit, OnChanges, SimpleChange, Input, Renderer, ReflectiveInjector} from '@angular/core';
import { faSort, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { Collection } from '../../../Interfaces/collection';
declare var $: any;
@Component({
  selector: 'table-grid',
  templateUrl: './table-grid.component.html',
  styleUrls: ['./table-grid.component.css']
})
export class TableGridComponent implements OnInit, OnChanges {
  @Input('collection') collectionClass;
  @Input('config') tableConfig;
  public columnWidth = [];
  public start;
  public pressed = false;
  public lazyLoad = false;
  public startX;
  public leftColIndex;
  public rightColIndex;
  public leftColWidth;
  public rightColWidth;
  public _tableData = [];
  public selectedindex = 0;
  public selectedSortColumn;
  public sortingOrder;
  public faSort = faSort;
  public faSortDown = faCaretDown;
  public faSortUp = faCaretUp;
  public tableBodyHeight;
  public favorites = [];
  constructor(private renderer: Renderer, private collection: Collection) {
  }

  ngOnInit() {
    if (localStorage.getItem('columnWidth')) {
      this.columnWidth = localStorage.getItem('columnWidth').split(',');
    }
    if (localStorage.getItem('selectedColumn') && localStorage.getItem('sortingOrder')) {
      this.sortingOrder = localStorage.getItem('sortingOrder');
      this.selectedSortColumn = localStorage.getItem('selectedColumn');
      this.sortData({ column: this.tableConfig.columnNames[this.selectedSortColumn].name, order: this.sortingOrder });
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.collectionClass && changes.collectionClass.currentValue !== undefined) {
      this.setProvider(changes.collectionClass.currentValue);
    }
    if (changes.tableConfig && changes.tableConfig.currentValue !== undefined) {
      this.setTableConfig(changes.tableConfig.currentValue);
    }
  }

  // set provider for collection and load first data
  setProvider(res) {
    ReflectiveInjector.resolveAndCreate([{ provide: Collection, useValue: res }]);
  }


  // set deault values for optional parameters
  setTableConfig(res) {
    this.tableConfig = res;
    // Setting Default Parameters if the user hasn't passed any of the following
    if (!this.tableConfig.tableWidth) {
      this.tableConfig.tableWidth = 100;
    } // in %
    if (!this.tableConfig.cellPadding) {
      this.tableConfig.cellPadding = 10;
    } // in px
    if (!this.tableConfig.cellMinWidth) {
      this.tableConfig.cellMinWidth = 100;
    } // in px
    if (!this.tableConfig.resize) {
      this.tableConfig.resize = true;
    } // boolean
    if (!this.tableConfig.sort) {
      this.tableConfig.sort = true;
    } // boolean
    if (this.tableConfig.isFiltered) {
      this.filterData();
    }
    this.loadData();
    this.setInitialColumnWidth();
  }

  loadData(){
    this.collection.load(this.tableConfig.tableType).subscribe(res => {
      this.updateData(res);
    });
  }

  updateData(res) {
    this.lazyLoad = false;
    this._tableData = res;
    this.tableBodyHeight = $('.tableWrapper').height()-$('.table-header').height();
  }

  setInitialColumnWidth() {
    this.columnWidth = [];
    let calculatedColWidth;
    if (this.tableConfig.columnNames) {
      if(this.tableConfig.tableType!='favorites') {
      calculatedColWidth  = ($('.tableWrapper').width()) / (this.tableConfig.columnNames.length+1);
    }
    else {
      calculatedColWidth  = ($('.tableWrapper').width()) / (this.tableConfig.columnNames.length);
    }
      for (let i = 0; i < this.tableConfig.columnNames.length+1; i++) {
        this.columnWidth.push(calculatedColWidth);
      }
    }
  }

  onMouseDown(event) {
    this.start = event.target;
    this.pressed = true;
    this.startX = event.pageX;
    this.leftColIndex = $(this.start).parent().index();
    this.rightColIndex = this.leftColIndex + 1;
    this.leftColWidth = parseFloat(this.columnWidth[this.leftColIndex]);
    this.rightColWidth = parseFloat(this.columnWidth[this.rightColIndex]);
    event.stopPropagation();
    event.preventDefault();
    this.initResizableColumns();
  }

  initResizableColumns() {
    const minWidth = this.tableConfig.cellMinWidth;
    this.renderer.listenGlobal('body', 'mousemove', (event) => {
      if (this.pressed) {
        let rightWidth = this.rightColWidth - (event.pageX - this.startX);
        let leftWidth = this.leftColWidth + (event.pageX - this.startX);
        if (leftWidth <= minWidth) {
          rightWidth = leftWidth + rightWidth - minWidth;
          leftWidth = minWidth;
        }
        if ($('.table-header').width() <= $('.tableWrapper').width() && leftWidth < this.columnWidth[this.leftColIndex]) {
          this.columnWidth[this.rightColIndex] = rightWidth;
        }
        this.columnWidth[this.leftColIndex] = leftWidth;
      }
    });
    this.renderer.listenGlobal('body', 'mouseup', (event) => {
      if (this.pressed) {
        this.pressed = false;
        localStorage.setItem('columnWidth', this.columnWidth.join(','));
      }
    });
  }

  handleScroll() {
    this.lazyLoad = true;
    this.lazyLoadData(this.lazyLoad);
  }

  sortBy(heading, order, i) {
    this.selectedSortColumn = i;
    this.sortingOrder = order;
    localStorage.setItem('selectedColumn', this.selectedSortColumn);
    localStorage.setItem('sortingOrder', this.sortingOrder);
    this.sortData({ column: heading, order: order });
  }

  lazyLoadData(event) {
    if (event) {
      this.collection.loadNext(this.tableConfig.isFiltered, this.tableConfig.filter, this.tableConfig.tableType).subscribe(res => {
        this._tableData = this._tableData.concat(res);
        if (res.length > 0) {
          this.collection.updateURLParams();
        }
      });
    }
  }

  sortData(event) {
    this.collection.sort(event.column, event.order, this.tableConfig.isFiltered, this.tableConfig.filter, this.tableConfig.tableType).subscribe(res => {
      this._tableData = [];
      this._tableData = this._tableData.concat(res);
      if (this._tableData.length > 0) {
        this.collection.updateURLParams();
      }
    });
  }

  filterData() {
    if (this.tableConfig.isFiltered) {
      this.collection.filter(this.tableConfig.filter, this.tableConfig.tableType).subscribe(res => {
        this._tableData = [];
        this._tableData = this._tableData.concat(res);
      });
    }
  }

  addToFavorites(data,event,i){
      if(event.target.checked) {
         this.favorites.push(data);
      }
      else {
         this.favorites.splice(i,1);
      }
      this.collection.addToFavorites(data).subscribe(res => {
        console.log(res);
      });
  }
}
