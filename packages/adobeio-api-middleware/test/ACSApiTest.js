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

import ACSApi from '../dist/ACSApi';
import { TEST_DATA } from './ProfileSample';
import Scope from './ACSTestScope';
import { TEST_CONNECTION } from "./KeySample";

import { expect, assert } from 'chai';

const TRANS_ID = 'trans';
const DUMMY_VALUE = 'n/a';
const DUMMY_API_KEY = 'xxx-api-key-xxx';
const scopeFactory = new Scope(DUMMY_API_KEY);

function getACS() {

  let scope;
  return new Promise((resolve) => {

    scope = scopeFactory.getTokenScope();

    const acs = new ACSApi({
      api_key : TEST_CONNECTION.api_key,
      technical_account_id : TEST_CONNECTION.technical_account_id,
      org_id : TEST_CONNECTION.org_id,
      client_secret : TEST_CONNECTION.client_secret,
      private_key : TEST_CONNECTION.private_key,
      tenant : TEST_DATA.tenant,
      transactionalApi : TRANS_ID
    });

    resolve(acs);
  });
}

let acs;

before(function(done) {
  this.timeout(5000);
  getACS().then(instance => {
    acs = instance;
    done();
  });
});

describe('ACS Profile Query', _ => {
  let response;

  before(function(done) {
    const scope = scopeFactory.getProfileByEmailScope();

    acs.getProfileByEmail(TEST_DATA.email).then(res => {
      response = res;

      if (!scope.isDone()) {
        console.error('pending mocks: %j', scope.pendingMocks());
      }

      done();
    });
  });

  it('Response not empty', done => {
    expect(response).to.have.property('content')
      .that.is.an('array')
      .that.is.not.empty;
    done();
  });

  it('Response has the correct profile', done => {
    expect(response).to.have.property('content')
      .that.is.an('array');
    expect(response.content[0]).to.have.property('PKey',TEST_DATA.pkey);
    expect(response.content[0]).to.have.property('email',TEST_DATA.email);
    done();
  });
});

describe('ACS Profile Update', _ => {
  it('Update profile using PKey', done => {

    let scope = scopeFactory.getPatchPhoneScope();

    acs.getProfileByEmail(TEST_DATA.email)
      .then(response => {
        expect(response).to.have.property('content')
          .that.is.an('array');
        expect(response.content[0]).to.have.property('PKey',TEST_DATA.pkey);
        expect(response.content[0]).to.have.property('email',TEST_DATA.email);
        expect(response.content[0]).to.have.property('mobilePhone',TEST_DATA.phone,'Original phone should return');
      })
      .then(_ => acs.updateProfile(TEST_DATA.pkey,{mobilePhone:TEST_DATA.phone2}))
      .then(response => {
        expect(response).to.have.keys(['PKey','href']);
        expect(response).to.have.property('PKey',TEST_DATA.pkey);
        scope = scopeFactory.getProfileByEmailAfterPatchScope();
      })
      .then(_ => acs.getProfileByEmail(TEST_DATA.email))
      .then(response => {
        expect(response).to.have.property('content')
          .that.is.an('array');
        expect(response.content[0]).to.have.property('PKey',TEST_DATA.pkey);
        expect(response.content[0]).to.have.property('email',TEST_DATA.email);
        expect(response.content[0]).to.have.property('mobilePhone',TEST_DATA.phone2,'New phone should return');
        done();
      })
      .catch(err => done(err));
  });
});

