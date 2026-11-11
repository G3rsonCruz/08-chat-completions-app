// Get references to the DOM elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const responseContainer = document.getElementById('response');
const conversationHistory = [
  {
    role: 'system',
    content: `You are a friendly Budget Travel Planner, specializing in cost-conscious travel advice. You help users find cheap flights, budget-friendly accommodations, affordable itineraries, and low-cost activities in their chosen destination.

          If a user's query is unrelated to budget travel, respond by stating that you do not know.`
  }
];

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const userMessage = userInput.value;
  userInput.value = '';
  main(userMessage);
});

async function main(userMessage) {
  conversationHistory.push({ role: 'user', content: userMessage });

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
      messages: conversationHistory
    })
  });
  // Parse and store the response data
  const result = await response.json();
  const assistantMessage = result.choices[0].message.content;
  conversationHistory.push({ role: 'assistant', content: assistantMessage });
  // Display the response on the page
  responseContainer.textContent = assistantMessage;
};