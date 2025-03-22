import requests
import time
import sys

class OIDCChecker:

    def __init__(self, url, max_time=10):
        self.url = url
        self.max_time = max_time

    def check(self):
        start_time = time.time()

        while True:
            try:
                response = requests.get(self.url, timeout=5)
                if response.status_code == 200:
                    return
            except requests.exceptions.RequestException as e:
                continue
            
            if time.time() - start_time > self.max_time:
                print(f"Время ожидания {self.max_time} секунд истекло.")
                break

            time.sleep(1)

        sys.exit(1)
