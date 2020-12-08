
export = {
  name: 'botscript',
  main: 'main',
  dependencies: [
    'express'
  ],
  options: {
    messenger: {
      webhook: '/webhook',
      PAGE_ACCESS_TOKEN: 'ADD_YOUR_TOKEN',
      VALIDATION_TOKEN: 'ADD_YOUR_TOKEN',
      APP_SECRET: 'ADD_YOUR_TOKEN',
      FB_URL: 'ADD_YOUR_TOKEN',
    }
  }
};
