class Settings {
  // Core Settings
  static _projectName = process.env.PROJECT_NAME;
  static _appProtocol = process.env.APP_PROTOCOL || 'http';
  static _appUrl = process.env.APP_URL || 'localhost';
  static _appPort = process.env.APP_PORT || '3000';
  static _appBASEURL = `${Settings._appProtocol}://${Settings._appUrl}:${Settings._appPort}`;
  
  static _isLambdaEnvironment =
    Number.parseInt(process.env.IS_LAMBDA_ENVIRONMENT) === 1; 
  static _adminUrl = process.env.ADMIN_URL;

  // Encryption Key
  static _encryptionKey = process.env.ENCRYPTION_KEY;

  // Other Settings
  static _isLiveOTP = Number.parseInt(process.env.IS_LIVE_OTP) === 1;
  static _alterTable = Number.parseInt(process.env.ALTER_TABLE) === 1;
  static _appTimezone = process.env.APP_TIMEZONE;

  static async init() {
    try {
      console.log("Settings have been updated successfully");
    } catch (error) {
      console.log("Unable to create the settings due to: ", error.message);
      throw error;
    }
  }
}

module.exports = Settings;
