'use strict';

export const sep='/';
export const today =  new Date();
export const date_today =  new Date().getDate();
export const month_today =  new Date().getMonth();
export const year_today =  new Date().getFullYear();
export const db = 'db_local_attendance';
export const tbl_att = 'attendances';
export const tbl_cat = 'categories';
export const tbl_app = 'application';
export const tbl_accs = 'accounts';
export const tbl_acc = 'account';
export const tbl_logs = 'logins';
export const tbl_log = 'login';
export const tbl_pri = 'privileges';
export const tbl_pro = 'profile';
export const tbl_pros = 'profiles';
export const tbl_navs = 'navigators';
export const tbl_nav = 'navigator';
export const tbl_tim = 'timesheets';
export const tbl_time_in = 'time_in';
export const tbl_eve = 'events';
export const tbl_ev = 'event';
export const tbl_invs = 'invoices';
export const tbl_inv = 'invoice';
export const tbl_invs_info = 'invoices_info';
export const tbl_ben = 'benefits';
export const tbl_other = 'other_deductions';
export const tbl_earnings = 'other_earnings';
export const tbl_others = 'others';
export const tbl_hol = 'tbl_holidays';
export const tbl_cat_blood = 'blood-type';
export const tbl_cat_client = 'clients';
export const tbl_cat_position = 'position';
export const tbl_cat_role = 'role';
export const tbl_cat_time = 'time_logged_out';
export const tbl_inv_info = 'invoices_info';
export const tbl_ls = 'logs';
export const tbl_l = 'log';
export const tbl_cli = 'clients';
export const tbl_reqs = 'requests';
export const tbl_req = 'request';

export const browser =
window.navigator.userAgent.toLowerCase().indexOf('edge') > -1 ? 'edge' :
window.navigator.userAgent.toLowerCase().indexOf('opr') > -1 && !!(<any>window).opr ? 'opera' :
window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1 && !!(<any>window).chrome ? 'chrome' :
window.navigator.userAgent.toLowerCase().indexOf('trident') > -1 ? 'trident' :
window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 'firefox' :
window.navigator.userAgent.toLowerCase().indexOf('safari') > -1 ? 'safari' : 'other'

export const prod_sub = window.navigator.productSub;

export const users = localStorage.getItem('user') ? new Object(localStorage.getItem('user')).toString() : '';
