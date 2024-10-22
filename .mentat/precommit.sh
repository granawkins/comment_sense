# Activate the virtual environment
. venv/bin/activate

# Run Python linter (assuming flake8 is used)
pip install flake8
flake8 app/

# Run Python tests (assuming pytest is used)
pip install pytest
pytest app/

# Run JavaScript linter and tests
cd web
npm run lint -- --fix
npm test
cd ..