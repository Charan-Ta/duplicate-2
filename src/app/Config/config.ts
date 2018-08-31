export const FilterConfig = [
  {
    name: 'AppleID',
    label: 'Apple ID',
    operations: {}
  }, {
    name: 'City',
    label: 'City',
    operations: {}
  }, {
    name: 'ContractID',
    label: 'Contract ID',
    operations: {}
  }, {
    name: 'Country',
    label: 'Country',
    operations: {}
  }, {
    name: 'StoreName',
    label: 'Store Name',
    operations: {}
  }, {
    name: 'District',
    label: 'District',
    operations: {}
  }
];


export const AllStoresTableConfig = {
    tableHeight: 100, // in %(optional)
    tableHeadingHeight: 10, // in %(optional)
    tableBodyHeight: 90, // in %(optional)
    tableWidth: 100, // in %(optional)
    cellPadding: 15, // in px(optional)
    cellMinWidth: 100, // in px(optional)
    resize: true, // (optional)
    sort: true, // (optional)
    isFiltered: false, // (optional)
    filter: null, // (optional)
    columnNames: [{
    name: 'AppleID',
    label: 'Apple ID'
  }, {
    name: 'City',
    label: 'City'
  }, {
    name: 'ContractID',
    label: 'Contract ID'
  }, {
    name: 'Country',
    label: 'Country'
  }, {
    name: 'StoreName',
    label: 'Store Name'
  }, {
    name: 'District',
    label: 'District'
  }]// (mandatory)
};
