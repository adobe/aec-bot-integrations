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

import jwt from 'jsonwebtoken';
import request from 'request-promise';

const DEFAULT_IMS_ENDPOINT = "https://ims-na1.adobelogin.com";
const DEFAULT_API_ENDPOINT = "https://mc.adobe.io";
const DEFAULT_EXPIRE = 86400;
const RS256 = 'RS256';

export default class IOApiManager {
  constructor(opts) {
    if (!opts.api_key) {
      throw new Error("API Key not provided (api_key)");
    } else if (!opts.technical_account_id) {
      throw new Error("Technical Account ID not provided (technical_account_id)");
    } else if (!opts.org_id) {
      throw new Error("Org ID not provided (org_id)");
    } else if (!opts.client_secret) {
      throw new Error("Client Secret not provided (client_secret)");
    } else if (!opts.private_key) {
      throw new Error("Private Key not provided (private_key)");
    } else if (!opts.scopes) {
      throw new Error("Scopes not provided (scopes)");
    }

    this.apiKey = opts.api_key;
    this.technicalAccountID = opts.technical_account_id;
    this.orgId = opts.org_id;
    this.secret = opts.client_secret;
    this.endpoint = opts.ims_endpoint || DEFAULT_IMS_ENDPOINT;
    this.apiEndpoint = opts.api_endpoint || DEFAULT_API_ENDPOINT;
    this.expire_after = opts.expire_after || DEFAULT_EXPIRE;
    this.scopes = opts.scopes;
    this.privateKey = opts.private_key;
  }


  static getPrivateKey(buffer) {
    let lines = buffer.split('\n');
    let file = [];
    let add = false;
    for (let i in lines) {
      if (lines[i] === '\r') {
        add = !add;
      }
      if (add) {
        file.push(lines[i]);
      }
    }
    return file.join('\n');
  }

  static getAccessRequestOptions(endpoint,apiKey,secret,token) {
    return {
      method: 'POST',
      uri: `${endpoint}/ims/exchange/jwt/`,
      headers: {
        'content-type': 'multipart/form-data',
        'cache-control': 'no-cache'
      },
      formData: {
        client_id: apiKey,
        client_secret: secret,
        jwt_token: token
      },
      json: true
    };
  }

  getApiEndpoint() {
    return this.apiEndpoint;
  }

  getJWTToken() {
    let jwtPayload = {
      exp: Math.round(this.expire_after + Date.now() / 1000),
      iss: this.orgId,
      sub: this.technicalAccountID,
      aud: `${this.endpoint}/c/${this.apiKey}`
    };
    for (const scope in this.scopes) {
      if (this.scopes.hasOwnProperty(scope)) {
        jwtPayload[`${this.endpoint}/s/${this.scopes[scope]}`] = true;
      }
    }

    return jwt.sign(jwtPayload, this.privateKey, { algorithm: RS256 });
  }


  getAccessToken() {
    const options = IOApiManager.getAccessRequestOptions(this.endpoint,
      this.apiKey,
      this.secret,
      this.getJWTToken());

    return request(options)
      .then(body => {
        return body;
      })
      .catch(function(err) {
        return err;
      });
  }

  _hasValidToken() {
    return (typeof this.token !== 'undefined');
  }

  _getToken() {
    if (this._hasValidToken()) {
      return Promise.resolve(this.token);
    } else if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.getAccessToken();
    return this.tokenPromise;
  }

  apiCall(method,path,parameters) {

    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    return this._getToken()
      .then(token => {

      const qs = (method === 'GET') ? parameters : undefined;
      const body = (method !== 'GET') ? parameters : undefined;
      const options = {
        method: method,
        uri: `${this.apiEndpoint}${path}`,
        qs: qs,
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token.access_token}`,
          'cache-control': 'no-cache',
          'X-Api-Key': this.apiKey
        },
        body: body,
        json: true
      };

      return request(options)
        .then(body => {
          return body;
        })
        .catch(function(err) {
          return err;
        });
    });
  }
}
