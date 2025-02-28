import {
  AxiosRequestConfig,
  Extensible,
  InterpretationPluginConfig,
  Jovo,
  JovoError,
  NluData,
  NluPlugin,
  axios,
} from '@jovotech/framework';
import OpenAI from 'openai';

export interface LLMNLUConfig extends InterpretationPluginConfig {
  model?: string;
  apiKey?: string;
  fallbackThreshold?: number;
}

export class LlmNlu extends NluPlugin<LLMNLUConfig> {
  private openai: OpenAI;

  constructor(config?: LLMNLUConfig) {
    super(config);
    this.openai = new OpenAI({
      apiKey: config?.apiKey || process.env.OPENAI_API_KEY,
    });
  }

  mount(parent: Extensible): void {
    super.mount(parent);
  }

  getDefaultConfig(): LLMNLUConfig {
    return {
      ...super.getDefaultConfig(),
      endpoint: '',
      model: 'gpt-4',
      fallbackThreshold: 0.7,
    };
  }

  async processText(jovo: Jovo, text: string): Promise<NluData | undefined> {
    if (!this.config.model) {
      throw new JovoError({
        message: `OpenAI model configuration is missing.`,
      });
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: [
              'You are an intent classification and entity extraction model.',
              'Classify the user input into one of these intents:',
              '- YesIntent (e.g., "Yes", "Sure", "Absolutely")',
              '- NoIntent (e.g., "No", "Nope", "Not really")',
              '- GeneralIntent (e.g., "I like pizza", "Tell me more")',
              '- FallbackIntent (unclear input)',
              'Extract entities like "food" and "quantity" if mentioned.',
              'Respond ONLY with JSON:',
              '{ "intent": "YesIntent" | "NoIntent" | "GeneralIntent" | "FallbackIntent", "entities": { "entityName": "entityValue" } }',
            ].join('\n'),
          },
          { role: 'user', content: `User input: \"${text}\"` },
        ],
        max_tokens: 100,
        response_format: { type: 'json_object' },
      });

      const messageContent = response.choices[0]?.message?.content || '{}';
      const result = JSON.parse(messageContent);

      const nluData: NluData = {
        intent: { name: result.intent || 'FallbackIntent' },
        entities: result.entities || {},
        native: result,
      };

      return nluData;
    } catch (error) {
      console.error('OpenAI NLU Error:', error);
      return { intent: { name: 'FallbackIntent' }, entities: {} };
    }
  }
}
