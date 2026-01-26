# parser.py
import json
from dataclasses import dataclass
from bs4 import BeautifulSoup


@dataclass
class Author:
    name: str
    url: str
    source: str


def extract_author_from_html(html: str) -> Author | None:
    soup = BeautifulSoup(html, "html.parser")

    # ========= Level 1: JSON-LD =========
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
        except Exception:
            continue

        if isinstance(data, dict) and data.get("@type") == "BreadcrumbList":
            for item in data.get("itemListElement", []):
                if item.get("position") == 2:
                    return Author(
                        name=item.get("name"),
                        url=item.get("item"),
                        source="json-ld",
                    )

    # ========= Level 2: DOM 语义 =========
    links = soup.select('a[href^="/user/"]')
    if links:
        a = links[0]
        return Author(
            name=a.get_text(strip=True),
            url="https://www.douyin.com" + a.get("href"),
            source="dom-url",
        )

    return None
