# fetch.py
from playwright.sync_api import sync_playwright


def fetch_html(url: str, headless: bool = True) -> str:
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=headless,
        )

        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
        )

        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded")

        # 等 React 挂载
        page.wait_for_selector("#root")
        page.wait_for_timeout(3000)

        html = page.evaluate("document.documentElement.outerHTML")

        browser.close()
        return html
