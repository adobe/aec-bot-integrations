import nock from 'nock';
import {TEST_DATA} from "./ProfileSample";

const DUMMY_TOKEN = 'xxx-token-xxx';

export default class ACSTestScope {

  constructor(api_key) {
    this.key = api_key;
  }

  getTokenScope() {
    return nock('https://ims-na1.adobelogin.com')
      .post('/ims/exchange/jwt/')
      .reply(200, { token_type: 'bearer',
        access_token: DUMMY_TOKEN,
        expires_in: 24 * 60 * 60 * 1000 });
  }

  _campaignScope() {
    return nock('https://mc.adobe.io', {
      reqheaders: {
        'content-type': 'application/json',
        Authorization: `Bearer ${DUMMY_TOKEN}`,
        'X-Api-Key': this.key }
    });
  }

  getProfileByEmailScope() {
    return this._campaignScope()
      .get(`/${TEST_DATA.tenant}/campaign/profileAndServices/profile/byEmail`)
      .query({email : TEST_DATA.email})
      .reply(200,TEST_DATA.response);
  }

  getPatchPhoneScope() {
    return this.getProfileByEmailScope()
      .patch(`/${TEST_DATA.tenant}/campaign/profileAndServices/profile/${TEST_DATA.pkey}`,
        { mobilePhone: TEST_DATA.phone2 })
      .reply(200,{
        PKey : TEST_DATA.pkey,
        href : `https://mc.adobe.io/${TEST_DATA.tenant}/campaign/profileAndServices/profile/${TEST_DATA.pkey}`
      });
  }

  getProfileByEmailAfterPatchScope() {
    return this._campaignScope()
      .get(`/${TEST_DATA.tenant}/campaign/profileAndServices/profile/byEmail`)
      .query({email : TEST_DATA.email})
      .reply(200,TEST_DATA.response2);
  }

}