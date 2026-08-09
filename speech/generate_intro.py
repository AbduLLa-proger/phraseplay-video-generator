import json
import os
import subprocess
from pathlib import Path

import whisperx
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs


DEVICE = "cpu"
COMPUTE_TYPE = "int8"
WHISPER_MODEL = "tiny"

INTRO_TEXT = "Переведите предложение."

ROOT_DIR = Path(__file__).resolve().parent.parent

AUDIO_DIR = ROOT_DIR / "video" / "public" / "audio"
TIMINGS_DIR = ROOT_DIR / "video" / "public" / "timings"

INTRO_MP3_PATH = AUDIO_DIR / "intro-01.mp3"
INTRO_WAV_PATH = AUDIO_DIR / "intro-01.wav"
INTRO_TIMINGS_PATH = TIMINGS_DIR / "intro-01.json"

load_dotenv()

ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"
ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TIMINGS_DIR.mkdir(parents=True, exist_ok=True)

elevenlabs_client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)


def generate_intro_audio():
    audio = elevenlabs_client.text_to_speech.convert(
        voice_id=ELEVENLABS_VOICE_ID,
        text=INTRO_TEXT,
        model_id=ELEVENLABS_MODEL_ID,
        output_format="mp3_44100_128",
    )

    with open(INTRO_MP3_PATH, "wb") as file:
        for chunk in audio:
            file.write(chunk)

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(INTRO_MP3_PATH),
            str(INTRO_WAV_PATH),
        ],
        check=True,
    )

    INTRO_MP3_PATH.unlink()

    print(f"Intro audio: {INTRO_WAV_PATH}")


def generate_intro_timings():
    model = whisperx.load_model(
        WHISPER_MODEL,
        DEVICE,
        compute_type=COMPUTE_TYPE,
        language="ru",
    )

    audio = whisperx.load_audio(str(INTRO_WAV_PATH))

    result = model.transcribe(
        audio,
        batch_size=4,
    )

    align_model, metadata = whisperx.load_align_model(
        language_code="ru",
        device=DEVICE,
    )

    aligned_result = whisperx.align(
        result["segments"],
        align_model,
        metadata,
        audio,
        DEVICE,
        return_char_alignments=False,
    )

    words = []

    for segment in aligned_result["segments"]:
        for word in segment.get("words", []):
            if "start" not in word or "end" not in word:
                continue

            words.append(
                {
                    "word": word["word"].strip(),
                    "start": round(word["start"], 3),
                    "end": round(word["end"], 3),
                }
            )

    with open(
        INTRO_TIMINGS_PATH,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            words,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print(f"Intro timings: {INTRO_TIMINGS_PATH}")


def main():
    generate_intro_audio()
    generate_intro_timings()

    print("\nIntro generation complete.")


if __name__ == "__main__":
    main()