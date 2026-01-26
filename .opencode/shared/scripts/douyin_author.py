# douyin_author.py
import sys
from fetch import fetch_html
from parser import extract_author_from_html


def main():
    if len(sys.argv) != 2:
        print("用法：python douyin_author.py <抖音视频链接>")
        sys.exit(1)

    url = sys.argv[1]

    print(f"🔍 正在获取页面：{url}")
    html = fetch_html(url, headless=True)

    author = extract_author_from_html(html)

    if not author:
        print("❌ 未能提取作者信息")
        sys.exit(2)

    print("\n✅ 作者信息提取成功：")
    print(f"来源    : {author.source}")
    print(f"作者名  : {author.name}")
    print(f"主页链接: {author.url}")


if __name__ == "__main__":
    main()
