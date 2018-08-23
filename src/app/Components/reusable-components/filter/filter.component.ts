import { Component, OnInit, OnChanges, SimpleChange, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
declare var $: any;
@Component({
  selector: 'input-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit,OnChanges {
  public faFilter = faFilter;
  public selectedKey;
  public selectedSubkey;
  public input;
  public filter;
  public li;
  public selectedLi=0;
  public tagItem;
  public keyItem;
  public keyItemValue;
  public subKeyInputItem;
  public subkeyItem;
  public subkeyItemValue;
  public closeBtn;
  public closeBtnIcon;
  public rect;
  public outputObject={};
  @ViewChild('suggestion_box')ul:ElementRef;
  @ViewChild('tag_list')tagList:ElementRef;
  @ViewChild('main_input')mainInput:ElementRef;
  @Output('output')output = new EventEmitter<any>();
  @Input('input')autosuggestData;
  constructor(private renderer: Renderer2) { }

  ngOnInit() {
  }

  ngOnChanges(changes:{[propKey: string]:SimpleChange}){
    if(changes.autosuggestData && changes.autosuggestData.currentValue!=undefined){
      this.updateData(changes.autosuggestData.currentValue);
    }
  }

  updateData(res){
    this.autosuggestData=res;
    this.renderer.listen(this.mainInput.nativeElement,'keydown',(event)=>{
      this.selectKey(event);
    });
  }


  selectKey(event){
    var liSelected=this.li[this.selectedLi];
    if(event.keyCode==13){
      this.selectedKey=liSelected.innerText;
      this.makeTag();
    }
    else if(event.keyCode === 40){
      liSelected.setAttribute('tabIndex',this.selectedLi);
      liSelected.focus();
      liSelected.classList.remove('selected');
      if(this.selectedLi<this.li.length-1)
      this.selectedLi++;
      else
      this.selectedLi=0;
      liSelected=this.li[this.selectedLi];
      liSelected.setAttribute('tabIndex',this.selectedLi);
      liSelected.classList.add('selected');
      liSelected.focus();
    }else if(event.keyCode === 38){
      liSelected.setAttribute('tabIndex',this.selectedLi);
      liSelected.focus();
      liSelected.classList.remove('selected');
      if(this.selectedLi>0)
      this.selectedLi--;
      else
      this.selectedLi=this.li.length-1;
      liSelected=this.li[this.selectedLi];
      liSelected.setAttribute('tabIndex',this.selectedLi);
      liSelected.classList.add('selected');
      liSelected.focus();
    }
  }

  showSuggestions(event){
    this.ul.nativeElement.innerHTML='';
    this.ul.nativeElement.style.display='block';
    this.input = event.target;
    this.filter = event.target.value.toLowerCase();
    this.rect = this.mainInput.nativeElement.getBoundingClientRect();
    for (let i = 0; i < this.autosuggestData.length; i++) {
      //creating a list of keys for autosuggest
        let item = this.renderer.createElement('li');
        let itemValue = this.renderer.createText(this.autosuggestData[i]);
        this.renderer.appendChild(item,itemValue);
        this.renderer.listen(item, 'click', () => {
          this.selectedKey=item.innerText;
          this.makeTag();
        });
        this.renderer.listen(item, 'keydown', (event) => {
          this.selectKey(event);
        });
        this.renderer.appendChild(this.ul.nativeElement,item);
    }
    // Loop through all list items, and hide those who don't match the search query
    let liCopy =this.ul.nativeElement.getElementsByTagName("li");
    this.li =[];
    for (let i = 0; i < liCopy.length; i++) {
      if (liCopy[i].innerHTML.toLowerCase().indexOf(this.filter) > -1) {
        this.li.push(liCopy[i]);
      } else {
        this.li.splice(i,1);
      }
    }

    this.ul.nativeElement.innerHTML='';
    for(let i = 0; i < this.li.length; i++){
      this.renderer.appendChild(this.ul.nativeElement,this.li[i]);
    }

    this.li[0].classList.add('selected');
  }
  
  makeTag(){
      //making suggestion list empty
      this.ul.nativeElement.innerHTML='';
      //making input empty
      this.input.value='';
      //disabling main input
      this.mainInput.nativeElement.setAttribute('disabled', 'disabled');   
      //creating tag li 
      this.tagItem = this.renderer.createElement('li');
      this.renderer.addClass(this.tagItem,'tag');
      //adding close button
      this.closeBtn =this.renderer.createElement('span');
      this.renderer.addClass(this.closeBtn,'close-btn');
      this.renderer.listen(this.closeBtn, 'click', (event) => {
        this.removeTag(event);
      });
      this.closeBtnIcon = this.renderer.createText('x');
      this.renderer.appendChild(this.closeBtn,this.closeBtnIcon);
      //adding the selected key to li
      this.keyItem = this.renderer.createElement('span');
      this.renderer.addClass(this.keyItem,'key');
      this.keyItemValue = this.renderer.createText(this.selectedKey+':');
      this.renderer.appendChild(this.keyItem,this.keyItemValue);
      //adding input for subkey
      this.subKeyInputItem = this.renderer.createElement('input');
      this.renderer.listen(this.subKeyInputItem, 'keydown', (event) => {
        this.completeTag(event);
      });
      //appending close button,selected key, input to the tag li
      this.renderer.appendChild(this.tagItem,this.closeBtn);
      this.renderer.appendChild(this.tagItem,this.keyItem);
      this.renderer.appendChild(this.tagItem,this.subKeyInputItem);
      //adding tag li to ul      
      this.renderer.appendChild(this.tagList.nativeElement,this.tagItem);
      //focusing inner input
      this.subKeyInputItem.focus();    
  }


  completeTag(event){
    this.selectedSubkey = event.target.value;
    if(this.selectedSubkey=="")
      this.selectedSubkey="empty";
    if(event.keyCode==9||event.keyCode == 13){
      //createEntry
      if(this.createEntry()){
        //removing input box
        this.renderer.removeChild(this.tagItem,this.subKeyInputItem);
        //adding subkey
        this.subkeyItem = this.renderer.createElement('span');
        this.renderer.addClass(this.subkeyItem,'subkey');
        this.subkeyItemValue = this.renderer.createText(this.selectedSubkey);
        this.renderer.listen(this.subkeyItem,'click',(event)=>{
          this.editTag(event);
        });
        this.renderer.appendChild(this.subkeyItem,this.subkeyItemValue);
        //appending selected subkey to the created tag
        this.renderer.appendChild(this.tagItem,this.subkeyItem);
        //adding tag li to ul      
        this.renderer.appendChild(this.tagList.nativeElement,this.tagItem);
      }else{
        this.removeTag(event);
      }
      this.mainInput.nativeElement.focus();
    }else{
      return;
    }
    this.selectedKey=null;
    this.selectedSubkey=null;
    this.mainInput.nativeElement.removeAttribute('disabled');
    this.ul.nativeElement.style.display='none';
    this.selectedLi=0;
  }

  editTag(event){
    let subkey = event.target.innerText;
    let key = event.target.parentNode.children[1].innerText;
    key=key.substr(0,key.length-1);
    this.selectedKey=key;
    this.outputObject[key].splice(this.outputObject[key].indexOf(subkey),1);
    if(this.outputObject[key].length==0){
      delete this.outputObject[key];
    }
    //adding input for subkey
    this.subKeyInputItem = this.renderer.createElement('input');
    this.renderer.listen(this.subKeyInputItem, 'keydown', (event) => {
      this.completeTag(event);
    });
    this.renderer.setAttribute(this.subKeyInputItem,'value',subkey);
    this.renderer.appendChild(event.target.parentNode,this.subKeyInputItem);
    event.target.style.display = "none";
    this.subKeyInputItem.focus();
  }
  
  createEntry(){
    if(Object.keys(this.outputObject).indexOf(this.selectedKey)<0){
      //create a new entry
      this.outputObject[this.selectedKey]=[];
      this.outputObject[this.selectedKey].push(this.selectedSubkey);
      console.log(this.outputObject);
      this.output.emit(this.outputObject);
      return true;
    }else{
      if(this.outputObject[this.selectedKey].indexOf(this.selectedSubkey)>=0)
        return false;
      else{
        this.outputObject[this.selectedKey].push(this.selectedSubkey);
        this.output.emit(this.outputObject);
        return true;
      }
    }
  }
  
  removeTag(event){
    event.target.parentNode.style.display = "none";
    let s1=event.target.parentNode.children[1].innerText;
    let s2=event.target.parentNode.children[2].innerText;
    s1 = s1.substr(0,s1.length-1);
    if(s1.length>0&&s2.length>0){
      this.outputObject[s1].splice(this.outputObject[s1].indexOf(s2),1);
      if(this.outputObject[s1].length==0){
        delete this.outputObject[s1];
      }
      this.output.emit(this.outputObject);
    }
    this.selectedKey=null;
    this.selectedSubkey=null;
    this.mainInput.nativeElement.removeAttribute('disabled');
    this.selectedLi=0;   
  }

}
