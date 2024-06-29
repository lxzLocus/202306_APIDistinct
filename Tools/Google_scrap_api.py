import time
import requests
import os
import shutil
import json

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

#File Save Path
save_path = 'C:/Users/unico/Desktop'

#Chrome Profile Path
profile_path = 'C:/Users/unico/AppData/Local/Google/Chrome Beta/User Data'
profile_name = 'Default'

#Webdriver Options
options = webdriver.chrome.options.Options()
#options.add_argument('--user-data-dir=' + profile_path)
#options.add_argument('--profile-directory=' + profile_name)
#option.add_argument('--headless')
options.add_argument('--ignore-certificate-errors')
options.add_experimental_option("detach", True)
options.add_experimental_option('excludeSwitches', ['enable-logging'])
options.add_experimental_option('prefs', {
    'download.prompt_for_download': False,
})

#Chromeの場所を指定
options.binary_location = 'C:/Program Files/Google/Chrome Beta/Application/chrome.exe'

#ChromeDriverの場所を指定
chrome_service = ChromeService(executable_path='D:/Files/driver/chromedriver-win64/chromedriver.exe')

#fetch driver setting
driver = webdriver.Chrome(service=chrome_service, options=options)


#Write File
output_file = 'API.json'

#Open URL
URL = 'https://developers.google.com/apps-script/reference/spreadsheet/sheet?hl=ja'
driver.get(URL)
time.sleep(4)


API = []

cnt_elm = len(driver.find_elements(By.CLASS_NAME, "function doc "))


for i in range(3, 147):
    # XPathで要素を取得
    element = driver.find_elements(By.XPATH, f"/html/body/section/section/main/devsite-content/article/div[3]/div[{i}]/h3")


    data_text = element.get_attribute("data-text")

    print(data_text)


# JSONファイルに書き込む
#with open(save_path + '/' + output_file, "w") as json_file:
#    json.dump(data, json_file, indent=4)

driver.close()
