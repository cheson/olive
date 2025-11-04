import requests

API_URL = "https://interview-api-olive.vercel.app/api/dogs?page={}"

def get_dogs(page):
    response = requests.get(API_URL.format(page))
    return response.json()

def get_all_dogs():
    dogs = []
    page = 1
    while True:
        response = get_dogs(page)
        dogs.extend(response['dogs'])
        if response['next'] is None:
            break
        page += 1

def get_dogs_repeat(page):
    results = set()
    for i in range(20):
        print(i)
        response = get_dogs(page)
        results.add(str(response))
    print(results)
    print(len(results))

# print(get_dogs_repeat(5))
print(get_dogs(-5))