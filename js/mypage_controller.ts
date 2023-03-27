import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  emailTarget: HTMLInputElement
  repeatEmailTarget: HTMLInputElement
  screenSuccessTarget: HTMLButtonElement
  errorEmail1Target: HTMLDivElement
  errorEmail2Target: HTMLDivElement
  errorsFound: boolean

  static targets = [
    'email',
    'repeatEmail',
    'screenSuccess',
    'errorEmail1',
    'errorEmail2'
  ]

  connect(): void {

  }

  submitForm() {
    const validEmail = this.validateEmail();
    const valueEmail = this.emailTarget.value;
    const customerId = document.querySelector<HTMLInputElement>('#customer_id').value;
    const customerName = document.querySelector<HTMLInputElement>('#customer_name').value;
    const hmac = document.querySelector<HTMLInputElement>('#hmac').value;

    if (!validEmail) return;

    this.changeEmail(customerId, customerName, valueEmail, hmac);
  }
  clearErrors() {
    this.errorsFound = false;
    this.errorEmail1Target.classList.add('hidden');
    this.errorEmail2Target.classList.add('hidden');
  }

  addError(target, errorMessage) {
    this.errorsFound = true;
    target.classList.remove('hidden');
    target.innerHTML = errorMessage;
  }

  validateEmail() {
    const regexEmail = /^[a-zA-Z\d-+_\.]+@[a-z]+(\.[a-z\d-+_]{1,}){1,3}$/;
    const email = this.emailTarget.value;
    const repeatEmail = this.repeatEmailTarget.value;

    this.clearErrors();

    //email input 1
    if (!regexEmail.test(email)) this.addError(this.errorEmail1Target, "半角英数で入力してください。");//is format correct
    if (!email.length) this.addError(this.errorEmail1Target, "メールアドレスを入力してください。");//is field empty

    //email input 2
    if (email !== repeatEmail) this.addError(this.errorEmail2Target, "確認用メールアドレスが一致していません。"); //matches input 1
    if (!repeatEmail.length) this.addError(this.errorEmail2Target, "メールアドレスを入力してください。");//is input empty

    return !this.errorsFound;

  }

  changeEmail(customerId, customerName, email, hmac) {
    const url = window.API_URL['generateEmailHash'];
    const formData = JSON.stringify({
      "customerId": customerId,
      "customerName": customerName,
      "email": email,
      "hmac": hmac
    });

    this.element.querySelector('.button--cta').classList.add('disabled');

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: formData
    })
      .then(response => response)
      .then(data => {
        if (data.status == 200) {
          this.screenSuccessTarget.click();
          this.element.querySelector('.button--cta').classList.remove('disabled');
          document.querySelector('.mypage__email').innerHTML = email;
          fetch('/account/logout');
        } else {
          this.element.querySelector('.button--cta').classList.remove('disabled');
          this.addError(this.errorEmail1Target, "このメールアドレスは既に登録されています。");
          console.log('something wrong: ', data);
        }
      })
      .catch(error => {
        this.element.querySelector('.button--cta').classList.remove('disabled');
        this.addError(this.errorEmail1Target, "このメールアドレスは既に登録されています。");
        console.log(error);

      });
  }
}
