const moment =require ("moment-timezone");
const AppSettings =require ("./settings-helper.js");

moment.tz.setDefault(AppSettings._appTimezone);

module.exports = moment;
