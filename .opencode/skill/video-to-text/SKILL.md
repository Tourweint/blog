---
name: video-to-text
description: 从视频URL提取音频并转换为文本。支持抖音等主流视频平台，使用FunASR进行高精度语音识别。当用户需要从视频中提取文本内容时使用，包括：(1) 视频转文字，(2) 音频转文字，(3) 从抖音/TikTok等平台视频获取字幕或文本内容
---

# 视频转文本

## 快速开始

从视频URL提取文本：

```bash
python scripts/video_to_text.py "<video_url>"
```

输出文件保存在 `.temp/text/transcription.txt`

## 工作流程

### 阶段1：下载和提取音频

使用 `process_video.py` 下载视频并转换为MP3音频：

- **平台支持**：抖音、YouTube等（通过yt-dlp和Playwright）
- **音频输出**：`.temp/audio/` 目录
- **特殊处理**：抖音视频使用Playwright智能提取真实视频链接

### 阶段2：语音识别

使用 FunASR SenseVoiceSmall 模型进行语音识别：

```python
model = AutoModel(
    model="iic/SenseVoiceSmall",
    trust_remote_code=True,
    device="cuda"  # 或 "cpu"
)

res = model.generate(
    input=audio_file_path,
    language="auto",      # 自动检测语言
    use_itn=True,        # 数字转文字格式化
    batch_size_s=60,
    merge_vad=True,
    merge_thr=1.0
)
```

## 脚本说明

### video_to_text.py

主入口脚本，整合完整的视频转文本流程。

**依赖**：
- `process_video.py` - 视频下载和音频转换
- `funasr` - 语音识别模型

**使用方式**：
```bash
python scripts/video_to_text.py <douyin_url>
```

### process_video.py

视频下载和音频转换工具。

**功能**：
1. 下载视频（yt-dlp标准下载 + Playwright智能提取）
2. 提取音频（ffmpeg转换为MP3）
3. 清理临时文件

**依赖工具**：
- `yt-dlp` - 视频下载
- `ffmpeg` - 音频转换

**接口**：
```python
download_and_convert(url, custom_filename=None)
```

### extract_url.py

使用 Playwright 从视频页面提取真实视频链接。

**用途**：处理 yt-dlp 无法直接下载的平台（如抖音）

**接口**：
```python
get_video_url(url)  # 打印并返回视频真实URL
```

## 环境依赖

**Python包**：
```
funasr
playwright
```

**系统工具**：
- `yt-dlp` - 视频下载
- `ffmpeg` - 音频处理

**硬件**：
- GPU（推荐，使用CUDA加速）
- 或CPU（较慢）

## 模型要求

首次运行会自动下载 FunASR SenseVoiceSmall 模型（约300MB）。如需离线使用，请提前下载模型文件。

## 输出说明

**音频文件**：`.temp/audio/temp_processing_audio.mp3`

**文本文件**：`.temp/text/transcription.txt`

## 注意事项

1. 视频URL必须是可公开访问的链接
2. 大视频文件会消耗较多处理时间
3. CPU模式下语音识别速度较慢
4. 确保网络连接正常（用于下载视频和模型）
