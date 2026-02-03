---
name: video-to-text
description: 从视频URL提取音频并转换为文本。支持抖音等主流视频平台，使用FunASR进行高精度语音识别。
---

# 视频转文本 (Video to Text)

## 快速开始

### 1. 视频转文字 (使用系统 Python)

**不需要虚拟环境**，直接使用系统 Python 运行脚本。提取的文本将保存在 `.temp/text/transcription.txt`。

```bash
python d:\GitWarehouse\web\blog\.opencode\skill\video-to-text\scripts\video_to_text.py "https://v.douyin.com/VIDEO_ID/"
```

### 2. 提取作者信息 (使用 Shared Venv)

提取作者和视频源信息需要使用 **Shared Venv** (`.opencode/shared/scripts/.venv`)。

```bash
d:\GitWarehouse\web\blog\.opencode\shared\scripts\.venv\Scripts\python.exe d:\GitWarehouse\web\blog\.opencode\shared\scripts\douyin_author.py "https://v.douyin.com/VIDEO_ID/"
```

## 工作流程

### 阶段1：下载和提取音频
脚本会自动处理下载。
- **输出**：`d:\GitWarehouse\web\blog\.temp\audio\`

### 阶段2：语音识别
使用 FunASR SenseVoiceSmall 模型。
- **输出**：`d:\GitWarehouse\web\blog\.temp\text\transcription.txt`

## 脚本说明

### `video_to_text.py`
- **路径**: `d:\GitWarehouse\web\blog\.opencode\skill\video-to-text\scripts\video_to_text.py`
- **环境**: **System Python** (确保已安装 `torch`, `funasr`, `ffmpeg` 等)
- **用途**: 下载视频 -> 提取音频 -> 语音转文字

### `douyin_author.py`
- **路径**: `d:\GitWarehouse\web\blog\.opencode\shared\scripts\douyin_author.py`
- **环境**: **Shared Venv** (`.opencode\shared\scripts\.venv`)
- **用途**: 解析抖音分享链接，提取作者名、主页链接、视频原链接 (JSON-LD)

## 注意事项

1. **环境区分**：转文字用系统 Python，提作者用 Shared Venv。
2. **路径问题**：建议始终使用 **绝对路径** 运行脚本，避免工作目录 (`Cwd`) 混淆导致找不到文件。
3. **输出位置**：默认输出在工作根目录下的 `.temp` 文件夹中。
