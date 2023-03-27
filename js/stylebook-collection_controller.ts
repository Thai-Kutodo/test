import { ActionEvent, Controller } from '@hotwired/stimulus'
import gsap, { Expo } from 'gsap'

export default class extends Controller {

  taggedControllerContentTarget: HTMLDivElement
  filterStyleBookTarget: HTMLDivElement
  defaultContentTarget: HTMLDivElement

  static targets = ['taggedControllerContent', 'filterStyleBook', 'defaultContent']


  initialize(): void {

    const radioGenders = this.filterStyleBookTarget.querySelectorAll<HTMLInputElement>('input[name="gender"]');
    const radioCategories = this.filterStyleBookTarget.querySelectorAll<HTMLInputElement>('input[name="category"]');

    let valueGender = this.filterStyleBookTarget.querySelector<HTMLInputElement>('input[name="gender"]:checked').value;
    let valueCategory = [];

    //Handle for stylebook page change
    const defaultContentTarget = document.querySelector<HTMLElement>('.section-default-book');
    const mainContentTarget = document.querySelector<HTMLElement>('.section-main-stylebook');

    const handleFilterChange = () => {
        // Get gender
        for (const radioButton of radioGenders) {
          if (radioButton.checked) {
              valueGender = radioButton.value;
              break;
          }
        }
        // get value category
        for (const radioCategory of radioCategories) {
        if (radioCategory.checked) {
            valueCategory['any'] = valueCategory.push(radioCategory.value);
            valueCategory = valueCategory.filter(function(item, pos, self) {
              return self.indexOf(item) == pos;
          })
        }else{
          let index = valueCategory.indexOf(radioCategory.value);
          if (index !== -1) {
            valueCategory.splice(index,1);
          }
        }
        }
        this.handleFilterChange(valueGender, valueCategory);
    }
  

    radioGenders.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const isAllTabSelected =
          this.element.querySelector<HTMLInputElement>('input[type="radio"]:checked').value === 'すべて'
        const isTagChecked =
          this.element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').length !== 0

        if (isAllTabSelected && !isTagChecked) {
          this.taggedControllerContentTarget.querySelectorAll('li').forEach((elm) => {
            elm.setAttribute('show', 'false');
          });
          this.switch(defaultContentTarget, mainContentTarget)
        } else {
          handleFilterChange();
          this.switch(mainContentTarget, defaultContentTarget)
        }
      })
    })

    radioCategories.forEach((checkbox) => {
      checkbox.addEventListener('click', (e) => {
        const isAllTabSelected =
          this.element.querySelector<HTMLInputElement>('input[type="radio"]:checked').value === 'すべて'
        const isTagChecked =
          this.element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked').length !== 0

        if (isAllTabSelected && !isTagChecked) {
          this.taggedControllerContentTarget.querySelectorAll('li').forEach((elm) => {
            elm.setAttribute('show', 'false');
          });
          this.switch(defaultContentTarget, mainContentTarget)
        } else {
          handleFilterChange();
          this.switch(mainContentTarget, defaultContentTarget)
        }
      })
    })
    
  }

  handleFilterChange = (valueGender: any , valueCategory: any) => {

    if(valueGender != '' && valueCategory.length == 0){
      this.taggedControllerContentTarget.querySelectorAll('li').forEach((elm) => {
        if(valueGender == "すべて"){
          elm.setAttribute('show', 'true');
        }else if(elm.dataset.gender !== valueGender ){
          elm.setAttribute('show', 'false');
        }else{
          elm.setAttribute('show', 'true');
        }
      });
    }else if(valueGender != '' && valueCategory.length > 0){

      if(valueGender == "すべて"){
        this.taggedControllerContentTarget.querySelectorAll('li').forEach((elm) => {
          if( valueCategory.indexOf(elm.dataset.category) > -1){
            elm.setAttribute('show', 'true');
          }else{
            elm.setAttribute('show', 'false');
          }
        });
      }else{
        this.taggedControllerContentTarget.querySelectorAll('li').forEach((elm) => {
          if( valueGender == elm.dataset.gender && valueCategory.indexOf(elm.dataset.category) > -1 ){
            elm.setAttribute('show', 'true');
          }else{
            elm.setAttribute('show', 'false');
          }
        });
      }
    }
    
    // Check if no have the ressult return, that will show the message.
    if(this.taggedControllerContentTarget.querySelectorAll('li').length == this.taggedControllerContentTarget.querySelectorAll('li[show="false"]').length
    && document.querySelector<HTMLElement>('.result-empty').classList.contains('hiden')){
      document.querySelector<HTMLElement>('.result-empty').classList.remove('hiden');
    }else{
      document.querySelector<HTMLElement>('.result-empty').classList.add('hiden');
    }


  }
  
  switch(toShowTarget: HTMLElement, toHideTarget: HTMLElement) {
    const tl = gsap.timeline()
    
    tl.to(toHideTarget, {
      opacity: 0,
      duration: 0.3,
      ease: Expo.easeOut,
      onComplete: () => {},
    }).to(toShowTarget, {
      opacity: 1,
      duration: 0.3,
      ease: Expo.easeOut,
      onStart: () => {
        toHideTarget.style.setProperty('display', 'none')
      },
      onComplete: () => {
        toShowTarget.style.setProperty('display', 'block')
      }
    })
  }

}
