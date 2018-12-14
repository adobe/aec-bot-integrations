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

const path = require('path');
const restify = require('restify');

const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { BotConfiguration } = require('botframework-config');
const { ChangePhoneBot } = require('./bot');

const ACSApi = require('../packages/adobeio-api-middleware/dist/ACSApi.js').default;

const ENV_FILE = path.join(__dirname, '.env');

require('dotenv').config({ path: ENV_FILE });

const DEV_ENVIRONMENT = 'development';

const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});

const BOT_FILE = path.join(__dirname, (process.env.botFilePath || ''));
let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.\n\n`);
    process.exit();
}

const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);
const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const acs = new ACSApi({
    api_key: process.env.APIKEY,
    technical_account_id: process.env.ACCOUNT_ID,
    org_id: process.env.ORG_ID,
    client_secret: process.env.SECRET,
    private_key: process.env.PKEY,
    tenant: process.env.TENANT,
    transactionalApi: process.env.TRANSACTIONAL
});

const phoneBot = new ChangePhoneBot(conversationState, userState, acs);

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError]: ${ error }`);
    context.sendActivity(`Oops. Something went wrong!`);
    await conversationState.load(context);
    await conversationState.clear(context);
    await conversationState.saveChanges(context);
};

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await phoneBot.onTurn(context);
    });
});
