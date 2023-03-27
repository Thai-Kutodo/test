import { Controller } from '@hotwired/stimulus'
import { subscribe } from 'subscribe-ui-event'

export default class extends Controller {
  sliderContainerTarget: HTMLDivElement
  sliderLowTarget: HTMLInputElement
  sliderHighTarget: HTMLInputElement
  labelLowTarget: HTMLOutputElement
  labelHighTarget: HTMLOutputElement
  rangeTarget: HTMLSpanElement

  static targets = ['sliderContainer', 'sliderLow', 'sliderHigh', 'labelLow', 'labelHigh', 'range']

  connect(): void {
    this.setRange()

    subscribe(
      'resize',
      () => {
        this.setRange()
      },
      {
        useRAF: true,
      }
    )
  }

  onChangeValueLow() {
    if (Number(this.sliderLowTarget.value) >= Number(this.sliderHighTarget.value) - 5000) {
      this.sliderLowTarget.value = `${Number(this.sliderHighTarget.value) - 5000}`
    }
    this.setRange()
  }

  onChangeValueHigh() {
    if (Number(this.sliderHighTarget.value) <= Number(this.sliderLowTarget.value) + 5000) {
      this.sliderHighTarget.value = `${Number(this.sliderLowTarget.value) + 5000}`
    }
    this.setRange()
  }

  setRange() {
    const valueMin = this.sliderLowTarget.min
    const valueMax = this.sliderHighTarget.max
    const valueLow = this.sliderLowTarget.value
    const valueHigh = this.sliderHighTarget.value
    const width = this.sliderContainerTarget.clientWidth
    const rangeLeft = (width - 16) * (Number(valueLow) / Number(valueMax)) + 8
    const rangeRight = (width - 16) * (Number(valueHigh) / Number(valueMax)) + 8
    const rangeWidth = rangeRight - rangeLeft

    this.rangeTarget.style.left = `${rangeLeft}px`
    this.rangeTarget.style.width = `${rangeWidth}px`

    this.labelLowTarget.value = `¥${Number(valueLow).toLocaleString()}`
    this.labelHighTarget.value = `¥${Number(valueHigh).toLocaleString()}`
  }
  submit(event){
    event.preventDefault();
    const valueInputGender = (document.querySelector('.input-gender-gift:checked') as HTMLInputElement).value;
    const valueInputCate = [...document.querySelectorAll<HTMLInputElement>('.input-category-gift:checked')].map(e => e.value);
    const valueInputLow = (document.querySelector('.sliderLow') as HTMLInputElement).value;
    const valueInputHigh = (document.querySelector('.sliderHigh') as HTMLInputElement).value;
    
    let querySearch = '';
    let queryCate = '';
    let queryGender = '';
    let queryPriceLow = '';
    let queryPriceHigh = '';

    if(valueInputGender.length > 0){ 
      queryGender += '&filter.p.m.custom.gender=' + valueInputGender;
    }
    if(valueInputCate.length > 0){
      for(var i = 0;i<valueInputCate.length;i++) {
        queryCate += '&filter.p.m.custom.category=' + valueInputCate[i];
      }
    }
    if(valueInputLow.length > 0){ 
      queryPriceLow += '&filter.v.price.gte=' + valueInputLow;
    }
    if(valueInputHigh.length > 0){ 
      queryPriceHigh += '&filter.v.price.lte=' + valueInputHigh;
    }
    querySearch =  '/search?q=*&filter.p.m.custom.gift_product=1' + queryGender + queryCate + queryPriceLow + queryPriceHigh + '&sort_by=relevance';
    window.location.href = querySearch;
  }
  reset() {
    setTimeout(() => {
      this.onChangeValueLow()
      this.onChangeValueHigh()
    })
  }
}
