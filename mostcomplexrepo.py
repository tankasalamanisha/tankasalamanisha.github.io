from flask import Flask, request, render_template
import requests
import ast
from radon.complexity import cc_visit

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        username = request.form.get('username')
        repository_names = fetch_github_repos(username)

        if repository_names:
            most_complex_repo, complexity_score = calculate_complexity(username, repository_names)
            return f"The most complex repository for user '{username}' is '{most_complex_repo}' with a complexity score of {complexity_score}."
        else:
            return f"No repositories found for user {username}."

    return render_template('index.html')

def fetch_github_repos(username):
    url = f"https://api.github.com/users/{username}/repos"
    response = requests.get(url)

    if response.status_code == 200:
        repos = response.json()
        repo_names = [repo["name"] for repo in repos]
        return repo_names
    else:
        print(f"Failed to fetch repositories for user {username}. Error: {response.status_code}")
        return []

def calculate_complexity(username, repository_names):
    complexity_scores = {}

    for repo_name in repository_names:
        url = f"https://api.github.com/repos/{username}/{repo_name}/contents"
        response = requests.get(url)

        if response.status_code == 200:
            files = response.json()
            total_complexity = 0

            for file in files:
                if file["type"] == "file" and file["name"].endswith(".py"):
                    file_url = file["download_url"]
                    file_content = requests.get(file_url).text
                    try:
                        parsed_ast = ast.parse(file_content)
                        file_complexity = cc_visit(parsed_ast)
                        file_total_complexity = sum([complexity.complexity for complexity in file_complexity])
                        total_complexity += file_total_complexity
                    except SyntaxError:
                        print(f"Failed to parse file {file['name']} in repository {repo_name}.")
                        continue

            complexity_scores[repo_name] = total_complexity
        else:
            print(f"Failed to fetch repository {repo_name}. Error: {response.status_code}")

    if complexity_scores:
        most_complex_repo = max(complexity_scores, key=complexity_scores.get)
        return most_complex_repo, complexity_scores[most_complex_repo]
    else:
        return None

if __name__ == '__main__':
    app.run()