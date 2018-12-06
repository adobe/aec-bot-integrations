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

module.exports = {
  "extends": "standard",
  "rules": {
    "semi": [2, "always"],
    "indent": [2, 4],
    "no-return-await": 0,
    "space-before-function-paren": [2, {
      "named": "never",
      "anonymous": "never",
      "asyncArrow": "always"
    }],
    "template-curly-spacing": [2, "always"]
  }
};