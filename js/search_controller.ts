import { ActionEvent, Controller } from '@hotwired/stimulus'
import { initLazyload } from '../libs/lazyload'
import { buildValueAfterSearch } from '../libs/build-value-search'
let url_type_search = '';
let url_filter = '';
export default class extends Controller {
  searchTarget: HTMLDivElement
  searchButtonTarget: HTMLButtonElement
  conditionSearchTarget: HTMLDivElement
  categorySearchTarget: HTMLDivElement
  itemSearchTarget: HTMLDivElement
  contentTarget: HTMLDivElement
  searchValueTarget: HTMLInputElement
  checkboxClickTargets 

  static targets = ['search', 'searchButton', 'conditionSearch', 'categorySearch', 'itemSearch', 'content', 'searchValue', 'checkboxClick']

  open() {
    this.searchButtonTarget.setAttribute('aria-expanded', 'true')
    this.searchTarget.classList.add('show')
    this.searchTarget.scrollTop = 0
    document.body.classList.add('is-presenting-search');
    /* processing space to top for mobile with search panel, with PC used css to always top = 0 */
    const isTopBar = (document.querySelector('.announcement-bar') as HTMLInputElement);
    const posScroll = document.documentElement.scrollTop;
    if(isTopBar && posScroll < isTopBar.offsetHeight){
      const posTop = 60 + (isTopBar.offsetHeight - posScroll);
      (document.querySelector('.search') as HTMLInputElement).style.top = posTop + 'px';
    }else{
      (document.querySelector('.search') as HTMLInputElement).style.top = '60px';
    }
    buildValueAfterSearch('.panel-search');
  }

  showDetailContent(el?: HTMLElement) {
    ;[this.conditionSearchTarget, this.categorySearchTarget, this.itemSearchTarget].forEach((target) => {
      if (el && el === target) target.classList.add('show')
      else target.classList.remove('show')
    })
  }

  close() {
    this.searchButtonTarget.setAttribute('aria-expanded', 'false')
    this.searchTarget.classList.remove('show')
    this.showDetailContent()
    document.body.classList.remove('is-presenting-search')
  }
 
  toggleInputSearch(ev) {
    let inputSearch, filterValue, listSearchElm, liSearch, a, i, txtValue;
    inputSearch = ev.target;
    filterValue = inputSearch.value.toUpperCase();
    listSearchElm = document.getElementById("search__tag");
    liSearch = listSearchElm.getElementsByTagName("li");    
    if (ev.type === 'focusin' || ev.type === 'input') {
      if(filterValue.length > 1){  
        this.searchTarget.classList.add('is-focusing-form')
        for (i = 0; i < liSearch.length; i++) {
          a = liSearch[i].getElementsByTagName("a")[0];    
          txtValue = a.textContent || a.innerText;
          if (txtValue.toUpperCase().indexOf(filterValue) > -1) {
            liSearch[i].style.display = "";
          } else {
            liSearch[i].style.display = "none";
          }
        }
      }else{
        this.searchTarget.classList.remove('is-focusing-form');
      }
    }
  }

  showConditionSearch() {
    this.showDetailContent(this.conditionSearchTarget)
  }

  showCategorySearch() {
    this.showDetailContent(this.categorySearchTarget)
  }

  showItemSearch() {
    this.showDetailContent(this.itemSearchTarget)
  }

  back() {
    this.showDetailContent()
  }

  submitFormWithCondition(event){
    event.preventDefault();
    let inputSearch = event.target.querySelector('.search-form') as HTMLInputElement | null;
    let typeForm = event.target;
    let getValueInput = inputSearch?.value;
    let querySearch = "";
    let queryGender = "";
    let querySize = "";
    let queryItem = "";
    let queryCategory = "";
    let queryStock = "";
    let queryTabSizePos = "";
    const getValGender = (typeForm.querySelector('.toggle-button__button:checked') as HTMLInputElement).value;
    if(getValGender.length > 0){ 
      queryGender += '&filter.p.m.custom.gender=' + getValGender;
    }
    const getTabActive = (typeForm.querySelector('.tab__item--active') as HTMLInputElement).getAttribute('data-tab-index-param');
    queryTabSizePos = '&tab=' + getTabActive;

    let checkSizeChecked = document.querySelectorAll<HTMLInputElement>('.js-input-size:checked');
    let getValSize = [...checkSizeChecked].map(e => e.value);   
    if(getValSize.length > 0){
      const getValSizeAll =  checkSizeChecked[0].value;
      if(getValSizeAll.includes('すべて')){
        getValSize = getValSizeAll.split(',').filter(item => item !== 'すべて');
      }
      for(var i = 0;i<getValSize.length;i++) {
        querySize += '&filter.v.option.サイズ=' + getValSize[i];
     }     
    }
    const getValItem = [...document.querySelectorAll<HTMLInputElement>('.js-input-item:checked')].map(e => e.value);
    if(getValItem.length > 0){
      for(var i = 0;i<getValItem.length;i++) {
        queryItem += '&filter.p.m.custom.item=' + getValItem[i];
     }
    }
    const getValCategory = [...document.querySelectorAll<HTMLInputElement>('.js-input-category:checked')].map(e => e.value);
    if(getValCategory.length > 0){
      for(var i = 0;i<getValCategory.length;i++) {
        queryCategory += '&filter.p.m.custom.category=' + getValCategory[i];
     }
    }
    const getValStock = (typeForm.querySelector('.js-input-stock') as HTMLInputElement).checked;
    if(getValStock){
      queryStock = '&filter.v.availability=1';
    }
    if(getValueInput == ''){
      getValueInput = '*';
    }
    querySearch = '/search?q=' + getValueInput + queryGender + querySize + queryItem + queryCategory + queryStock + queryTabSizePos + '&sort_by=relevance'
    console.log(querySearch);
    window.location.href = querySearch;
  }

