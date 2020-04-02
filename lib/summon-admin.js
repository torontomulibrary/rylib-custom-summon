const puppeteer = require('puppeteer');

class RylibSummonPuppeteer {
  constructor(config) {
    this.ssClientCenterUrl = config.ssClientCenterUrl;
    this.ssClientCenterEmail = config.ssClientCenterEmail;
    this.ssClientCenterPassword = config.ssClientCenterPassword;
  }

  async open() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();

    const emailInputId = '#_login__login_UserName';
    const passwordInputId = '#_login__login_Password';

    await this.page.goto(this.ssClientCenterUrl);
    
    await this.page.$eval(emailInputId, (el, value) => el.value = value, this.ssClientCenterEmail);
    await this.page.$eval(passwordInputId, (el, value) => el.value = value, this.ssClientCenterPassword);

    await Promise.all([
      this.page.click('#_login__login_LoginButton'),
      this.page.waitForNavigation({ 
        waitUntil: 'networkidle2', 
        timeout: 60000 
      }),
    ]);

    // reload because SerialsSolutions admin page doesn't show you things the first time you log in.
    await this.page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    this.screenshot('debug.png');
    // click on summon administration
    await Promise.all([
      this.page.click('#ctl00_cphCCMain__ManagmentLinkview_dlHeader_ctl01_dlLinkViewItems_ctl02_dlLinks_ctl00_hlLink'),
      this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }),
      this.page.waitForSelector('div[data-referer="General"] h2', { timeout: 60000 })
    ]);
  }

  async setExternalScript(customScriptUrl) {
    await this.page.goto('https://customize.summon.serialssolutions.com/settings#Summon20ExternalScript');
    await this.page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    
    await this.page.waitForSelector('div[data-referer="Summon20ExternalScript"] h2', { timeout: 60000 });

    await this.page.$eval('input[name="ui.style.custom_javascript"]', (el, value) => el.value = value, customScriptUrl);

    await Promise.all([
      this.page.click('div.submit button'),
      this.page.waitForSelector('div.Flash', { 
        visible: true, 
        timeout: 60000 
      }),
    ]);
  }

  async screenshot(path) {
    await this.page.screenshot( { path: path } );
  }

  async close() {
    await this.browser.close();
  }
}

module.exports = RylibSummonPuppeteer;