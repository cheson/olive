# Olive - React + FastAPI Full-Stack Application

A modern full-stack web application built with React (frontend) and FastAPI (backend).

## Notes for Olive
```
Overview
    - Explored the 3rd party API with some test calls
    - Decided to cache API results and maintain a local cache to serve the frontend
    - Async cron job refreshes the local cache
    - Retries and backoff built into the handler accessing the 3rd party API
    - Page+size based pagination scheme used

Error handling w/ 3rd party API
    - Errors seen:
        - Timeouts / ~10 second delays
        - API errors
            - Arbitrary, otherwise we could handle more specifically to the error
        - Breed bad data: "Australian Cattle Dog (Heelerhttps://upload.wikimedia.org/wikipedia/commons/c/cc/ACD-blue-spud.jpgustralian Kelpie"
            - Left this as is since it came from the API
        - Image URLs that don't work
            - Left the blank placeholder image on the UI

Caching API results locally
    - Lazily
        - Call 3rd party API when needed and add results to cache.
        - Decided against this
            - Introduces unknown latency
            - Without ability to know 3rd party API total size, we wouldn't be able to fulfill: "All pages should be available for navigation"
    - Ahead of time
        - Async cron job every 10 min
    - Made durable by writing "cache" to "disk", useful to avoid slow starts.
    - Known to be a naive solution, wouldn't generally download all of 3rd party API but it's also a contrived API

Pagination
    - Hard coded 15, but easily made dynamic on FE
    - 3rd party API just takes page, no size. It returns a fixed size.

3rd party API quirks
    - 1 based page, 0 returns error and -1 is actually valid. Seems like behind the scene using python list[-1] and showing breeds list in reverse.
    - Assuming based on the alphabetical data that returning [] is the end of the data, but we don't actually know the end condition of the 3rd party API
        - It's possible that querying with page 10000 could return results. 

Claude Code usage
    - Used the following 4 prompts:
        - "create a react frontend and fastapi backend"
        - "add page based pagination on the frontend with some dummy data"
        - "have the pagination blocks display a breed string and image"
        - "add pagination UI to enter an arbitrary page num"
```

## Project Structure

```
olive/
├── backend/           # FastAPI backend
│   ├── main.py       # Main application file
│   ├── requirements.txt
│   └── .env.example
├── frontend/         # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The React app will be available at `http://localhost:5173`

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

### Backend
For production, use a production ASGI server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## License

MIT
