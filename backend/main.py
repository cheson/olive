from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import asyncio
import json
import httpx 

app = FastAPI(title="Olive API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Dog(BaseModel):
    breed: str
    image: str | None = None

API_URL = "https://interview-api-olive.vercel.app/api/dogs?page={}"
DOGS_STORAGE_FILENAME = "dogs.json"

# Using a global list to mimic an in-memory cache
ALL_DOGS = []

async def get_all_dogs():
    global ALL_DOGS
    dogs = []
    breeds_seen = set()
    page = 1

    async with httpx.AsyncClient(timeout=60.0) as client:
        while True:
            print("fetching page ", page)
            data = []
            retry_count = 0
            max_retry_count = 3
            shouldSkip = False
            while retry_count < max_retry_count:
                try:
                    response = await client.get(API_URL.format(page))
                    data = response.json()
                    if 'error' in data:
                        raise Exception('API response error')
                    else:
                        break
                except Exception as e:
                    retry_count += 1
                    if retry_count < max_retry_count:
                        print(f"Retry error on page {page}: {e}")
                        # retry max_retry_count times with simple backoff
                        await asyncio.sleep(retry_count * 2)
                    else:
                        shouldSkip = True
                        print(f"Retries exhausted for page {page}, skipping.")
            
            if not shouldSkip: 
                # reached end of api
                if len(data) == 0:
                    break

                # filter response for duplicate dogs
                new_dogs = [dog for dog in data if dog['breed'] not in breeds_seen]
                # placeholder for other error checking or bad data
                # dogs = filter_bad_dogs(new_dogs)

                dogs.extend(new_dogs)
                new_breeds = [dog['breed'] for dog in data]
                breeds_seen = breeds_seen.union(new_breeds)

            page += 1

    print(f"Fetched {len(dogs)} dogs")
    # persist to "disk" aka file
    with open(DOGS_STORAGE_FILENAME, "w") as f:
        json.dump(dogs, f)

    # update our in-memory dog "cache"
    print("Updating in-memory cache")
    ALL_DOGS = dogs


async def periodic_job():
    while True:
        print("⏰ Running periodic task to refresh dog list from 3rd party API...")
        await get_all_dogs()
        await asyncio.sleep(600)  # wait 10 minutes before next run


@app.on_event("startup")
async def on_startup():
    print("🚀 Server starting up...")

    global ALL_DOGS
    try:
        with open(DOGS_STORAGE_FILENAME, "r") as f:
            print("Loaded dogs data from disk.")
            ALL_DOGS = json.load(f)
    except FileNotFoundError:
        print("No dogs data file found.")

    asyncio.create_task(periodic_job())


@app.on_event("shutdown")
async def on_shutdown():
    print("🛑 Server shutting down...")


@app.get("/")
async def root():
    return {"message": "Welcome to Olive API"}


@app.get("/dogs")
async def get_items(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
):
    print(request.url)
    # Calculate pagination
    start = (page - 1) * page_size
    end = start + page_size

    # Get paginated items
    paginated_items = ALL_DOGS[start:end]

    # Calculate total pages
    total_items = len(ALL_DOGS)
    # Alternate logic
    # total_pages = total_items // page_size
    # if total_items % page_size != 0:
    #     total_pages += 1
    total_pages = (total_items + page_size - 1) // page_size

    response = {
        "items": paginated_items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }

    return response 