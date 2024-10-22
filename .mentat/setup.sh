# Install system dependencies
apt update
apt install -y python3-venv python3-dev build-essential

# Create and activate a virtual environment
python3 -m venv venv
. venv/bin/activate

# Upgrade pip and install wheel
pip install --upgrade pip wheel setuptools

# Install essential Python packages
pip install Flask
pip install Flask-SocketIO
pip install mysql-connector-python
pip install spacy

# Download spaCy model
python -m spacy download en_core_web_sm

# Install Node.js dependencies
cd web
npm install
npm run build
cd ..

# Set up the database (assuming MySQL is already installed)
if command -v mysql &> /dev/null; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS db;"
else
    echo "MySQL is not installed. Please install MySQL and run: CREATE DATABASE IF NOT EXISTS db;"
fi