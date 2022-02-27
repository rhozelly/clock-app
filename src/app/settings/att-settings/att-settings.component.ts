import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-att-settings",
  templateUrl: "./att-settings.component.html",
  styleUrls: ["./att-settings.component.css"],
})
export class AttSettingsComponent implements OnInit {
  start_time: any = [];
  constructor() {}

  ngOnInit(): void {
    for (let i = 1; i < 13; i++) {
      this.start_time.push(i);
    }
  }
}
