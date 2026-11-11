// Get references to the DOM elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');

// Keep the system instructions and conversation messages for each request.
const conversationHistory = [
  {
    role: 'system',
    content: `You are a friendly Budget Travel Planner, specializing in cost-conscious travel advice. You help users find cheap flights, budget-friendly accommodations, affordable itineraries, and low-cost activities in their chosen destination.

          Use earlier messages to understand follow-up questions and remember details the user has shared during this conversation. If a user's query is unrelated to budget travel, respond by stating that you do not know.`
  }
];

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  // Save the message before clearing the input.
  const userMessage = userInput.value;
  userInput.value = '';
  main(userMessage).catch((error) => {
    console.error('Failed to get a response from the API:', error);
    responseContainer.textContent = 'Sorry, something went wrong while getting a response. Please try again.';
  });
});

async function main(userMessage) {
  // Let the user know the assistant is working on a reply.
  responseContainer.textContent = 'Thinking...';

  // Include the new question without saving it until the request succeeds.
  const messages = [...conversationHistory, { role: 'user', content: userMessage }];

  // Send a POST request to the OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', // We are POST-ing data to the API
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
      'Authorization': `Bearer ${apiKey}` // Include the API key for authorization
    },
    // Send model details and system message
    body: JSON.stringify({
      model: 'gpt-4o',
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  // Parse and store the response data
  const result = await response.json();
  const assistantMessage = result.choices?.[0]?.message?.content;

  if (typeof assistantMessage !== 'string') {
    throw new Error('API response did not contain an assistant message');
  }

  // Save the question and reply so they are included with the next question.
  conversationHistory.push({ role: 'user', content: userMessage });
  conversationHistory.push({ role: 'assistant', content: assistantMessage });
  // Show only the latest reply.
  responseContainer.textContent = assistantMessage;
};