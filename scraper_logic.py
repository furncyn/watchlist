#!/usr/bin/python3

import ast
import click
import re
import requests
import sys
from bs4 import BeautifulSoup
from collections import namedtuple
from decimal import Decimal


watchlist = {}
ItemContent = namedtuple("ItemContent", "item_name brand current_price")


def remove_title_tags(title_name):
    m = re.search("<title>", title_name)
    title_name = title_name[:m.start()] + title_name[m.end():]
    m = re.search("</title>", title_name)
    title_name = title_name[:m.start()] + title_name[m.end():]
    return title_name


def _get_list_titles(url):
    response = requests.get(url)
    response_soup = BeautifulSoup(response.content, 'html.parser')
    title_name = remove_title_tags(str(response_soup.title))
     # For net-a-porter, [Brand, Item_name, Website]
    list_titles = title_name.split(" | ")
    return list_titles

def get_price(url):
    response = requests.get(url)
    response_soup = BeautifulSoup(response.content, 'html.parser')
    for tag in response_soup.find_all("nap-price"):
        price = ast.literal_eval(tag["price"])["amount"]
    return round(Decimal(price/100), 2)


def add_item(url, price=0.00):
    list_titles = _get_list_titles(url)
    brand = list_titles[0]
    item_name = list_titles[1]

    if item_name in watchlist:
        click.echo("You have already added this item to your shopping list.\n", file=sys.stderr)
    else:
        if price == 0:
            price = get_price(url)
        watchlist.update( {url : ItemContent(item_name=item_name, brand=brand, current_price=price)} )
    
    return price

def print_watchlist():
    keys = watchlist.keys()
    for key in keys:
        print(key, " : ", watchlist[key])

def check_price(url):
    if url not in watchlist:
        click.echo("This item is not in your shopping list.\n", file=sys.stderr)
    else:
        new_price = get_price(url)
        if new_price < watchlist[url][2]:
            print("Good news! Your item", watchlist[url][0], "from", url, "has dropped in price from", watchlist[url][2], "\nGet it now at", new_price)
        else:
            # print("Your item", watchlist[url][0], "from", watchlist[url][1], "still has the same price at", watchlist[url][2])
            return watchlist[url][2]

@click.command()
@click.argument("link")
@click.option(
    "--price",
    "-p",
    is_flag=False,
    default=0.00,
    help=(
        "A benchmark price for this product. You will be notified if the price drops below this price."
        "If not specified, the benchmark price is the current price on the website."
    )
)
@click.pass_context
def _input(self, link, price):
    """Input the url of items you want to keep on your watch list. We will notify you when your items' prices have reduced!"""
    if link.find("https://www.net-a-porter.com/") == -1:
        click.echo("Error! We only accept net-a-poter-link at this time.\nPlease input the url from the product page.")
        exit(1)
    add_item(link, price)
    check_price(link)

if __name__ == "__main__":
    _input()
