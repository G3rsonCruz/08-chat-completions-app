// Get references to the DOM elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');

// Replace this with your deployed Cloudflare Worker URL.
const workerUrl = 'https://wanderbot-worker.cruzcarcg.workers.dev/';

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

  const userMessage = userInput.value.trim();

  if (!userMessage) {
    return;
  }

  userInput.value = '';
  main(userMessage).catch((error) => {
    console.error('Failed to get a response from the API:', error);
    responseContainer.textContent = 'Sorry, something went wrong while getting a response. Please try again.';
  });
});

async function main(userMessage) {
  responseContainer.textContent = 'Thinking...';

  const messages = [...conversationHistory, { role: 'user', content: userMessage }];

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || 'API request failed';
    throw new Error(`${errorMessage} (status ${response.status})`);
  }

  const result = await response.json();
  const assistantMessage = result.choices?.[0]?.message?.content;

  if (typeof assistantMessage !== 'string') {
    throw new Error('API response did not contain an assistant message');
  }

  conversationHistory.push({ role: 'user', content: userMessage });
  conversationHistory.push({ role: 'assistant', content: assistantMessage });
  responseContainer.textContent = assistantMessage;
}
