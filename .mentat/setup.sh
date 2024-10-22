# Install python3-venv package
apt update
apt install -y python3-venv

# Check Python version and create virtual environment
PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2 | cut -d '.' -f 1,2)
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
if command -v mysql &> /dev/null; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS db;"
else
    echo "MySQL is not installed. Please install MySQL and run: CREATE DATABASE IF NOT EXISTS db;"
fi