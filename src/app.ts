import { App, Jovo } from '@jovotech/framework';

import { GlobalComponent } from './components/GlobalComponent';
import { LoveHatePizzaComponent } from './components/LoveHatePizzaComponent';
import { CorePlatform } from '@jovotech/platform-core';
import { NlpjsNlu } from '@jovotech/nlu-nlpjs';
import { LangEn } from '@nlpjs/lang-en';
import { SessionDataKey } from './util/SessionDataKeys';

/*
|--------------------------------------------------------------------------
| APP CONFIGURATION
|--------------------------------------------------------------------------
|
| All relevant components, plugins, and configurations for your Jovo app
| Learn more here: www.jovo.tech/docs/app-config
|
*/
const app = new App({
  /*
  |--------------------------------------------------------------------------
  | Components
  |--------------------------------------------------------------------------
  |
  | Components contain the Jovo app logic
  | Learn more here: www.jovo.tech/docs/components
  |
  */
  components: [GlobalComponent, LoveHatePizzaComponent],

  /*
  |--------------------------------------------------------------------------
  | Plugins
  |--------------------------------------------------------------------------
  |
  | Includes platforms, database integrations, third-party plugins, and more
  | Learn more here: www.jovo.tech/marketplace
  |
  */
  plugins: [
    // Add Jovo plugins here
    new CorePlatform({
      plugins: [
        new NlpjsNlu({
          languageMap: { en: LangEn },
          modelsPath: './models',
        }),
      ],
    }),
  ],

  /*
  |--------------------------------------------------------------------------
  | Other options
  |--------------------------------------------------------------------------
  |
  | Includes all other configuration options like logging
  | Learn more here: www.jovo.tech/docs/app-config
  |
  */
  logging: true,
});

app.hook('before.dialogue.start', (jovo: Jovo): void => {
  if (jovo.$session.isNew) {
    jovo.$user.data.sessionCount = (jovo.$user.data.sessionCount || 0) + 1;
  }
});

// app.hook('after.interpretation.nlu', (jovo: Jovo): void => {
// });

app.hook('before.dialogue.router', (jovo: Jovo): void => {
  const userInput = jovo.$input.text;

  if (userInput) {
    jovo.$session.data[SessionDataKey.History] = jovo.$session.data[SessionDataKey.History] || [];
    jovo.$session.data[SessionDataKey.History].push({ role: 'user', content: userInput });
  }
});

export { app };
