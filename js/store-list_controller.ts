import { ActionEvent, Controller } from '@hotwired/stimulus'
import all from 'gsap/all'
import { check } from 'prettier'

export default class extends Controller {
  areaButtonTarget: HTMLInputElement
  storeCheckboxTargets: HTMLInputElement[]

  static targets = ['areaButton', 'storeCheckbox']

  checkArea(ev: ActionEvent) {
    ev.stopPropagation()
    this.disableCheckbox()
    this.storeCheckboxTargets.forEach((storeCheckbox) => {
      if (ev.target instanceof HTMLInputElement) {
        storeCheckbox.disabled = false
        storeCheckbox.checked = ev.target.checked
      }
    })
    this.getSelectedLabel()
  }

  checkStore(ev: ActionEvent) {
    this.disableCheckbox()
    const allStoreChecked = this.storeCheckboxTargets.every((storeCheckbox) => storeCheckbox.checked)
    this.areaButtonTarget.checked = allStoreChecked
    const radioButtons = document.querySelectorAll<HTMLInputElement>('#store-list input[name="area"]')
    radioButtons[0].checked = !allStoreChecked
    this.getSelectedLabel()
  }

  disableCheckbox() {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('#store-list input[type=checkbox]')
    checkboxes.forEach((checkbox) => {
      if (!this.storeCheckboxTargets.includes(checkbox)) {
        checkbox.disabled = true
        checkbox.checked = false
      }
    })
  }

  reset() {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('#store-list input[type=checkbox]')
    checkboxes.forEach((checkbox) => {
      checkbox.disabled = false
      checkbox.checked = false
    })
  }
  filterLocator(e) {
    const valFilter = e.currentTarget.value;
    const parent = e.currentTarget.closest('.accordion__content');
    parent.querySelectorAll('.store-list__item').forEach(element => {
      if (!element.dataset.region_name.includes(valFilter)) {
        element.classList.add('hidden');
      } else {
        element.classList.remove('hidden');
      }
    });
  }
  getSelectedLabel() {
    if (document.getElementById('selected-areas')) {
      const selectedAreasEl = document.getElementById('selected-areas') as HTMLInputElement
      const selectedStoresEl = document.getElementById('selected-stores') as HTMLInputElement

      let value = ''
      if (this.areaButtonTarget.checked) {
        value = this.areaButtonTarget.value
        selectedAreasEl.value = value
        selectedStoresEl.value = ''
      } else {
        const checkedStores = this.storeCheckboxTargets.filter((storeCheckbox) => storeCheckbox.checked)
        value = checkedStores.map((checkedStore) => checkedStore.name).join(',')
        selectedAreasEl.value = ''
        selectedStoresEl.value = value
      }

      if (selectedStoresEl.nextElementSibling instanceof HTMLButtonElement) {
        selectedStoresEl.nextElementSibling.innerText = value !== '' ? value : 'エリア選択なし'
      }
    }
  }
}
