from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.goto("http://localhost:4321/", wait_until="networkidle")
    # 滚动到最底部
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    # 截取footer区域
    footer = page.locator("footer.site-footer")
    footer.screenshot(path="footer_preview.png")
    browser.close()
    print("截图完成：footer_preview.png")
