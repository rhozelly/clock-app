import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {MaterialModule} from './core/material/material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule, Routes} from "@angular/router";
import {environment} from "../environments/environment";

// Components
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {TimeInComponent} from './time-in/time-in.component';
import {EmployeesComponent} from './employees/employees.component';
import {ProfileComponent} from './profile/profile.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {AngularFireModule} from "@angular/fire";
import {AngularFirestoreModule} from "@angular/fire/firestore";
import {AngularFireStorageModule} from "@angular/fire/storage";
import {AngularFireAuthModule} from "@angular/fire/auth";
import {TimesheetsComponent} from './timesheets/timesheets.component';
import {CalendarComponent} from './calendar/calendar.component';
import {UserCreateComponent} from './user-create/user-create.component';
import {AddEmployeeDialogComponent} from './employees/add-employee-dialog/add-employee-dialog.component';
import {AttendanceComponent} from "./attendance/attendance.component";

// Services
import {AttendanceService} from "./core/services/attendance.service";
import {ProfileService} from "./core/services/profile.service";
import {MainService} from "./core/services/main.service";
import {AuthenticationService} from './core/services/authentication.service';
import {AuthguardGuard} from './core/guards/authguard.guard';
import {TimesheetsDialogComponent} from './timesheets/timesheets-dialog/timesheets-dialog.component';
import {SettingsComponent} from './settings/settings.component';
import {AlertMessageComponent} from './alert-message/alert-message.component';
import {AdminGuard} from "./core/guards/admin.guard";
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {UserGuard} from "./core/guards/user.guard";

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin
]);

const appRoutes: Routes = [
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'attendance', component: AttendanceComponent},
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        canActivateChild: [AdminGuard],
        children: [
          {path: '', redirectTo: 'admin/main-dashboard', pathMatch: 'full'},
          {path: 'main-dashboard', component: AppComponent},
          {path: 'attendance', component: AttendanceListComponent},
          {path: 'dashboard', component: DashboardComponent},
          {path: 'employees', component: EmployeesComponent},
          {path: 'calendar', component: CalendarComponent},
          {path: 'my-profile', component: ProfileComponent},
          {path: 'time-in', component: TimeInComponent},
          {path: 'timesheets', component: TimesheetsComponent},
          {path: 'page-not-found', component: PageNotFoundComponent},
          {path: 'user-create', component: UserCreateComponent},
          {path: 'settings', component: SettingsComponent},
        ]
      },
      {
        path: '',
        canActivateChild: [UserGuard],
        children: [
          {path: '', redirectTo: 'user/main-dashboard', pathMatch: 'full'},
          {path: 'main-dashboard', component: AppComponent},
          {path: 'attendance', component: AttendanceListComponent},
          {path: 'dashboard', component: DashboardComponent},
          {path: 'calendar', component: CalendarComponent},
          {path: 'my-profile', component: ProfileComponent},
          {path: 'time-in', component: TimeInComponent},
          {path: 'timesheets', component: TimesheetsComponent},
          {path: 'page-not-found', component: PageNotFoundComponent},
          {path: 'settings', component: SettingsComponent},
        ]
      }
    ]
  },
  {path: 'page-not-found', component: PageNotFoundComponent},
  {path: '**', component: LoginComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TimeInComponent,
    EmployeesComponent,
    ProfileComponent,
    PageNotFoundComponent,
    DashboardComponent,
    TimesheetsComponent,
    CalendarComponent,
    UserCreateComponent,
    AddEmployeeDialogComponent,
    AttendanceComponent,
    TimesheetsDialogComponent,
    SettingsComponent,
    AlertMessageComponent,
    AttendanceListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MaterialModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {enableTracing: false}),
    AngularFireModule.initializeApp(environment.firebaseConfig), // imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule,
    AngularFireStorageModule,
    FullCalendarModule
  ],
  exports: [],
  entryComponents: [AddEmployeeDialogComponent, TimesheetsDialogComponent, AlertMessageComponent],
  providers: [
    HttpClientModule,
    MainService,
    ProfileService,
    AttendanceService,
    AuthguardGuard,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
