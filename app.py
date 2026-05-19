import os
from flask import Flask, render_template
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('base.html',
        api_key=os.environ.get('FIREBASE_API_KEY'),
        auth_domain=os.environ.get('FIREBASE_AUTH_DOMAIN'),
        project_id=os.environ.get('FIREBASE_PROJECT_ID'),
        storage_bucket=os.environ.get('FIREBASE_STORAGE_BUCKET'),
        messaging_sender_id=os.environ.get('FIREBASE_MESSAGING_SENDER_ID'),
        app_id=os.environ.get('FIREBASE_APP_ID')
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))