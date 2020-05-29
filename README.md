# Adobe Experience Cloud Microsoft Bot Framework Integrations


[![Build Status](https://travis-ci.com/adobe/aec-bot-integrations.svg?branch=master)](https://travis-ci.com/adobe/aec-bot-integrations)

These are integration examples for building integrations between Adobe Experience Cloud services and the [Microsoft Bot Framework](https://dev.botframework.com/).  The Microsoft Bot Framework is a multi-channel framework to build conversational user experiences wherever users are, including email, text/SMS, websites, Facebook Messenger, Microsoft Teams, Slack, and Skype.

The guidance demonstrates the following scenarios:

1. [Adobe Experience Manager](aem-chatbot-demo): How to add a chatbot to an Adobe Experience Manager webpage.
2. [Adobe Campaigns Standard](campaigns-bot): How to integrate a chatbot with profiles from Adobe Campaigns Standard.
    - Send a transactional message via email or text from a bot
    - Query an Adobe Campaigns user profile from a bot
    - Update an Adobe Campaigns user profile from a bot
3. [Adobe Target](target-bot): Use Adobe Target to do A/B testing within a chatbot trying out different conversational messages and paths for different users.

There are many other ways to integrate Adobe Experience Cloud Services with the Microsoft Bot Builder Framework that we will publish via this repository.  The guidance and examples here have been built from a collaboration between Microsoft and Adobe and represent architectural recommendations.  As all use cases are unique, it is important to understand and evaluate the guidance based on your specific needs.  Please try it out, fork it, make a pull request, and give us your feedback!

# Installation

Instructions for how to download/install the code onto your machine.

Example:
```
npm install myProject --save
```

# Usage

Usage instructions for your code.

Example:

```
var myMod = require('mymodule');

myMod.foo('hi');
```

## Contributing

Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.

# Bot Framework Resources

[BotFramework Home page](https://dev.botframework.com/)

[Bot Framework JavaScript Quickstart](https://docs.microsoft.com/en-us/azure/bot-service/javascript/bot-builder-javascript-quickstart?view=azure-bot-service-4.0)

[Bot Builder JS Github Repo:](https://github.com/Microsoft/botbuilder-js)

[Bot Builder Samples Repo](https://github.com/microsoft/botbuilder-samples)

[Topical](https://github.com/billba/topical) framework for modeling conversations in Microsoft BotBuilder 4.x using the Topics pattern.

[Styling WebChat Sample](https://github.com/Microsoft/BotBuilder-Samples/tree/master/samples/javascript_es6/70.styling-webchat)

[Create a Direct Line bot and client](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-direct-line?view=azure-bot-service-4.0)

[Custom Dialogs Example](https://github.com/Microsoft/BotBuilder-Samples/blob/master/samples/javascript_nodejs/19.custom-dialogs/bot.js)

[Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/)

[LUIS - Language Understanding](https://www.luis.ai/)

[QnA Maker](https://www.qnamaker.ai/)
