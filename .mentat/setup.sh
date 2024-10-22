# Install system dependencies
apt update
apt install -y python3.8 python3.8-venv python3.8-dev build-essential

# Create and activate a virtual environment with Python 3.8
python3.8 -m venv venv
. venv/bin/activate

# Upgrade pip and install wheel
pip install --upgrade pip wheel setuptools

# Install Python dependencies without version constraints, one by one
while read requirement; do
    requirement=$(echo $requirement | sed 's/==.*//g')
    pip install $requirement || echo "Failed to install $requirement"
done < app/requirements.txt

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