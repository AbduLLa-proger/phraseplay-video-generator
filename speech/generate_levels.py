import json
import os
import subprocess
import sys
from pathlib import Path

import whisperx
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs


DEVICE = "cpu"
COMPUTE_TYPE = "int8"
WHISPER_MODEL = "tiny"

ROOT_DIR = Path(__file__).resolve().parent.parent

AUDIO_DIR = ROOT_DIR / "video" / "public" / "audio"
TIMINGS_DIR = ROOT_DIR / "video" / "public" / "timings"

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TIMINGS_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv()

ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"
ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"

LEVELS = {
    "A1": "Проверь свой английский: эй уан",
    "A2": "Проверь свой английский: эй ту",
    "B1": "Проверь свой английский: би уан",
    "B2": "Проверь свой английский: би. ту",
    "C1": "Проверь свой английский: си уан",
    "C2": "Проверь свой английский. си, ту",
}

client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)


def generate_audio(level, text):
    level_name = level.lower()

    mp3_path = AUDIO_DIR / f"level-{level_name}.mp3"
    wav_path = AUDIO_DIR / f"level-{level_name}.wav"

    audio = client.text_to_speech.convert(
        voice_id=ELEVENLABS_VOICE_ID,
        text=text,
        model_id=ELEVENLABS_MODEL_ID,
        output_format="mp3_44100_128",
    )

    with open(mp3_path, "wb") as file:
        for chunk in audio:
            file.write(chunk)

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(mp3_path),
            str(wav_path),
        ],
        check=True,
    )

    mp3_path.unlink()

    print(f"{level}: audio generated")

    return wav_path


def generate_timings(level, audio_path):
    level_name = level.lower()
    output_path = TIMINGS_DIR / f"level-{level_name}.json"

    model = whisperx.load_model(
        WHISPER_MODEL,
        DEVICE,
        compute_type=COMPUTE_TYPE,
        language="ru",
    )

    audio = whisperx.load_audio(str(audio_path))

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

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(
            words,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print(f"{level}: timings generated")


def generate_level(level):
    normalized_level = level.upper()

    if normalized_level not in LEVELS:
        raise ValueError(
            "Invalid level. Use A1, A2, B1, B2, C1 or C2."
        )

    text = LEVELS[normalized_level]

    audio_path = generate_audio(
        normalized_level,
        text,
    )

    generate_timings(
        normalized_level,
        audio_path,
    )

    print(f"\n{normalized_level} generation complete.")


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_levels.py B2")
        return

    level = sys.argv[1]

    generate_level(level)


if __name__ == "__main__":
    main()