import {
  axios,
  Extensible,
  InterpretationPluginConfig,
  Jovo,
  JovoError,
  NluData,
  NluPlugin,
} from '@jovotech/framework';

import * as fs from 'fs';
import * as path from 'path';

export interface LlmNluConfig extends InterpretationPluginConfig {
  model?: string;
  intentModelPath?: string;
}

export class LlmNlu extends NluPlugin<LlmNluConfig> {
  private nluPrompt: string;

  mount(parent: Extensible): void {
    super.mount(parent);
  }

  getDefaultConfig(): LlmNluConfig {
    return {
      ...super.getDefaultConfig(),
      intentModelPath: '../models/en.json',
      model: 'gpt-4',
    };
  }

  /**
   * Generates a structured system prompt dynamically based on the loaded intent model.
   */
  private generatePrompt(intentModel: any): string {
    let prompt = `You are an intent classification and entity extraction model.\n`;
    prompt += `Classify the user input into one of these intents:\n`;

    if (intentModel.intents) {
      for (const [intent, data] of Object.entries(intentModel.intents)) {
        const phrases = (data as any).phrases || [];
        prompt += `- ${intent} (e.g., ${phrases.length > 0 ? phrases.join(', ') : ''})\n`;
      }
    }

    prompt += `\nExtract entities if mentioned and respond ONLY with JSON:\n`;
    prompt += `{\n  "intent": "IntentName",\n  "entities": { "entityName": "entityValue" }\n}`;

    return prompt;
  }

  async processText(jovo: Jovo, text: string): Promise<NluData | undefined> {
    if (!this.config.model) {
      throw new JovoError({
        message: `OpenAI model configuration is missing.`,
      });
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system', // Corrected from 'developer' (should be 'system' in OpenAI API)
              content: this.nluPrompt,
            },
            {
              role: 'user',
              content: text,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use environment variable for security
          },
        },
      );
      const messageContent = response.data.choices[0].message.content;
      const result = JSON.parse(messageContent);

      const nluData: NluData = {
        intent: { name: result.intent || 'FallbackIntent' },
        entities: result.entities || {},
        native: result,
      };

      return nluData;

      // return {
      //   intent: { name: 'FallbackIntent' },
      //   entities: {},
      //   native: {},
      // };
    } catch (error) {
      console.error('OpenAI NLU Error:', error);
      return { intent: { name: 'FallbackIntent' }, entities: {} };
    }
  }

  constructor(config?: LlmNluConfig) {
    super(config);
    //setup the nluPrompt
    // Resolve the full path to intent model
    const intentModelFullPath = path.resolve(config?.intentModelPath || 'models/en.json');

    // Load the intent model JSON
    try {
      const modelData = fs.readFileSync(intentModelFullPath, 'utf-8');
      const intentModel = JSON.parse(modelData);

      if (!intentModel.intents || typeof intentModel.intents !== 'object') {
        throw new Error(`Invalid intent model format in ${config?.intentModelPath}`);
      }

      // Generate the system prompt dynamically based on the intent model
      this.nluPrompt = this.generatePrompt(intentModel);
    } catch (error) {
      console.error(`Failed to load intent model from ${intentModelFullPath}:`, error);
      throw new JovoError({
        message: `Error loading intent model: ${error}`,
      });
    }
    // this.openai = new OpenAI({
    //   apiKey: process.env.OPENAI_API_KEY,
    // });
  }
}
