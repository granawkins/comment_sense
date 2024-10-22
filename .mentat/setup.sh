# Install Python dependencies
    pip3 install -r app/requirements.txt

    # Install Node.js dependencies
    cd web && npm install && cd ..

    # Build the React app
    cd web && npm run build && cd ..

    # Set up the database (assuming MySQL is installed)
    mysql -u root -p < db/init.sql

    # Set up environment variables (if needed)
    export FLASK_APP=app/api/app.py
    export FLASK_ENV=development