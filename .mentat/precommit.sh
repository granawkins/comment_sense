# Activate the virtual environment
. venv/bin/activate

# Run Python linter
pip install flake8
flake8 app/

# Run Python tests
pip install pytest
pytest app/

# Run JavaScript linter and tests
cd web
npm run lint -- --fix
npm test
cd ..