  submitFormNormal(event){
    event.preventDefault();
    const valueSearch = event.target.querySelector('.search-form').value;
    if(valueSearch.includes('#')){
      window.location.href = '/search?view=filter-content&q=' + valueSearch.replace('#','hashtag_') + '&type=product';      
    }else{
      window.location.href = '/search?view=filter-content&q=' + valueSearch + '&type=product';
    }   
  }

  renderDataItem(string,type){
    if(string.charAt(0) == '&' || string.charAt(0) == '?'){
      string = string.substring(1);
    }
    let defineHrefPage  = type + '?' + string;
    history.pushState(null, null, defineHrefPage);
    fetch(defineHrefPage, {
      method: 'GET',
      headers: { 
        'Content-Type': 'text/html'
      } 
    })
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const dataHtml = parser.parseFromString(data, "text/html");
      const countItemText = dataHtml.getElementById('ProductCount').innerHTML; 
      const dataListItem = dataHtml.querySelector('.product-list-result').innerHTML;
      document.querySelector('.product-list-result').innerHTML = dataListItem;
      document.getElementById('ProductCount').innerHTML = countItemText;
      initLazyload();
    }) 
  }
  
  getValueCheckBox(event,type,value) {
    /* 
      - Logic when clicking the checkbox with value 'すべて' will remove all checkboxes except itself and opposite
      - With section 'Size' will be related with the section Item, which will define which items belong to which tab on Size section
    */
    let checkboxList = document.querySelectorAll<HTMLInputElement>(".js-input-" + type);
    let checkboxListAll = document.querySelectorAll<HTMLInputElement>(".js-input-all-" + type);
    const getValItem = [...document.querySelectorAll<HTMLInputElement>('.js-input-'+ type +':checked')].map(e => e.value);
    let getValListSize;
    if(type == 'size') {
      getValListSize = document.querySelectorAll<HTMLInputElement>(".filter-category-item");
    }
    if(getValItem.length > 0){
      const valueClicked = event.target.name;
      if(valueClicked === 'すべて'){
        for(let i = 0; i < checkboxList.length; i++) {
          checkboxList[i].checked = false; 
        } 
        event.target.checked = true;
      }else{
        for(let i = 0; i < checkboxListAll.length; i++) {
          checkboxListAll[i].checked = false; 
        } 
      }
      if(type == 'size') {
        for(let i = 0; i < getValListSize.length; i++) {
          getValListSize[i].classList.remove("no-active")
          if(getValListSize[i].getAttribute('data-value') != value){
            getValListSize[i].classList.add("no-active");
            getValListSize[i].checked = false;
          }
        }
      }
    }else{
      if(type == 'size') {
        for(let i = 0; i < getValListSize.length; i++) {
          getValListSize[i].classList.remove("no-active")
      }
      }
    }
  }

  clickInputSize(event){
    let valEle;
    let getValListSize = document.querySelectorAll<HTMLInputElement>(".filter-category-item");
    const element = this.checkboxClickTargets;
    for(let i = 0; i < element.length; i++) {
      if((element[i]).checked == true){
        valEle = element[i].dataset.tab;
      }
    }
    this.getValueCheckBox(event,'size',valEle);
  }

  clickInputItem(event){
    this.getValueCheckBox(event,'item',null);
  }

  clickInputCategory(event){
    this.getValueCheckBox(event,'category',null);
  }

  clickSortBy(event){
    let getValueSort = event.target.value;
    let currentHandle = new URLSearchParams(window.location.search);
    currentHandle.delete('page'); 
    let currentHandleTxt = currentHandle.toString();
    let sort_by = currentHandle.get('sort_by'); 
    let getType = event.target.getAttribute('data-type');
    if(getType.includes("collections")){
      url_type_search = getType;
    }
    if(sort_by === null){
      url_filter = currentHandleTxt + '&sort_by=' + getValueSort;
    }else{
      currentHandle.set('sort_by', getValueSort)
      url_filter = currentHandle.toString();
    }
    document.querySelector<HTMLInputElement>('.sort-button').click();
    this.renderDataItem(url_filter,url_type_search);  
  }
  
  clickInputStock(event){
    const checkbox = document.getElementById('name-stock') as HTMLInputElement | null;
    let currentHandle = new URLSearchParams(window.location.search);
    currentHandle.delete('page');
    let currentHandleTxt = currentHandle.toString();
    let getType = event.target.getAttribute('data-type');
    if(getType.includes("collections")){
      url_type_search = getType;
    }
    if(checkbox?.checked){
      url_filter = currentHandleTxt + '&filter.v.availability=1';
    }else{
      currentHandle.delete('filter.v.availability');
      url_filter = currentHandle.toString();
    }
    this.renderDataItem(url_filter,url_type_search);
  }

  clickInputGender(event){
    let getValueInput = event.target.value;
    let currentHandle = new URLSearchParams(window.location.search);
    currentHandle.delete('page');
    let currentHandleTxt = currentHandle.toString();
    let getType = event.target.getAttribute('data-type');
    let keySearch = currentHandle.get('filter.p.m.custom.gender'); 
    if(getType.includes("collections")){
      url_type_search = getType;
    }
    if(keySearch === null){
      url_filter = currentHandleTxt + '&filter.p.m.custom.gender=' + getValueInput;
    }else{
      currentHandle.set('filter.p.m.custom.gender', getValueInput)
      url_filter = currentHandle.toString();
    }
    this.renderDataItem(url_filter,url_type_search);
  }

}
