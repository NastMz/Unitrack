from flask_cors import CORS
from flask_migrate import Migrate

from aplication import create_app, db

app = create_app()

CORS(app)

migrate = Migrate(app, db)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
