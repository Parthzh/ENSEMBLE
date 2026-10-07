import os
import random
import subprocess
from datetime import datetime, timedelta

def run_cmd(cmd, env=None):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, env=env, check=True)

def make_commit(message, files_to_add, days_ago):
    # Add files
    run_cmd(f"git add {files_to_add}")
    
    # Calculate date
    commit_date = datetime.now() - timedelta(days=days_ago, hours=random.randint(1, 8), minutes=random.randint(1, 59))
    date_str = commit_date.strftime("%Y-%m-%dT%H:%M:%S")
    
    # Set environment variables for git
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = date_str
    env["GIT_COMMITTER_DATE"] = date_str
    
    # Commit
    run_cmd(f'git commit -m "{message}"', env=env)

def main():
    # Ensure git is initialized
    if not os.path.exists(".git"):
        run_cmd("git init")
    
    # Configure dummy user if not set (to prevent errors in new environments)
    run_cmd('git config user.name "Parth" || echo "Name already set"')
    run_cmd('git config user.email "parth@example.com" || echo "Email already set"')

    # Commit 1: Initial setup with models and backend (3 to 4 days ago)
    # make_commit(
    #    "initial setup for fastapi backend and models", 
    #    "backend/ All_Models/ extract_106_features.py requirements.txt .gitignore", 
    #    random.uniform(3, 4)
    # )

    # Commit 2: Add frontend basics (1 to 2 days ago)
    make_commit(
        "scaffold nextjs frontend dashboard", 
        "frontend/", 
        random.uniform(1.5, 2.5)
    )

    # Commit 3: Docker and polish (recently)
    make_commit(
        "add dockerfile for render deployment and wire up camera api", 
        "Dockerfile .dockerignore README.md", 
        random.uniform(0.1, 0.8)
    )
    
    print("Organic commit history created successfully!")

if __name__ == "__main__":
    main()
