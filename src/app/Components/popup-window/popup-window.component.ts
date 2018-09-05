import { Component, ViewChild, TemplateRef, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { faSort, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';

@Component({
    providers: [],
    selector: 'app-popup-window',
    host: { '(document:click)': 'onClick($event)' },
    templateUrl: './popup-window.component.html',
    styleUrls: ['./popup-window.component.css']
})
export class PopupWindowComponent implements OnInit, OnChanges {
    @ViewChild('content') content: TemplateRef<any>;
    @Input() public availableFields;
    @Input() public TotalavailableFields;
    @Output() masterArray = new EventEmitter<any>();
    public tableheadings_popup;
    public selected_fields: Array<string> = [];
    public selected_fields_to_display = [];
    public intermediate_storing_array = [];
    public intermediate_storing_array_1 = [];
    public fields_to_display = [];
    public faSort = faSort;
    public faSortDown = faCaretDown;
    public faSortUp = faCaretUp;
    public closeResult: string;
    public selection_index = [];


    constructor(private modalService: NgbModal) { }

    ngOnInit() {
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        if (changes.TotalavailableFields && changes.TotalavailableFields.currentValue !== undefined) {
            this.TotalavailableFields = changes.TotalavailableFields.currentValue;
        }
        if (changes.availableFields && changes.availableFields.currentValue !== undefined) {
            this.availableFields = changes.availableFields.currentValue;
            this.updateData();
        }
    }

    updateData() {
        if (this.TotalavailableFields && this.availableFields) {
            for (let m = 0; m < this.TotalavailableFields.length; m++) {
                for (let n = 0; n < this.availableFields.length; n++) {
                    if ((this.TotalavailableFields[m].name === this.availableFields[n].name)) {
                      this.TotalavailableFields.splice(m, 1);
                    }
                }
            }
            this.tableheadings_popup = (this.TotalavailableFields).slice(0);
            this.selected_fields_to_display = this.availableFields;
        }
    }

    // From Left Column to Right Column
    toggleVisibility_left(displayfields) {
        if ((this.intermediate_storing_array.indexOf(displayfields)) < 0) {
            this.intermediate_storing_array.push(displayfields);
        } else {
            this.intermediate_storing_array.splice(this.intermediate_storing_array.indexOf(displayfields), 1);
        }
    }
    save_in_displayfields_l2r() {
        const arr1 = this.intermediate_storing_array;
        this.tableheadings_popup = this.tableheadings_popup.filter(function (x) {
            return arr1.indexOf(x) < 0;
        });
        for (let n = 0; n < this.intermediate_storing_array.length; n++) {
            this.selected_fields_to_display.push(arr1[n]);
        }
        this.intermediate_storing_array = [];
    }

    // From Right Column to Left Column
    toggleVisibility_right(heading) {
        if ((this.intermediate_storing_array_1.indexOf(heading)) < 0) {
            this.intermediate_storing_array_1.push(heading);
        } else {
            this.intermediate_storing_array_1.splice(this.intermediate_storing_array_1.indexOf(heading), 1);
        }
    }
    save_in_displayfields_r2l() {
        const arr2 = this.intermediate_storing_array_1;
        this.selected_fields_to_display = this.selected_fields_to_display.filter(function (x) {
            return arr2.indexOf(x) < 0;
        });
        for (let n = 0; n < this.intermediate_storing_array_1.length; n++) {
            this.tableheadings_popup.push(arr2[n]);
        }
        this.intermediate_storing_array_1 = [];
    }

    // method executed on clicking the save button
    onSave() {
        this.masterArray.emit(this.selected_fields_to_display);
    }

    // method to move the selected elements in the array upwards
    order_upwards(e) {
        for (let i = 0; i < this.intermediate_storing_array_1.length; i++) {
            this.selection_index[i] = this.selected_fields_to_display.indexOf(this.intermediate_storing_array_1[i]);
        }
        this.selection_index.sort();

        for (let i = 0; i < this.selection_index.length; i++) {
            if (this.selection_index[0] > 0) {
                const swap = this.selected_fields_to_display[this.selection_index[i] - 1];
                this.selected_fields_to_display[this.selection_index[i] - 1] = this.selected_fields_to_display[this.selection_index[i]];
                this.selected_fields_to_display[this.selection_index[i]] = swap;
            }
        }
        this.selection_index = [];
    }

    // method to move the selected elements in the array downwards
    order_downwards(e) {
        for (let i = 0; i < this.intermediate_storing_array_1.length; i++) {
            this.selection_index[i] = this.selected_fields_to_display.indexOf(this.intermediate_storing_array_1[i]);
        }
        this.selection_index.sort();

        for (let i = this.selection_index.length - 1; i >= 0; i--) {
            if (this.selection_index[this.selection_index.length - 1] < this.selected_fields_to_display.length - 1) {
                const swap = this.selected_fields_to_display[this.selection_index[i] + 1];
                this.selected_fields_to_display[this.selection_index[i] + 1] = this.selected_fields_to_display[this.selection_index[i]];
                this.selected_fields_to_display[this.selection_index[i]] = swap;
            }
        }
        this.selection_index = [];
    }

    // on clicking the cursor outside the total fields block --> the selection is removed
    // on clicking the cursor on upward and downward buttons --> the selection should be maintained
    public onClick(event) {
        if (!event.target.classList.contains('remove_selection_clicked_outside_l')) {
            this.intermediate_storing_array = [];
        }
        if ((!event.target.classList.contains('remove_selection_clicked_outside_r'))) {
            this.intermediate_storing_array_1 = [];
        }
    }

    // open method is used to create a popup window
    // this makes use of modalService from the package ng-bootstrap
    open() {
        this.modalService.open(this.content).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    // this method closes the popup window when clicking on some locations of the document
    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }
}
