import sys
from playwright.sync_api import sync_playwright


def get_video_url(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/16.0 Chrome/92.0.4515.166 Mobile Safari/537.36",
            viewport={"width": 375, "height": 812},
        )
        page = context.new_page()

        try:
            page.goto(url, timeout=60000)

            try:
                page.wait_for_selector("video", timeout=30000)
            except:
                pass

            video_element = page.query_selector("video")
            if video_element:
                src = video_element.evaluate("el => el.src")
                if src:
                    print(src)
                    return

        except Exception as e:
            pass
        finally:
            browser.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    get_video_url(sys.argv[1])
