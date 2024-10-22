# Ensure we're using Python 3.8
pyenv install -s 3.8.12
pyenv global 3.8.12

# Create and activate a virtual environment
python3 -m venv venv
. venv/bin/activate

# Upgrade pip and install wheel
pip install --upgrade pip wheel

# Install Python dependencies without version constraints
sed 's/==.*//g' app/requirements.txt | pip install -r /dev/stdin

# Install Node.js dependencies
cd web
npm install
npm run build
cd ..

# Set up the database (assuming MySQL is already installed)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS db;"