import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  postalCodeTarget: HTMLInputElement
  prefectureTarget: HTMLInputElement
  addressTarget: HTMLInputElement

  static targets = ['postalCode', 'prefecture', 'address']

  async fetch() {
    if (this.postalCodeTarget.value === '') return
    const { code, data } = await (
      await fetch(`https://api.zipaddress.net/?zipcode=${this.postalCodeTarget.value}`)
    ).json()

    if (this.postalCodeTarget.closest('.input-form').querySelector('.error-postcode')) {
      this.postalCodeTarget.closest('.input-form').querySelector('.error-postcode').classList.add('hidden');
      this.postalCodeTarget.classList.remove('field--error');
    }

    if (code === 200) {
      this.prefectureTarget.value = data.pref
      this.addressTarget.value = data.city
      this.postalCodeTarget.classList.remove('field--error');
    } else {
      if (this.postalCodeTarget.closest('.input-form')) {
        const form = this.postalCodeTarget.closest('.input-form');
        this.postalCodeTarget.classList.add('field--error');

        if (form.querySelector('.error-postcode')) {
          form.querySelector('.error-postcode').classList.remove('hidden');
        }
      }
    }
  }
}
