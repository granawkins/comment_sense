# Format and lint JavaScript/React code
    cd web && npm run lint -- --fix && cd ..

    # Run React tests
    cd web && npm test && cd ..

    # Run Python linter (assuming flake8 is installed)
    flake8 app --max-line-length=100 --extend-ignore=E203

    # Run Python tests (assuming pytest is installed)
    pytest app

    # Check database migrations (if using a migration tool like Alembic)
    alembic check