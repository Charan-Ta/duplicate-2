import { Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
declare var $: any;
@Component({
  selector: 'input-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnChanges {
  public faFilter = faFilter;
  public selectedKey;
  public selectedSubkey;
  public input;
  public filter;
  public li;
  public selectedLi = 0;
  public tagItem;
  public keyItem;
  public keyItemValue;
  public subKeyInputItem;
  public subkeyItem;
  public subkeyItemValue;
  public closeBtn;
  public closeBtnIcon;
  public rect;
  public outputObject = {};
  public editedIndex;
  public idleTime;
  public idleInterval;
  public selectedTagIndex;
  public autosuggest = [];
  public placeholder = 'Apply Filters';
  public isAdvFilter;
  @ViewChild('suggestion_box')ul: ElementRef;
  @ViewChild('tag_list')tagList: ElementRef;
  @ViewChild('main_input')mainInput: ElementRef;
  @Output('output')output = new EventEmitter<any>();
  @Input('input')autosuggestData;
  constructor(private renderer: Renderer2) { }

  ngOnInit() {
  }



  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.autosuggestData && changes.autosuggestData.currentValue !== undefined) {
      this.updateData(changes.autosuggestData.currentValue);
    }
  }

  updateData(res) {
    this.autosuggestData = res.columnNames;
    this.isAdvFilter = res.advFilter;
    this.renderer.listen(this.mainInput.nativeElement, 'keydown', (event) => {
      this.selectKey(event);
    });
  }



  selectKey(event) {
    let liSelected = this.li[this.selectedLi];
    if (event.keyCode === 13) {
      this.selectedKey = liSelected.innerText;
      this.makeTag();
    } else if (event.keyCode === 40) {
      this.idleTime = 0;
      event.preventDefault();
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
      this.idleTime = 0;
      event.preventDefault();
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
      this.mainInput.nativeElement.focus();
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

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target !== this.mainInput.nativeElement) {
      this.ul.nativeElement.style.display = 'none';
      this.autosuggest = [];
    }
  }


  showSuggestions(event) {
    this.ul.nativeElement.style.display = '';
    this.autosuggest = [];
    this.filter = event.target.value.toLowerCase();
    this.rect = this.mainInput.nativeElement.getBoundingClientRect();
    for (let i = 0; i < this.autosuggestData.length; i++) {
      // creating a list of keys for autosuggest
      if (this.autosuggestData[i].name.toLowerCase().indexOf(this.filter) > -1) {
        this.autosuggest.push(this.autosuggestData[i].name);
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



  createTag(event) {
    this.selectedKey = event.target.innerText;
    this.makeTag();
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
        this.removeTag(event);
      });
      this.closeBtnIcon = this.renderer.createText('x');
      this.renderer.appendChild(this.closeBtn, this.closeBtnIcon);
      // adding the selected key to li
      this.keyItem = this.renderer.createElement('span');
      this.renderer.addClass(this.keyItem, 'key');
      this.keyItemValue = this.renderer.createText(this.selectedKey + ':');
      this.renderer.appendChild(this.keyItem, this.keyItemValue);
      // adding input for subkey
      this.subKeyInputItem = this.renderer.createElement('input');
      this.renderer.listen(this.subKeyInputItem, 'keydown', (event) => {
        if (event.which === 13 || event.keyCode === 9) {
          event.preventDefault();
          this.subKeyInputItem.blur();
        }
      });
      this.renderer.listen(this.subKeyInputItem, 'focusout', (event) => {
        this.completeTag(event);
      });
      // appending close button,selected key, input to the tag li
      this.renderer.appendChild(this.tagItem, this.closeBtn);
      this.renderer.appendChild(this.tagItem, this.keyItem);
      this.renderer.appendChild(this.tagItem, this.subKeyInputItem);
      // adding tag li to ul
      this.renderer.appendChild(this.tagList.nativeElement, this.tagItem);
      // focusing inner input
      this.subKeyInputItem.focus();
      // make placeholder empty
      this.placeholder = '';
  }



  completeTag(event) {
    this.selectedSubkey = event.target.value;
    if (this.selectedSubkey === '') {
      this.selectedSubkey = 'empty';
    }
    if (event.type === 'focusout') {
      this.processTag();
    } else {
      return;
    }
  }




  processTag() {
     // createEntry
     if (this.createEntry()) {
      // removing input box
      this.renderer.removeChild(this.tagItem, this.subKeyInputItem);
      // adding subkey
      this.subkeyItem = this.renderer.createElement('span');
      this.renderer.addClass(this.subkeyItem, 'subkey');
      this.subkeyItemValue = this.renderer.createText(this.selectedSubkey);
      this.renderer.listen(this.subkeyItem, 'click', (event) => {
        this.editTag(event.target);
      });
      this.renderer.appendChild(this.subkeyItem, this.subkeyItemValue);
      // appending selected subkey to the created tag
      this.renderer.appendChild(this.tagItem, this.subkeyItem);
      // adding tag li to ul
      if (this.editedIndex == null) {
      this.renderer.appendChild(this.tagList.nativeElement, this.tagItem);
      } else {
      this.editedIndex = null;
      }
    } else {
      this.removeTag(event);
    }
    this.selectedKey = null;
    this.selectedSubkey = null;
    this.selectedLi = 0;
    this.mainInput.nativeElement.removeAttribute('disabled');
    this.ul.nativeElement.style.display = '';
    this.mainInput.nativeElement.focus();
  }




  editTag(target) {
    this.selectedLi = 0;
    this.autosuggest = [];
    this.ul.nativeElement.style.display = 'none';
    const subkey = target.innerText;
    let key = target.parentNode.children[1].innerText;
    key = key.substr(0, key.length - 1);
    this.selectedKey = key;
    this.editedIndex = this.outputObject[key].indexOf(subkey);
    // adding input for subkey
    this.subKeyInputItem = this.renderer.createElement('input');
    this.renderer.listen(this.subKeyInputItem, 'keydown', (event) => {
      if (event.which === 13 || (!event.shiftKey && event.keyCode === 9)) {
        event.preventDefault();
        this.subKeyInputItem.blur();
      } else if (event.shiftKey && event.keyCode === 9) {
        event.preventDefault();
        this.subKeyInputItem.blur();
        this.autosuggest = [];
        this.selectedTagIndex--;
        if (this.selectedTagIndex < 0) {
          this.selectedTagIndex = this.tagList.nativeElement.children.length - 1;
        }
        this.editTag(this.tagList.nativeElement.children[this.selectedTagIndex].lastChild);
      }
    });
    this.renderer.listen(this.subKeyInputItem, 'focusout', (event) => {
      this.completeTag(event);
    });
    this.renderer.setAttribute(this.subKeyInputItem, 'value', subkey);
    this.tagItem = target.parentNode;
    this.renderer.appendChild(this.tagItem, this.subKeyInputItem);
    target.style.display = 'none';
    this.subKeyInputItem.focus();
  }





  createEntry() {
    if (Object.keys(this.outputObject).indexOf(this.selectedKey) < 0) {
      // create a new entry
      this.outputObject[this.selectedKey] = [];
      this.outputObject[this.selectedKey].push(this.selectedSubkey);
      this.output.emit(this.outputObject);
      return true;
    } else {
      if (this.outputObject[this.selectedKey].indexOf(this.selectedSubkey) >= 0 && this.editedIndex == null) {
      return false;
      } else if (this.editedIndex == null) {
        this.outputObject[this.selectedKey].push(this.selectedSubkey);
        this.output.emit(this.outputObject);
        return true;
      } else {
        this.outputObject[this.selectedKey][this.editedIndex] = this.selectedSubkey;
        this.output.emit(this.outputObject);
        return true;
      }
    }
  }




  removeTag(event) {
    event.target.parentNode.style.display = 'none';
    let s1 = event.target.parentNode.children[1].innerText;
    const s2 = event.target.parentNode.children[2].innerText;
    s1 = s1.substr(0, s1.length - 1);
    if (s1.length > 0 && s2.length > 0) {
      this.outputObject[s1].splice(this.outputObject[s1].indexOf(s2), 1);
      if (this.outputObject[s1].length === 0) {
        delete this.outputObject[s1];
      }
      this.output.emit(this.outputObject);
    }
    if (Object.keys(this.outputObject).length > 0) {
      this.placeholder = '';
    } else {
      this.placeholder = 'Apply Filter';
    }
    this.selectedKey = null;
    this.selectedSubkey = null;
    this.mainInput.nativeElement.removeAttribute('disabled');
    this.selectedLi = 0;
    this.autosuggest = [];
    this.ul.nativeElement.style.display = 'none';
  }

}
