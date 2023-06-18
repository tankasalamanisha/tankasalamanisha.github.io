document.getElementById("username-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission
  
    const username = document.getElementById("username").value;
    const url = `https://api.github.com/users/${username}/repos`;
  
    fetch(url)
      .then(response => response.json())
      .then(repos => {
        if (repos.length > 0) {
          const complexityScores = {};
  
          for (const repo of repos) {
            const repoName = repo.name;
            const repoUrl = `https://api.github.com/repos/${username}/${repoName}/contents`;
  
            fetch(repoUrl)
              .then(response => response.json())
              .then(files => {
                let totalComplexity = 0;
  
                for (const file of files) {
                  if (file.type === "file" && file.name.endsWith(".py")) {
                    fetch(file.download_url)
                      .then(response => response.text())
                      .then(fileContent => {
                        try {
                          const parsedAst = ast.parse(fileContent);
                          const fileComplexity = radon_metrics.cc_visit(parsedAst);
                          const fileTotalComplexity = fileComplexity.reduce((sum, complexity) => sum + complexity.complexity, 0);
                          totalComplexity += fileTotalComplexity;
                        } catch (error) {
                          console.error(`Failed to parse file ${file.name} in repository ${repoName}.`, error);
                        }
                      })
                      .catch(error => {
                        console.error(`Failed to fetch file ${file.name} in repository ${repoName}.`, error);
                      });
                  }
                }
  
                complexityScores[repoName] = totalComplexity;
              })
              .catch(error => {
                console.error(`Failed to fetch repository ${repoName}.`, error);
              });
          }
  
          setTimeout(() => {
            if (Object.keys(complexityScores).length > 0) {
              const mostComplexRepo = Object.keys(complexityScores).reduce((a, b) => complexityScores[a] > complexityScores[b] ? a : b);
              const complexityScore = complexityScores[mostComplexRepo];
  
              document.getElementById("repo-name").textContent = mostComplexRepo;
              document.getElementById("complexity-score").textContent = `Complexity Score: ${complexityScore}`;
  
              document.getElementById("result").style.display = "block";
            } else {
              console.log(`No repositories found for user ${username}.`);
            }
          }, 5000); // Wait for all requests to complete before displaying result
        } else {
          console.log(`No repositories found for user ${username}.`);
        }
      })
      .catch(error => {
        console.error(`Failed to fetch repositories for user ${username}.`, error);
      });
  });
  