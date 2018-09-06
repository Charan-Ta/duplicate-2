import { Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { AdvanceFilter } from '../../../Interfaces/advance-filter';
import { AdvanceFilterService } from '../../../Services/advance-filter.service';
declare var $: any;
@Component({
  selector: 'advance-filter',
  templateUrl: './advance-filter.component.html',
  styleUrls: ['./advance-filter.component.css'],
  providers: [{provide: AdvanceFilter, useClass: AdvanceFilterService}]
})
export class AdvanceFilterComponent implements OnInit, OnChanges {
  public faFilter = faFilter;
  public idleTime;
  public idleInterval;
  public selectedTagIndex;
  public autosuggest = [];
  public placeholder = 'Apply Advance Filters';
  public li;
  public filter;
  public rect;
  public selectedLi = 0;
  public selectedCategory;
  public selectedSubCategory;
  public selectedOperation;
  public selectedValue;
  public tagItem;
  public closeBtn;
  public closeBtnIcon;
  public categoryItem;
  public categoryItemValue;
  public subCategoryInputItem;
  public subCategories;
  public operations;
  public values;
  public param = 'mainInput';
  public outputObject = [];
  public input;
  @ViewChild('suggestion_adv_box')ul: ElementRef;
  @ViewChild('tag_adv_list')tagList: ElementRef;
  @ViewChild('main_adv_input')mainInput: ElementRef;
  @Output('output')output = new EventEmitter<any>();
  @Input('input')categories;
  constructor(private renderer: Renderer2, private service: AdvanceFilter) { }

  ngOnInit() {
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.categories && changes.categories.currentValue !== undefined) {
      this.updateData(changes.categories.currentValue);
    }
  }

  updateData(res) {
    this.categories = res.categories;
    if (this.categories) {
    this.renderer.listen(this.mainInput.nativeElement, 'keydown', (event) => {
    this.selectKey(event);
    });
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target !== this.mainInput.nativeElement) {
      this.ul.nativeElement.style.display = 'none';
      this.autosuggest = [];
    }
  }

  selectKey(event) {
    let liSelected = this.li[this.selectedLi];
    if (event.keyCode === 13) {
      if (this.param === 'mainInput') {
        this.selectedCategory = this.categories[this.selectedLi];
        this.makeTag();
      } else if (this.param === 'subCategory') {
        this.selectedSubCategory = this.subCategories[this.selectedLi];
        this.completeSubCategory();
      } else if (this.param === 'operation') {
        this.selectedOperation = this.operations[this.selectedLi];
        this.loadValueSuggestions(event);
      } else {
        this.selectedValue = this.values[this.selectedLi];
        this.processTag();
      }
    } else if (event.keyCode === 40) {
      event.preventDefault();
      this.idleTime = 0;
      liSelected.setAttribute('tabIndex', this.selectedLi);
      liSelected.focus();
      liSelected.classList.remove('selected');
      if (this.selectedLi < this.li.length - 1) {
      this.selectedLi++;
      } else {
      this.selectedLi = 0;
      }
      liSelected = this.li[this.selectedLi];
      liSelected.setAttribute('tabIndex', this.selectedLi);
      liSelected.classList.add('selected');
      liSelected.focus();
    } else if (event.keyCode === 38) {
      event.preventDefault();
      this.idleTime = 0;
      liSelected.setAttribute('tabIndex', this.selectedLi);
      liSelected.focus();
      liSelected.classList.remove('selected');
      if (this.selectedLi > 0) {
      this.selectedLi--;
      } else {
      this.selectedLi = this.li.length - 1;
      }
      liSelected = this.li[this.selectedLi];
      liSelected.setAttribute('tabIndex', this.selectedLi);
      liSelected.classList.add('selected');
      liSelected.focus();
    } else if (event.shiftKey && event.keyCode === 9) {
      event.preventDefault();
      this.autosuggest = [];
      this.selectedTagIndex = this.tagList.nativeElement.children.length - 1;
      this.editTag(this.tagList.nativeElement.lastChild.lastChild);
    } else {
      this.idleTime = 0;
      if (this.param === 'mainInput') {
        this.mainInput.nativeElement.focus();
      } else {
        this.subCategoryInputItem.focus();
      }
    }
  }

  timerIncrement() {
    this.idleTime += 1;
    if (this.idleTime > 4) {
      this.selectedLi = 0;
      this.ul.nativeElement.style.display = 'none';
      this.autosuggest = [];
      this.mainInput.nativeElement.blur();
    }
  }

  stopTimer() {
    clearInterval(this.idleInterval);
  }

  startTimer() {
    this.idleTime = 0;
    this.idleInterval = setInterval(() => { this.timerIncrement(); }, 1000);
  }

  showSuggestions(event, autoSuggestData, input) {
    this.selectedLi = 0;
    this.ul.nativeElement.style.display = '';
    this.autosuggest = [];
    this.filter = input.value.toLowerCase();
    this.rect = event.target.getBoundingClientRect();
    for (let i = 0; i < autoSuggestData.length; i++) {
      // creating a list of keys for autosuggest
      if (autoSuggestData[i].label.toLowerCase().indexOf(this.filter) > -1) {
        this.autosuggest.push(autoSuggestData[i].label);
      } else {
        this.autosuggest.splice(i, 1);
      }
    }
    setTimeout(() => {
      this.li = this.ul.nativeElement.getElementsByTagName('li');
      if (this.li.length > 0) {
        this.li[0].classList.add('selected');
      }
    }, 0);
    // make idle time 0 and clear interval
    this.idleTime = 0;
    clearInterval(this.idleInterval);
    this.idleInterval = setInterval(() => { this.timerIncrement(); }, 1000);
  }

  makeTag() {
    // make idle time 0 and clear interval
      this.idleTime = 0;
      clearInterval(this.idleInterval);
      // making suggestion list empty
      this.autosuggest = [];
      // making input empty
      this.mainInput.nativeElement.value = '';
      // disabling main input
      this.mainInput.nativeElement.setAttribute('disabled', 'disabled');
      // creating tag li
      this.tagItem = this.renderer.createElement('li');
      this.renderer.addClass(this.tagItem, 'tag');
      // adding close button
      this.closeBtn = this.renderer.createElement('span');
      this.renderer.addClass(this.closeBtn, 'close-btn');
      this.renderer.listen(this.closeBtn, 'click', (event) => {
        this.removeTag(event.target);
      });
      this.closeBtnIcon = this.renderer.createText('x');
      this.renderer.appendChild(this.closeBtn, this.closeBtnIcon);
      // adding the selected key to li
      this.categoryItem = this.renderer.createElement('span');
      this.renderer.addClass(this.categoryItem, 'key');
      this.categoryItemValue = this.renderer.createText(this.selectedCategory.label + ':');
      this.renderer.appendChild(this.categoryItem, this.categoryItemValue);
      // adding input for subkey
      this.subCategoryInputItem = this.renderer.createElement('input');
      this.renderer.listen(this.subCategoryInputItem, 'keydown', (event) => {
      this.selectKey(event);
      });
      this.renderer.listen(this.subCategoryInputItem, 'focus', (event) => {
        this.loadSubCategorySuggestions(event);
      });
      this.renderer.listen(this.subCategoryInputItem, 'click', (event) => {
        this.loadSubCategorySuggestions(event);
      });
      this.renderer.listen(this.subCategoryInputItem, 'input', (event) => {
        this.showSuggestions(event, this.subCategories, this.subCategoryInputItem);
      });
      // appending close button,selected key, input to the tag li
      this.renderer.appendChild(this.tagItem, this.closeBtn);
      this.renderer.appendChild(this.tagItem, this.categoryItem);
      this.renderer.appendChild(this.tagItem, this.subCategoryInputItem);
      // adding tag li to ul
      this.renderer.appendChild(this.tagList.nativeElement, this.tagItem);
      // focusing inner input
      this.subCategoryInputItem.focus();
      // make placeholder empty
      this.placeholder = '';
  }



   completeSubCategory() {
      this.renderer.removeChild(this.tagItem, this.subCategoryInputItem);
      this.categoryItem = this.renderer.createElement('span');
      this.renderer.addClass(this.categoryItem, 'key');
      this.categoryItemValue = this.renderer.createText(this.selectedSubCategory.label + ':');
      this.renderer.appendChild(this.categoryItem, this.categoryItemValue);
      // adding input for subkey
      this.subCategoryInputItem = this.renderer.createElement('input');
      this.renderer.listen(this.subCategoryInputItem, 'keydown', (event) => {
      this.selectKey(event);
      });
      this.renderer.listen(this.subCategoryInputItem, 'focus', (event) => {
        this.loadOperationSuggestions(event);
      });
      this.renderer.listen(this.subCategoryInputItem, 'click', (event) => {
        this.loadOperationSuggestions(event);
      });
      this.renderer.listen(this.subCategoryInputItem, 'input', (event) => {
        this.showSuggestions(event, this.operations, this.subCategoryInputItem);
      });
      // appending,selected key, input to the tag li
      this.renderer.appendChild(this.tagItem, this.categoryItem);
      this.renderer.appendChild(this.tagItem, this.subCategoryInputItem);

      this.subCategoryInputItem.focus();
  }

  completeOperations(event) {
    this.renderer.removeChild(this.tagItem, this.subCategoryInputItem);
      this.categoryItem = this.renderer.createElement('span');
      this.renderer.addClass(this.categoryItem, 'key');
      if (this.values == null) {
        this.ul.nativeElement.style.display = 'none';
        this.categoryItemValue = this.renderer.createText(this.selectedOperation.label);
        this.renderer.appendChild(this.categoryItem, this.categoryItemValue);
        if (!this.createObject()) {
          this.removeTag(event);
        }
        this.renderer.appendChild(this.tagItem, this.categoryItem);
        this.resetValues();
      } else if (this.values === 'text') {
        this.ul.nativeElement.style.display = 'none';
        this.categoryItemValue = this.renderer.createText(this.selectedOperation.label + ':');
        this.renderer.appendChild(this.categoryItem, this.categoryItemValue);
        this.subCategoryInputItem = this.renderer.createElement('input');
        this.renderer.listen(this.subCategoryInputItem, 'keydown', (event) => {
          if (event.which === 13 || event.keyCode === 9) {
            event.preventDefault();
            this.subCategoryInputItem.blur();
          }
        });
        this.renderer.listen(this.subCategoryInputItem, 'focusout', (event) => {
          this.completeTag(event);
        });
        // appending,selected key, input to the tag li
        this.renderer.appendChild(this.tagItem, this.categoryItem);
        this.renderer.appendChild(this.tagItem, this.subCategoryInputItem);
        this.subCategoryInputItem.focus();
      } else {
        this.categoryItemValue = this.renderer.createText(this.selectedOperation.label + ':');
        this.renderer.appendChild(this.categoryItem, this.categoryItemValue);
        // adding input for subkey
        this.subCategoryInputItem = this.renderer.createElement('input');
        this.renderer.listen(this.subCategoryInputItem, 'keydown', (event) => {
        this.selectKey(event);
        });
        this.renderer.listen(this.subCategoryInputItem, 'focus', (event) => {
          this.showSuggestions(event, this.values, this.subCategoryInputItem);
        });
        this.renderer.listen(this.subCategoryInputItem, 'click', (event) => {
          this.showSuggestions(event, this.values, this.subCategoryInputItem);
        });
        this.renderer.listen(this.subCategoryInputItem, 'input', (event) => {
          this.showSuggestions(event, this.values, this.subCategoryInputItem);
        });
        // appending,selected key, input to the tag li
        this.renderer.appendChild(this.tagItem, this.categoryItem);
        this.renderer.appendChild(this.tagItem, this.subCategoryInputItem);
        this.subCategoryInputItem.focus();
      }

  }

  editTag(event) {
    console.log('edit Tag');
  }

  createTag(event) {
    if(this.param === 'mainInput') {
      this.selectedCategory = this.categories[$(event.target).index()];
      this.makeTag();
    } else if (this.param === 'subCategory') {
      this.selectedSubCategory = this.subCategories[$(event.target).index()]; 
      this.completeSubCategory();
    } else if (this.param === 'operation') {
      this.selectedOperation = this.operations[$(event.target).index()];
      this.loadValueSuggestions(event);
    } else {
       this.selectedValue = this.values[$(event.target).index()];
       this.processTag();
    }
  }

  removeTag(target) {
    let index = $(target.parentNode).index();
    this.outputObject.splice(index,1);
    this.output.emit(this.outputObject);
    target.parentNode.parentNode.removeChild(target.parentNode.parentNode.childNodes[index]);
    this.resetValues();
  }

  completeTag(event) {
    this.selectedValue = event.target.value;
    if (this.selectedValue === '') {
      this.selectedValue = 'empty';
    }
    if (event.type === 'focusout') {
      this.processTag();
    } else {
      return;
    }
  }

  processTag() {
     // createEntry
     if (this.createObject()) {
      // removing input box
      this.renderer.removeChild(this.tagItem, this.subCategoryInputItem);
      // adding subkey
      this.categoryItem = this.renderer.createElement('span');
      this.renderer.addClass(this.subCategoryInputItem, 'subkey');
      if (typeof this.selectedValue == "string")
        this.categoryItemValue = this.renderer.createText(this.selectedValue);
      else
        this.categoryItemValue = this.renderer.createText(this.selectedValue.label);
      this.renderer.listen(this.categoryItem, 'click', (event) => {
        this.editTag(event.target);
      });
      this.renderer.appendChild(this.categoryItem, this.categoryItemValue);
      // appending selected subkey to the created tag
      this.renderer.appendChild(this.tagItem, this.categoryItem);
      // adding tag li to ul
      // if (this.editedIndex == null) {
      // this.renderer.appendChild(this.tagList.nativeElement, this.tagItem);
      // } else {
      // this.editedIndex = null;
      // }
    } else {
      this.removeTag(this.categoryItem);
    }
    this.resetValues();
  }

  loadSubCategorySuggestions(event) {
    this.service.getSubCategories(this.selectedCategory).subscribe(res => {
   this.subCategories = res.subCategories;
   if (this.subCategories) {
     this.param = 'subCategory';
     this.showSuggestions(event, this.subCategories, this.subCategoryInputItem);
   }
    });
 }

 loadOperationSuggestions(event) {
    this.service.getOperations(this.selectedCategory, this.selectedSubCategory).subscribe(res => {
   this.operations = res.operations;
   if (this.operations) {
     this.param = 'operation';
       this.showSuggestions(event, this.operations, this.subCategoryInputItem);
   }
   });
 }

 loadValueSuggestions(event) {
   this.service.getValues(this.selectedCategory, this.selectedSubCategory, this.selectedOperation).subscribe(res => {
   this.values = res.values;
   this.param = 'value';
   this.completeOperations(event);
   });
 }

  createObject() {
   const data = {
     category: this.selectedCategory.name,
     subCategory: this.selectedSubCategory.name,
     operation: this.selectedOperation.name,
     value: typeof this.selectedValue=="string"?this.selectedValue:this.selectedValue.name
    };
   for(let i=0; i<this.outputObject.length;i++) {
    if (this.isEquivalent(this.outputObject[i],data)) {
     return false;
     }
   } 
   this.outputObject.push(data);
   this.output.emit(this.outputObject);
   return true;
  }

  resetValues() {
    this.selectedLi = 0;
    this.mainInput.nativeElement.removeAttribute('disabled');
    this.ul.nativeElement.style.display = '';
    this.selectedCategory = null;
    this.selectedSubCategory = null;
    this.selectedOperation = null;
    this.selectedValue = null;
    this.param = 'mainInput';
    this.mainInput.nativeElement.focus();
  }

  isEquivalent(a, b) {
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
   }
}
