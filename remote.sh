#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  source .env
fi

# Function to add SSH identity
add_ssh_identity() {
  if [ -n "$SSH_KEY_PATH" ]; then
    ssh-add "$SSH_KEY_PATH"
  else
    echo "SSH_KEY_PATH is not set in .env file"
  fi
}

# Function to remove SSH identity
remove_ssh_identity() {
  if [ -n "$SSH_KEY_PATH" ]; then
    ssh-add -d "$SSH_KEY_PATH"
  else
    echo "SSH_KEY_PATH is not set in .env file"
  fi
}

# Function to perform git command with optional extra flags
perform_git_command() {
  git_command="$1"
  shift
  add_ssh_identity
  git "$git_command" "$@"
  remove_ssh_identity
}

# Main function
main() {
  perform_git_command "$@"
}

# Execute the main function with arguments passed to the script
main "$@"
