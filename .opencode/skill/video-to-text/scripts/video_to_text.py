import os
import sys
import shutil
import glob
from funasr import AutoModel

from process_video import download_and_convert


def main(url):
    print(f"Starting Video-to-Text Workflow for: {url}")

    print("\n--- Phase 1: Downloading & Extracting Audio ---")

    base_dir = os.getcwd()
    audio_output_dir = os.path.join(base_dir, ".temp", "audio")
    text_output_dir = os.path.join(base_dir, ".temp", "text")

    if not os.path.exists(text_output_dir):
        os.makedirs(text_output_dir)

    filename = "temp_processing_audio"

    try:
        download_and_convert(url, filename)
    except SystemExit:
        print("Audio extraction failed.")
        return
    except Exception as e:
        print(f"Audio extraction error: {e}")
        return

    audio_file_path = os.path.join(audio_output_dir, f"{filename}.mp3")

    if not os.path.exists(audio_file_path):
        print(f"Error: Expected audio file not found at {audio_file_path}")
        return

    print(f"Audio ready: {audio_file_path}")

    print("\n--- Phase 2: Transcribing Audio (FunASR) ---")

    try:
        model_dir = "iic/SenseVoiceSmall"

        print(f"Loading model: {model_dir}...")
        model = AutoModel(
            model=model_dir,
            trust_remote_code=True,
            remote_code="./model.py",
            vad_model="fsmn-vad",
            vad_kwargs={"max_single_segment_time": 30000},
            device="cuda",
        )

        print("Transcribing...")
        res = model.generate(
            input=audio_file_path,
            cache={},
            language="auto",
            use_itn=True,
            batch_size_s=60,
            merge_vad=True,
            merge_thr=1.0,
        )

        text = ""
        if isinstance(res, list):
            text = res[0]["text"]
        else:
            text = res["text"]

        print("\nTranscription Result:")
        print("-" * 50)
        print(text)
        print("-" * 50)

        output_txt_path = os.path.join(text_output_dir, "transcription.txt")
        with open(output_txt_path, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"\nDone! Transcription saved to: {output_txt_path}")

    except Exception as e:
        print(f"ASR Error: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python video_to_text.py <douyin_url>")
        sys.exit(1)

    target_url = sys.argv[1]
    main(target_url)
