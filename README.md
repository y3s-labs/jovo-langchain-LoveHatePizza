# Jovo v4 Template with OpenAI & Langchain Integration

[![Jovo Framework](https://www.jovo.tech/img/github-header.png)](https://www.jovo.tech)

<p>
  <a href="https://www.jovo.tech" target="_blank">Website</a> -  
  <a href="https://www.jovo.tech/docs" target="_blank">Docs</a> - 
  <a href="https://www.jovo.tech/marketplace" target="_blank">Marketplace</a> - 
  <a href="https://github.com/jovotech/jovo-v4-template" target="_blank">Template</a>
</p>

This repository is a sample [Jovo `v4`](https://www.jovo.tech) app that now includes an integration with OpenAI using [Langchain](https://github.com/hwchase17/langchainjs). With this update, you can leverage OpenAI’s language models to build more dynamic and intelligent voice and chat experiences.

## What's New?

- **OpenAI Integration:** Interact with OpenAI’s API to generate responses, perform NLP tasks, or enhance your conversational logic.
- **Langchain Integration:** Utilize Langchain to create more modular and flexible pipelines when working with language models.
- **Enhanced Experience:** Seamless integration that allows you to incorporate state-of-the-art AI capabilities into your Jovo app.

## Getting Started

> Learn more in the [Jovo docs](https://www.jovo.tech/docs/getting-started) and [Langchain documentation](https://js.langchain.com/docs/).

### Installation

1. **Install the Jovo CLI**  
   Install the Jovo CLI globally using npm:

   ```sh
   npm install -g @jovotech/cli
   ```

2. **Verify the Installation**
Check that the installation was successful:

    ```sh
    jovo -v
    ```
3. **Create a New Project**
Use the new command to scaffold your project:

    ```sh
    jovo new <directory>
    ```
4. **Install DependenciesNavigate**
Install into your project directory and install any additional dependencies for Langchain and OpenAI:

    ```sh
    cd <directory>
    npm install langchain openai
    ```

### Running the App

Once your project is set up, you can start your local development server:

```sh
jovo run
```
Press the . key to open the Jovo Debugger and see your app in action.

## OpenAI & Langchain Integration Details

This project works by assigning each component a specific prompt, which is then injected into a base prompt. This modular approach enables dynamic prompt management and customization based on different conversational needs. It also allows you to create agentic workflows with Langchain, enabling more sophisticated and autonomous interactions.

This project works by assigning each component a specific prompt, which is then injected into a base prompt. This modular approach enables dynamic prompt management and customization based on different conversational needs.

### Base Prompt

The base prompt serves as a structured template for AI responses, ensuring consistency and predictability in outputs. It follows this structure:

```ts
private basePrompt = `{prompt}
                I will return a json object defined by the following typescript interface:
                export interface AIResponse {
                    message: string;
                    entities: Entity[];
                    intent: string;
                    listen: string;
                }

                export interface Entity {
                    type: string;
                    value: string;
                }`;
```

This ensures that the AI response is formatted as a well-defined JSON object, making it easier to parse and utilize within the Jovo framework.

This project demonstrates how to integrate OpenAI's models via Langchain. Here’s a brief overview of the integration:

### Configuration

Ensure your OpenAI API key is set as an environment variable or stored in an .env file:

```sh
OPENAI_API_KEY=your-api-key-here
```

Ensure your OpenAI API key is set as an environment variable (e.g., OPENAI_API_KEY) or configured in your project’s configuration file.

### Usage Example

Inside your Jovo app, you can now import and use Langchain to create and manage prompt pipelines. For example:

```ts
const { OpenAI } = require('langchain/llms/openai');

const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
});

// Example function to generate a response using OpenAI
async function generateResponse(prompt) {
  const response = await openai.call(prompt);
  return response;
}
```

### Customization

Customize the integration by adjusting parameters like temperature, maxTokens, and prompt structure to suit your voice or chat experience.

For additional details and advanced configurations, refer to the Langchain docs and the OpenAI API documentation.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have improvements or suggestions.

## License

This project is licensed under the terms of the MIT License.