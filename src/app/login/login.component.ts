import { Component, OnInit } from "@angular/core";
// import { HttpService } from '../shared/services/http-service';
import { Router } from "@angular/router";
import { HttpService } from "../shared/services/http-service";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
  styleUrls: ["login.component.css"]
})
export class LoginComponent implements OnInit {
  public lEmail: string = "";
  public lPass: string = "";
  public lDisable: boolean = false;

  public sFullName: string = "";
  public sEmail: string = "";
  public sPass: string = "";
  public sDisable: boolean = false;
  public signup: boolean = false;

  constructor(private router: Router, private httpService: HttpService) {}

  ngOnInit() {}

  onLoginButtonClick() {
    let userDetails = {
      userEmail: this.lEmail,
      userPassword: this.lPass
    };
    this.httpService.post("login", userDetails).subscribe(
      response => {
        if(response.hasOwnProperty("success")){
          alert("User succesfully logged in");
          this.signup = false;
          localStorage.setItem('userID', response.results[0].id);
          this.router.navigate(["editor"]);
        }
        else if(response.hasOwnProperty("error")){
          alert(response.error);
          this.signup = false;
        }
      },
      error => {
        console.log("Signup Error in FE", error);
      }
    );
  }

  onRouteToSignUp() {
    this.signup = true;
  }

  onSignupButtonClick() {
    let userDetails = {
      userName: this.sFullName,
      userEmail: this.sEmail,
      userPassword: this.sPass
    };
    this.httpService.post("user/addUser", userDetails).subscribe(
      response => {
        if(response.hasOwnProperty("success")){
          alert("User succesfully signed up. Please login.");
          this.signup = false;
        }
        else if(response.hasOwnProperty("error")){
          alert(response.error);
          this.signup = false;
        }
      },
      error => {
        console.log("Signup Error in FE", error);
      }
    );
  }

  onBackToLoginClick() {
    this.signup = false;
  }
}
