#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting a comprehensive installation script."

# 1. Update package list
echo "Updating system package list..."
sudo apt update -y

# 2. Install Git
echo "Installing Git..."
sudo apt install git -y
echo "Git installation complete."

# 3. Install NVM (Node Version Manager)
echo "Installing NVM..."
# This is a safe way to install NVM. The script is piped to bash.
# This command needs to be run by the user. Let's install for the root user.
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Source NVM in the current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "NVM installation complete. Proceeding to install Node.js."

# 4. Install Node.js LTS version using NVM
echo "Installing Node.js LTS version..."
nvm install --lts
echo "Node.js installation complete. Node version:"
node -v

# 5. Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y
echo "PostgreSQL installation complete."

echo "All installations are complete."

echo "You will need to run the following commands manually to complete the setup:"
echo "1. Run 'sudo -i -u postgres' to switch to the postgres user."
echo "2. Run 'psql' to enter the PostgreSQL shell."
echo "3. Change the postgres password and create your application user."