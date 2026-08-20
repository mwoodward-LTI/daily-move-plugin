// The real `obsidian` module only exists inside the app; the logic under test
// needs nothing from it but moment.
import moment from 'moment';
export { moment };
