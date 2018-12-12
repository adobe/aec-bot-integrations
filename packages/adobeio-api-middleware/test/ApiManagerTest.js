/*
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import dotenv from 'dotenv';
import { assert, expect } from 'chai';
import APIManager from '../dist/ApiManager';
import jwt from 'jsonwebtoken';

let runTest = true;

const DEFAULT_EXPIRE = 30000;

const CAMPAIGN_SCOPE = 'ent_campaign_sdk';
const TEST_SCOPE = 'test_scope';
const DEFAULT_API_ENDPOINT = "https://mc.adobe.io";

dotenv.config();

if (!process.env.PKEY) {
  console.warn('To run tests, have an integration details available using .env');
  runTest = false;
}

function cleanKey(key) {
  return key.replace(/\\n/g,"\n");
}

function getAPI(opts) {
  return new APIManager(Object.assign({
    api_key : process.env.APIKEY,
    technical_account_id : process.env.ACCOUNT_ID,
    org_id : process.env.ORG_ID,
    client_secret : process.env.SECRET,
    private_key : cleanKey(process.env.PKEY),
    expire_after: DEFAULT_EXPIRE
  },opts));
}

describe('API Endpoint', _ => {
  if (runTest) {
    it('can use custom API endpoint', done => {
      const TEST_URL = "http://test";
      const api = getAPI({api_endpoint : TEST_URL,scopes : [TEST_SCOPE]});
      expect(api.getApiEndpoint()).to.be.equal(TEST_URL);
      done();
    });
    it('can use default API endpoint', done => {
      const api = getAPI({scopes : [TEST_SCOPE]});
      expect(api.getApiEndpoint()).to.be.equal(DEFAULT_API_ENDPOINT);
      done();
    });
  }
});

describe('JWT Token', _ => {
  if (runTest) {
    const api = getAPI({scopes : [TEST_SCOPE]});
    const token = api.getJWTToken();
    const decoded = jwt.verify(token,cleanKey(process.env.PUBKEY), { algorithm: 'RS256' });
    it('has scope ', done => {
      expect(decoded[`${api.endpoint}/s/${TEST_SCOPE}`]).to.be.true;
      done();
    });
    it('expires in a day', done => {
      const exp_now = Math.round(DEFAULT_EXPIRE + Date.now() / 1000);
      expect(decoded.exp).to.be.within(exp_now - 1000 , exp_now + 100);
      done();
    });
    it('has the org ID', done => {
      expect(decoded.iss).to.be.equal(process.env.ORG_ID);
      done();
    });
    it('has technical account ID', done => {
      expect(decoded.sub).to.be.equal(process.env.ACCOUNT_ID);
      done();
    });
    it('has API key as audience', done => {
      expect(decoded.aud).to.be.equal(`${api.endpoint}/c/${process.env.APIKEY}`);
      done();
    });
  }
});

describe('Access token',_ => {
  if (runTest) {
    const api = getAPI({scopes : [CAMPAIGN_SCOPE]});
    it('works with campaign APIs', done => {
      api.getAccessToken().then(response => {
        expect(response).to.have.all.keys('token_type','access_token','expires_in');
        expect(response.token_type).to.be.equal('bearer');
        done();
      });
    })
  }
});