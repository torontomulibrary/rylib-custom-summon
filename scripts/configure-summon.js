const SummonAdmin = require('../lib/summon-admin.js');

const config = require('../config.js');


(async () => {
  const summon = new SummonAdmin({
    ssClientCenterUrl : 'https://clientcenter.serialssolutions.com/CC/Login/Default.aspx?ReturnUrl=/CC/Library/Default.aspx?LibraryCode=RRP',
    ssClientCenterEmail : config.summon.ssClientCenterEmail,
    ssClientCenterPassword : config.summon.ssClientCenterPassword,
  });
  
  await summon.open();
  
  // TODO: The script should figure out what to set the external script URL to on it's own.
  await summon.setExternalScript('https://ryersonlibrary.nyc3.digitaloceanspaces.com/rylib-custom-summon/v0.0.x/js/rylib-custom-summon.js');
  
  // TODO: Add configuration scripts for the "Custom Panels" section
  
  await summon.close();
})();