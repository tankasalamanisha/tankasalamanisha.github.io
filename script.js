document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const form = document.getElementById('repo-form');
  
    // Add event listener for form submission
    form.addEventListener('submit', function(event) {
      event.preventDefault();
  
      // Get the input value
      const username = document.getElementById('username').value;
  
      // Create the request body
      const requestBody = {
        username: username
      };
  
      // Send a POST request to the Flask API endpoint
      fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => response.json())
      .then(data => {
        // Display the result on the webpage
        const resultContainer = document.getElementById('result-container');
        resultContainer.innerHTML = `
          <h3>Most Complex Repository:</h3>
          <p>Name: ${data.most_complex_repo}</p>
          <p>Complexity Score: ${data.complexity_score}</p>
        `;
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  });  