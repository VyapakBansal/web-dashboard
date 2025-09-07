from flask import Flask, send_from_directory, redirect, request, url_for, session, jsonify
import google.auth.transport.requests
import google_auth_oauthlib.flow
import googleapiclient.discovery
import google.oauth2.credentials
import os
import datetime

app = Flask(__name__)
app.secret_key = 'vyapak_secret_key'

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
CLIENT_SECRETS_FILE = "credentials.json"

@app.route('/')
def home():
    if 'credentials' not in session:
        return redirect(url_for('authorize'))
    return send_from_directory('.', 'index.html')

@app.route('/styles.css')
def serve_css():
    return send_from_directory('.', 'styles.css')

@app.route('/script.js')
def serve_js():
    return send_from_directory('.', 'script.js')

@app.route('/calendar.js')
def serve_calendar_js():
    return send_from_directory('.', 'calendar.js')

@app.route('/authorize')
def authorize():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES
    )
    flow.redirect_uri = url_for('oauth2callback', _external=True)
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    state = session['state']
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        state=state
    )
    flow.redirect_uri = url_for('oauth2callback', _external=True)
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    return redirect(url_for('home'))

@app.route('/events')
def events():
    if 'credentials' not in session:
        return redirect(url_for('authorize'))

    credentials = google.oauth2.credentials.Credentials(
        **session['credentials']
    )

    service = googleapiclient.discovery.build('calendar', 'v3', credentials=credentials)

    now = datetime.datetime.utcnow().isoformat() + 'Z'
    events_result = service.events().list(
        calendarId='primary', timeMin=now,
        maxResults=10, singleEvents=True,
        orderBy='startTime'
    ).execute()
    events = events_result.get('items', [])

    formatted = [{
        'summary': e.get('summary', 'No Title'),
        'start': e['start'].get('dateTime', e['start'].get('date')),
        'end': e['end'].get('dateTime', e['end'].get('date'))
    } for e in events]

    return jsonify(formatted)

if __name__ == '__main__':
    app.run(debug=True)
