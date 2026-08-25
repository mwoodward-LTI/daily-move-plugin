// The real `obsidian` module only exists inside the app; the logic under test
// needs nothing from it but moment.
export { default as moment } from 'moment';
