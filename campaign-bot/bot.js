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
const { ConfirmPrompt, ChoicePrompt, DialogSet, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'user';

const EMAIL_PROMPT = 'email_prompt';
const NAME_PROMPT = 'name_prompt';
const PHONE_PROMPT = 'phone_prompt';
const CONFIRM_PROMPT = 'confirm_update';

const CONFIRM_CHANGE_PROMPT = 'go_ahead_prompt';
const PHONE_REGEX = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const FIND_PROFILE = 'find_profile';
const UPDATE_PHONE = 'update_phone';

class ChangePhoneBot {

  constructor(conversationState,userState, acs) {
    this.acs = acs;
    this.userState = userState;
    this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);
    this.conversationState = conversationState;
    this.acsApi = acs;
    this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);
    this.dialogs = new DialogSet(this.dialogState);

    this.dialogs.add(new TextPrompt(EMAIL_PROMPT));
    this.dialogs.add(new TextPrompt(NAME_PROMPT));
    this.dialogs.add(new ConfirmPrompt(CONFIRM_PROMPT));
    this.dialogs.add(new TextPrompt(PHONE_PROMPT));

    this.dialogs.add(new ConfirmPrompt(CONFIRM_CHANGE_PROMPT));

    this.dialogs.add(new WaterfallDialog(FIND_PROFILE, [
      this.promptForEmail.bind(this),
      this.promptForName.bind(this),
      this.confirmDetails.bind(this),
      this.findProfile.bind(this),
      this.promptForPhone.bind(this),
      this.updatePhone.bind(this)
    ]));

  }

  // This step in the dialog prompts the user for their email.
  async promptForEmail(step) {
    return await step.prompt(EMAIL_PROMPT, `What is your email address?`);
  }

  // This step in the dialog prompts the user for their email.
  async promptForName(step) {
    const user = await this.userProfile.get(step.context, {});
    if (step.result !== -1) {
      user.email = step.result;
      await this.userProfile.set(step.context, user);
    } else {
      await step.context.sendActivity(`No email given.`);
    }
    return await step.prompt(NAME_PROMPT, `What is your full name?`);
  }

  // This step captures the user's age.
  async confirmDetails(step) {
    const user = await this.userProfile.get(step.context, {});
    if (step.result !== -1) {
      user.name = step.result;
      await this.userProfile.set(step.context, user);
      await step.context.sendActivity(`Thank you ${user.name}. I will now look for your profile under email ${user.email}`);
    } else {
      await step.context.sendActivity(`No email given.`);
    }
    return await step.next(-1);
  }

  async getProfile(email) {
    return this.acs.getProfileByEmail(email);
  }

  async updateProfilePhone(profile, mobile) {
    console.log(profile, mobile);
    return this.acs.updateProfile(profile,{mobilePhone:mobile});
  }

  async findProfile(step) {
    const user = await this.userProfile.get(step.context, {});
    await step.context.sendActivity(`Looking for your profile...`);
    const result = await this.getProfile(user.email);

    if (result.content && result.content.length > 0) {
      const profile = result.content[0];
      user.profile = profile;
      const name = profile.firstName.toLowerCase() + ' ' + profile.lastName.toLowerCase();

      if (name === user.name.toLowerCase()) {
        await step.context.sendActivity(`I have located your profile.`);
        return step.prompt(CONFIRM_PROMPT, `Your current mobile number is ${profile.mobilePhone}. Would you like to update it?`);
      } else {
        await step.context.sendActivity(`I have located a profile with this email address, however the name is incorrect. Please try again`);
      }
    } else {
      await step.context.sendActivity(`I could not find your profile.`);
    }
    return step.endDialog()
  }

  async promptForPhone(step) {
    if (step.result && step.result === true) {
      return step.prompt(PHONE_PROMPT, `What is your current phone number?`);
    } else {
      await step.context.sendActivity(`No problem! Thank you for using this bot.`);
      return step.endDialog();
    }
  }

  async updatePhone(step) {
    const user = await this.userProfile.get(step.context, {});
    console.log(step.result);
    if (step.result) {
      await step.context.sendActivity(`Updating your phone to ${step.result}.`);
      const result = await this.updateProfilePhone(user.profile, step.result);
      await step.context.sendActivity(`Your phone has been updated, have a great day!`);
    } else {
      await step.context.sendActivity(`I did not get that. Please try again.`);
    }
    return step.endDialog();
  }

  async onTurn(context) {
    const dc = await this.dialogs.createContext(context);

    if (context.activity.type === ActivityTypes.Message) {
      let text = context.activity.text.toLowerCase();

      if (text !== 'cancel' && dc.activeDialog) {
        await dc.continueDialog();
      } else {
        switch (text) {
          case 'i want to update my phone number':
          case 'i want to change my phone number':
          case 'i want to update phone number':
          case 'i want to change phone number':
          case 'update my phone number':
          case 'change my phone number':
          case 'update phone number':
          case 'change phone number':
          case 'update phone':
          case 'change phone':
            await context.sendActivity('OK! Let me help you with that.');
            await dc.beginDialog(FIND_PROFILE);
            break;
          case 'cancel':
            if (dc.activeDialog) {
              await dc.cancelAllDialogs();
              await dc.context.sendActivity(`Ok... canceled.`);
            } else {
              await dc.context.sendActivity(`Nothing to cancel.`);
            }
            break;
          case 'hello':
          case 'hi':
          default:
            await context.sendActivity(`Hello!
          This bot will demonstrate the Bot Connector integration with Adobe Campaign Standard.
          I can help you to update your phone number. Please say "Update phone" or "Change my phone number"
          `);
        }
      }
    }

    // End this turn by saving changes to the conversation state.
    await this.conversationState.saveChanges(context);
    await this.userState.saveChanges(context);
  }
}

module.exports.ChangePhoneBot = ChangePhoneBot;