import sys
from scraper import add_item, check_price

link = sys.argv[1]

if link.find("https://www.net-a-porter.com/") == -1:
    print("Error! We only accept net-a-poter-link at this time.\nPlease input the url from the product page.")

add_item(link)
price = check_price(link)
result = {
    "url": link,
    "price": price
}
print(result)