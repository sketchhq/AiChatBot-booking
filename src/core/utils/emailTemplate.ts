
let logo=""

export default class EmailTemService {
  static logo() {
    return `<div class="text-center" style=" text-align: center;">
    <img src="${logo}" alt="" style=" width: 40%;margin-top: 15px;" alt="savefood">
</div>`;
  }

  static emailOtpVerification(otp: any) {

    return "html";
  }
  static emailPasswordVerification(password: any) {

  }

  static forgotPassword(token: any) {
  }

}

