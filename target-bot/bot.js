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

const { ActivityTypes } = require('botbuilder');
const { cities, countries } = require('./cities');
const { ConfirmPrompt, DialogSet, TextPrompt, NumberPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const USER_PROFILE_PROPERTY = 'user';
const DIALOG_STATE_PROPERTY = 'dialogState';
const GET_CITY = 'get_city';
const FEEDBACK_PROMPT = 'feedback_prompt';

const COUNTRY_PROMPT = 'country_prompt';
const AGE_PROMPT = 'age_prompt';

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ');
}
class CityBot {

  constructor(conversationState,userState,mc,targetOptions) {
    this.mc = mc;
    this.mbox = targetOptions.mbox;
    this.successMbox = targetOptions.successMbox;
    this.atProperty = targetOptions.atProperty;
    this.userState = userState;
    this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);
    this.conversationState = conversationState;
    this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
    this.dialogs = new DialogSet(this.dialogState);
    this.countries = countries;
    this.cities = cities;

    this.dialogs.add(new TextPrompt(COUNTRY_PROMPT));
    this.dialogs.add(new NumberPrompt(AGE_PROMPT));
    this.dialogs.add(new ConfirmPrompt(FEEDBACK_PROMPT));

    this.dialogs.add(new WaterfallDialog(GET_CITY, [
      this.promptForAge.bind(this),
      this.captureAge.bind(this),
      this.promptForCountry.bind(this),
      this.getCity.bind(this),
      this.feedback.bind(this),
      this.captureFeedback.bind(this)
    ]));
  }

  // This step checks the user's response - if yes, the bot will proceed to prompt for age.
  // Otherwise, the bot will skip the age step.
  async promptForAge(step) {
    return await step.prompt(AGE_PROMPT, `What is your age?`,
      {
        retryPrompt: 'Sorry, please specify your age as a positive number or say cancel.'
      }
    );
  }

  // This step captures the user's age.
  async captureAge(step) {
    const user = await this.userProfile.get(step.context, {});
    if (step.result !== -1) {
      user.age = step.result;
      await this.userProfile.set(step.context, user);
      return await step.next(-1);
    } else {
      await step.context.sendActivity(`No age given.`);
      return await step.endDialog();
    }
  }

  // This step in the dialog prompts the user for their email.
  async promptForCountry(step) {
    return await step.prompt(COUNTRY_PROMPT, `Which country would you like a city from?`);
  }

  async getCity(step) {
    const user = await this.userProfile.get(step.context, {});
    if (step.result !== -1) {
      const country = step.result;
      user.country = country.toLowerCase();
      if (user.country === 'us' || user.country === 'usa') {
        user.country = 'united states';
      } else if (user.country === 'uk' || user.country === 'england') {
        user.country = 'united kingdom';
      }

      if (user.country in this.countries) {
        await step.context.sendActivity(`Looking for a big city in ${titleCase(user.country)}`);
        const cityData = await this.returnCityForCountry(user.country, user.age);

        await step.context.sendActivity(this.getCityInformationMessage(cityData, user.country));
        return await step.next(-1);
      } else {
        await step.context.sendActivity(`I am sorry, I never heard of the country ${titleCase(user.country)}!`);
      }
    } else {
      await step.context.sendActivity(`No country given.`);
    }
    return await step.endDialog();
  }

  async feedback(step) {
    return await step.prompt(FEEDBACK_PROMPT, `Are you happy with the provided city?`);
  }

  async captureFeedback(step) {
    if (step.result && step.result === true) {
      await this.reportSuccessMbox();
      await step.context.sendActivity(`Thank you for the feedback!`);
    } else {
      await step.context.sendActivity(`I will try to do better next time. Thank you for the feedback!`);
    }
    return step.endDialog();
  }

  async reportSuccessMbox() {
    return this.mc.getOffer({
      payload: {
        mbox: this.successMbox,
        mboxParameters: {
          "at_property": this.atProperty
        }
      }
    });
  }

  async getMboxOffer(country, age) {
    return this.mc.getOffer({
      payload: {
        mbox: this.mbox,
        profileParameters: {
          age: age
        },
        mboxParameters: {
          "country": country,
          "at_property": this.atProperty
        }
      }
    }).then(offer => {
      if (offer.content) {
        const content = JSON.parse(offer.content);
        if (content.name &&
          content.rank &&
          content.population) {
          return content;
        }
        console.error('Invalid offer received:',content,content.name ,
          content.rank ,
          content.population);
      }
      return null;
    }).catch(error => {
      console.error('Error while getting Target content:',error);
    })
  }

  async returnCityForCountry(country, age) {
    const targetCityData = await this.getMboxOffer(country, age);
    if (targetCityData) {
      return targetCityData;
    } else {
      const countryData = this.countries[country];
      let idx = Math.floor(Math.random() * countryData.length);
      const city = countryData[idx];
      const data = this.cities[city];
      return {
        name : city,
        rank : data.rank,
        population : (isNaN(data.population) || data.population === 0) ? "n/a" : data.population
      };
    }
  }

  getCityInformationMessage(cityData, country) {
    const titleCountry = titleCase(country);
    if (cityData.population === 'n/a') {
      return `I've found the city ${cityData.name} in ${titleCountry}. \
            I am not sure what its population is but it is ranked ${cityData.rank}.`;
    } else {
      return `Found city ${cityData.name} in ${titleCountry}. \
            Its population is ${cityData.population} and it is ranked ${cityData.rank}.`;
    }
  }

  async onTurn(context) {
    const dc = await this.dialogs.createContext(context);

    if (context.activity.type === ActivityTypes.Message) {
      let text = context.activity.text.toLowerCase();

      if (text !== 'cancel' && dc.activeDialog) {
        await dc.continueDialog();
      } else if (text.indexOf('city') > -1) {
        await context.sendActivity('OK! Let me help you with that.');
        await dc.beginDialog(GET_CITY);
      } else if (text === 'cancel') {
        if (dc.activeDialog) {
          await dc.cancelAllDialogs();
          await dc.context.sendActivity(`Ok... canceled.`);
        } else {
          await dc.context.sendActivity(`Nothing to cancel.`);
        }
      } else {
        await context.sendActivity(`Hello!
          This bot will choose a big city for you. Just say "choose a city for me" or "pick a city"
          `);
      }
    }

    // End this turn by saving changes to the conversation state.
    await this.conversationState.saveChanges(context);
    await this.userState.saveChanges(context);
  }
}

module.exports.CityBot = CityBot;