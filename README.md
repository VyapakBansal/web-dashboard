# Personal Web Dashboard

A full-stack **web dashboard** built with **JavaScript, Python, and Flask**. It centralizes your notifications, tracks your current and upcoming series, integrates with **Google Calendar** to show daily events, and offers extra customizable widgets for productivity and personal convenience.

---

## Features

* **Project Notifications:** Aggregates updates from multiple projects in one place.
* **Entertainment Tracker:** Track what you’re currently watching and your to-watch list.
* **Google Calendar Integration:** View today’s events and reminders.
* **Custom Widgets:** Add extra features like weather, quotes, or quick links.

---

## Tech Stack

* **Frontend:** JavaScript, HTML, CSS
* **Backend:** Python, Flask
* **APIs:** Google Calendar API

---

## Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/personal-web-dashboard.git
cd personal-web-dashboard
```

2. **Create a virtual environment**

```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set up Google Calendar API credentials**

* Follow [Google Calendar API Quickstart](https://developers.google.com/calendar/quickstart/python)
* Save your `credentials.json` in the project root.

5. **Run the Flask app**

```bash
flask run
```

6. **Open in browser**
   Go to [http://127.0.0.1:5000](http://127.0.0.1:5000) to access your dashboard.

---

## Usage

* Add your projects to receive notifications.
* Track your currently-watching series and plan upcoming ones.
* Connect your Google account to sync calendar events.
* Customize widgets as needed in the `widgets/` folder.

---

## License

This project is licensed under the MIT License.
