import { app } from './app';
import { FileDb } from '@jovotech/db-filedb';
import { JovoDebugger } from '@jovotech/plugin-debugger';

/*
|--------------------------------------------------------------------------
| STAGE CONFIGURATION
|--------------------------------------------------------------------------
|
| This configuration gets merged into the default app config
| Learn more here: www.jovo.tech/docs/staging
|
*/
app.configure({
  plugins: [
    new FileDb({
      pathToFile: '../db/db.json',
      storedElements: {
        user: true,
        session: true,
        history: {
          enabled: true,
          size: 1,
          output: true,
        },
        createdAt: true,
        updatedAt: true,
      },
    }),
    new JovoDebugger({
      webhookUrl: 'http://localhost:4000',
    }),
  ],
});

export * from './server.express';
