import express, { Express, Request, Response, NextFunction } from 'express';

import { ExpressJs } from '@jovotech/server-express';
import { app } from './app';
import * as functions from 'firebase-functions';

/*
|--------------------------------------------------------------------------
| GOOGLE CLOUD FUNCTION CONFIGURATION
|--------------------------------------------------------------------------
|
| Google Cloud Functions (GCF) do not support persistent servers.
| Instead, we export an HTTP function that handles requests.
|
*/

const jovoApp = express();

jovoApp.use(express.json());

// const authorize = (req: Request, res: Response, next: NextFunction): void => {
//   if (req.query.key !== process.env.EVA_KEY) {
//     console.log('Unauthorized');
//     res.status(401).send('Unauthorized...');
//     return;
//   }
//   next();
// };

// app.use(authorize);

jovoApp.get('/', async (req: Request, res: Response) => {
  //   const response = await app.handle(new ExpressJs(req, res));
  //   res.json(response);
  const message = 'heyyyy';
  res.status(200).send(message);
});

jovoApp.get('/webhook', async (req: Request, res: Response) => {
  const response = await app.handle(new ExpressJs(req, res));
  res.json(response);
});

jovoApp.post('/webhook', async (req: Request, res: Response) => {
  const response = await app.handle(new ExpressJs(req, res));
  res.json(response);
});

exports.jovoApp = jovoApp;
