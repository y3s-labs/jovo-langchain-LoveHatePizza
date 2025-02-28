import { Component, BaseComponent, Intents, Jovo, Handle } from '@jovotech/framework';
import { AIResponse, llmService } from '../services/llmService';
import { SessionDataKey } from '../util/SessionDataKeys';

const llm = new llmService();

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
|
| A component consists of handlers that respond to specific user requests
| Learn more here: www.jovo.tech/docs/components, jovo.tech/docs/handlers
|
*/

interface Pizza {
  love?: boolean;
  toppings?: string[];
  sauce?: string;
  size?: string;
  dietaryPreferences?: string[];
}

@Component()
export class LoveHatePizzaComponent extends BaseComponent {
  @Handle({
    intents: ['None'],
    global: true,
    prioritizedOverUnhandled: true,
  })
  async handleUserResponse() {
    const pizza: Pizza = this.$session.data[SessionDataKey.Pizza] ?? {
      love: undefined,
      toppings: undefined,
      sause: undefined,
      size: undefined,
      dietaryPreferences: undefined,
    };
    const prompt = this.buildPrompt(pizza);

    console.log('Prompt: ', prompt);

    // Get AI-generated response
    const botResponse = await llm.getAIResponse(prompt, this);

    const newPizza = this.buildPizza(botResponse, pizza);

    this.$session.data[SessionDataKey.Pizza] = newPizza;

    return this.$send({ message: botResponse.message, listen: true });
  }

  /**
   * Update the pizza object based on the AI response.
   * Only update properties provided in the response's entities.
   */
  buildPizza(response: AIResponse, pizza: Pizza): Pizza {
    const { entities } = response;
    if (entities) {
      for (const entity of entities) {
        if (entity.type === 'love') {
          pizza.love = entity.value === 'yes' ? true : false;
        }
        if (entity.type === 'toppings') {
          pizza.toppings = String(entity.value)
            .split(',')
            .map((item) => item.trim());
        }
        if (entity.type === 'sauce') {
          pizza.sauce = String(entity.value);
        }
        if (entity.type === 'size') {
          pizza.size = String(entity.value);
        }
        if (entity.type === 'dietaryPreferences') {
          pizza.dietaryPreferences = String(entity.value)
            .split(',')
            .map((item) => item.trim());
        }
      }
    }

    return pizza;
  }

  buildPrompt(pizza: Pizza): string {
    const prompt = `
1. Ask the user if they love pizza.
   - love (e.g., yes, no)
2. Ask follow-up questions to determine their pizza preferences, including the following:  
   - toppings (e.g., pepperoni, mushrooms, extra cheese).  
   - sauce type (e.g., tomato, white sauce, BBQ).
   - size (e.g., small, medium, large).  
   - Any dietary preferences (e.g., vegetarian, gluten-free).  
4. If the user provides an incomplete response, politely ask for clarification.  
5. End the conversation with a fun or engaging message, such as recommending a pizza based on their choices.
6. The user may choose to end the conversation by saying something like: 'bye', 'im done', 'stop','cancel', or 'good bye'

Current pizza state:
love: ${pizza.love ?? 'No Input'}
toppings: ${pizza.toppings ?? 'No Input'}
sauce: ${pizza.sauce ?? 'No Input'}
size: ${pizza.size ?? 'No Input'}
dietaryPreferences: ${pizza.dietaryPreferences ?? 'No Input'}
`;

    return prompt;
  }
}
