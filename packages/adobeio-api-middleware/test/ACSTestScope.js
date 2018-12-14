import nock from 'nock';
import AuthScope from './AuthTestScope';
import {TEST_DATA} from "./ProfileSample";

export default class ACSTestScope {

  constructor(api_key) {
    this.key = api_key;
    this.token = new AuthScope().getTestToken();
  }

  getTokenScope() {
    return new AuthScope().getTokenScope();
  }

  _campaignScope() {
    return nock('https://mc.adobe.io', {
      reqheaders: {
        'content-type': 'application/json',
        Authorization: `Bearer ${this.token}`,
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