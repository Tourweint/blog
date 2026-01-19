import os
import sys
import subprocess
import glob
import shutil

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)


def download_and_convert(url, custom_filename=None):
    base_dir = os.getcwd()
    temp_dir = os.path.join(base_dir, "temp_video")
    output_dir = os.path.join(base_dir, ".temp", "audio")

    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    files = glob.glob(os.path.join(temp_dir, "*"))
    for f in files:
        try:
            os.remove(f)
        except Exception as e:
            print(f"Warning: Could not remove old temp file {f}: {e}")

    print(f"Processing URL: {url}")
    print("Step 1: Downloading video...")

    download_success = False
    output_template = os.path.join(temp_dir, "downloaded_video.%(ext)s")

    try:
        subprocess.check_call(
            ["yt-dlp", "-o", output_template, url],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        download_success = True
    except subprocess.CalledProcessError:
        print(
            "Standard download failed. Attempting intelligent extraction (Playwright)..."
        )

        try:
            get_url_script = os.path.join(current_dir, "extract_url.py")
            result = subprocess.check_output(
                [sys.executable, get_url_script, url], text=True
            ).strip()

            if result and result.startswith("http"):
                print(f"Found direct video source. Downloading...")
                try:
                    subprocess.check_call(
                        ["yt-dlp", "-o", output_template, result],
                        stdout=subprocess.DEVNULL,
                    )
                    download_success = True
                except subprocess.CalledProcessError:
                    print("Failed to download the extracted URL.")
        except Exception as e:
            print(f"Extraction failed: {e}")

    if not download_success:
        print("Error: Could not download video. Please check the URL or network.")
        sys.exit(1)

    files = glob.glob(os.path.join(temp_dir, "*"))
    video_extensions = (".mp4", ".flv", ".webm", ".mkv", ".avi", ".mov")
    video_files = [f for f in files if f.lower().endswith(video_extensions)]

    if not video_files:
        print("Error: Download reported success but no file found.")
        sys.exit(1)

    video_file = max(video_files, key=os.path.getsize)

    if custom_filename:
        final_name = custom_filename
        if not final_name.endswith(".mp3"):
            final_name += ".mp3"
    else:
        final_name = "output.mp3"

    output_file = os.path.join(output_dir, final_name)

    print(f"Step 2: Converting to Audio ({final_name})...")

    try:
        subprocess.check_call(
            [
                "ffmpeg",
                "-i",
                video_file,
                "-vn",
                "-acodec",
                "libmp3lame",
                "-q:a",
                "2",
                "-y",
                "-loglevel",
                "error",
                output_file,
            ]
        )
    except subprocess.CalledProcessError:
        print("Error: Conversion failed.")
        sys.exit(1)

    print(f"Success! Audio saved to: {output_file}")

    try:
        os.remove(video_file)
        if not os.listdir(temp_dir):
            os.rmdir(temp_dir)
    except:
        pass


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_impl.py <url> [output_filename]")
        sys.exit(1)

    url_arg = sys.argv[1]
    filename_arg = sys.argv[2] if len(sys.argv) > 2 else None

    download_and_convert(url_arg, filename_arg)
