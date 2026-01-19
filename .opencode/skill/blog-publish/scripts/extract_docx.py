import sys
import os
import json
import argparse
from docx import Document


def extract_docx(file_path):
    doc = Document(file_path)
    data = []
    for p in doc.paragraphs:
        if p.text.strip():
            data.append(
                {"text": p.text, "style": p.style.name, "alignment": str(p.alignment)}
            )
    return data


def extract_txt(file_path):
    data = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            for line in lines:
                if line.strip():
                    data.append(
                        {"text": line.strip(), "style": "Normal", "alignment": "LEFT"}
                    )
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="gbk", errors="ignore") as f:
            lines = f.readlines()
            for line in lines:
                if line.strip():
                    data.append(
                        {"text": line.strip(), "style": "Normal", "alignment": "LEFT"}
                    )
    return data


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    parser = argparse.ArgumentParser(
        description="Extract content from docx or txt file for blog publishing."
    )
    parser.add_argument("file_path", help="Path to the file (.docx or .txt)")
    args = parser.parse_args()

    file_path = args.file_path
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    try:
        if ext == ".docx":
            content = extract_docx(file_path)
        elif ext == ".txt":
            content = extract_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        print(json.dumps(content, ensure_ascii=False))
    except Exception as e:
        error_msg = {"error": str(e)}
        print(json.dumps(error_msg, ensure_ascii=False))
        sys.exit(1)


if __name__ == "__main__":
    main()
