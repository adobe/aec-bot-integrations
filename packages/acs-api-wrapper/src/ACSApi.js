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

import APIManager from 'adobeio-api-middleware';
import request from 'request-promise';

const CAMPAIGN_SCOPE = 'ent_campaign_sdk';
const PROFILE_API = '/profileAndServices/profile';
export default class ACSApi {
  constructor(opts) {
    if (!opts.tenant) {
      throw new Error("Tenant not provided (tenant)");
    }

    if (!opts.transactionalApi) {
      console.warn(('Transactional API endpoint not provided'));
    }

    if (!opts.scopes) {
      opts.scopes = [CAMPAIGN_SCOPE];
    }

    this.api = new APIManager(opts);
    this.tenant = opts.tenant;
    this.acsApiRoot = `/${this.tenant}/campaign`;
    this.transactionalApi = opts.transactionalApi;
  }
  
  acsApi(method, path,parameters) {
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return this.api.apiCall(method,`${this.acsApiRoot}${path}`,parameters);
  }

  acsGet(path, parameters) {
    return this.acsApi('GET',path,parameters);
  }

  getProfiles(parameters,field) {
    const path = field ? `${PROFILE_API}/${field}` : PROFILE_API;
    return this.acsGet(path,parameters);
  }

  _getResourceKey(resource) {
    if (typeof resource === 'object' && 'PKey' in resource)
      return resource.PKey;
    else
      return resource.toString();
  }

  getProfile(profile,parameters) {
    return this.acsGet(`${PROFILE_API}/${this._getResourceKey(profile)}`,parameters);
  }

  getProfileByEmail(email,parameters) {
    const allParameters = Object.assign({'email' : email},parameters);
    return this.acsGet(`${PROFILE_API}/byEmail`,allParameters);
  }

  getProfileByText(text,parameters) {
    const allParameters = Object.assign({'text' : text},parameters);
    return this.acsGet(`${PROFILE_API}/byText`,allParameters);
  }

  getProfileByKeysProfile(email,parameters) {
    const allParameters = Object.assign({'email' : email},parameters);
    return this.acsGet(`${PROFILE_API}/byKeysProfile`,allParameters);
  }

  updateProfile(profile, profileData) {
    return this.acsApi('PATCH',`${PROFILE_API}/${this._getResourceKey(profile)}`,profileData);
  }

  sendTransactionalEvent(event, data) {
    if (!this.transactionalApi) {
      return Promise.reject('No transactional API defined.');
    }
    return this.acsApi('POST',`${this.transactionalApi}/${event}`,data);
  }

  getTransactionalEventStatus(event, eventData) {
    if (!this.transactionalApi) {
      return Promise.reject('No transactional API defined.');
    }
    return this.acsGet(`${this.transactionalApi}/${event}/${this._getResourceKey(eventData)}`)
  }
}