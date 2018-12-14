import nock from 'nock';

const DUMMY_TOKEN = 'xxx-token-xxx';

export default class ACSTestScope {

  getTokenScope() {
    return nock('https://ims-na1.adobelogin.com')
      .post('/ims/exchange/jwt/')
      .reply(200, { token_type: 'bearer',
        access_token: DUMMY_TOKEN,
        expires_in: 24 * 60 * 60 * 1000 });
  }

  getTestToken() {
    return DUMMY_TOKEN;
  }
}
