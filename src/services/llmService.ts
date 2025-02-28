import { Jovo } from '@jovotech/framework';
import { ChatOpenAI } from '@langchain/openai';

import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { SessionDataKey } from '../util/SessionDataKeys';

export interface AIResponse {
  message: string;
  entities: Entity[];
}

export interface Entity {
  type: string;
  value: string;
}

export class llmService {
  private chatModel = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 4095,
    temperature: 1,
    modelKwargs: {
      response_format: {
        type: 'json_object',
      },
    },
  });

  private basePrompt = `{prompt}
                I will return a json object defined by the following typescript interface:
                export interface AIResponse {{
                    message: string;
                    entities: Entity[];
                    intent: string;
                    listen: string;
}}

                export interface Entity {{
                    type: string;
                    value: string;
}}`;

  // private openai: OpenAI;
  //private model: string;

  constructor() {
    // this.openai = new OpenAI({ apiKey });
    //this.model = model;
  }

  async getAIResponse(prompt: string, jovo: Jovo): Promise<AIResponse> {
    const userInput = jovo.$input.text ?? '';
    const history = jovo.$session.data[SessionDataKey.History];

    try {
      const promptTemplate = ChatPromptTemplate.fromMessages(this.buildChatPromptTemplate(history));

      const formattedPrompt = await promptTemplate.formatPromptValue({
        prompt: prompt,
      });

      const response = await this.chatModel.generatePrompt([formattedPrompt]);

      const result = response.generations[0][0].text;

      const llmResponse: AIResponse = JSON.parse(result);

      //add to conversation history
      // store user message in session history
      jovo.$session.data[SessionDataKey.History].push({
        role: 'bot',
        content: llmResponse.message,
      });

      return llmResponse;
    } catch (error) {
      console.error('OpenAIService Error:', error);
      return { message: 'Sorry I dont know what to say', entities: [] };
    }
  }

  private buildChatPromptTemplate(
    history: any,
  ): (SystemMessagePromptTemplate | AIMessagePromptTemplate | HumanMessagePromptTemplate)[] {
    const escapeCurlyBraces = (text: string) => text.replace(/\{([^{}]*)\}/g, '{{$1}}');

    const messagesArray = [SystemMessagePromptTemplate.fromTemplate(this.basePrompt)];

    if (history && Array.isArray(history) && history.length > 0) {
      for (let i = 0; i < history.length; i++) {
        const content = escapeCurlyBraces(history[i].content);
        if (history[i].speaker === 'bot') {
          messagesArray.push(AIMessagePromptTemplate.fromTemplate(content));
        } else {
          messagesArray.push(HumanMessagePromptTemplate.fromTemplate(content));
        }
      }
    }

    return messagesArray;
  }
}
