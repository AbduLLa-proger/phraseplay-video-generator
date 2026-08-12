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

INTRO_AUDIO_DIR = ROOT_DIR / "video" / "public" / "audio" / "intro"
INTRO_TIMINGS_DIR = ROOT_DIR / "video" / "public" / "timings" / "intro"

INTRO_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
INTRO_TIMINGS_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv()

ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"
ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"

elevenlabs_client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)


def get_sentence_word(count):
    if 11 <= count % 100 <= 14:
        return "предложений"

    last_digit = count % 10

    if last_digit == 1:
        return "предложение"

    if 2 <= last_digit <= 4:
        return "предложения"

    return "предложений"


def get_intro_text(count):
    sentence_word = get_sentence_word(count)

    return f"и переведи {count} {sentence_word}."


def generate_audio(count, text):
    mp3_path = INTRO_AUDIO_DIR / f"phrases-{count}.mp3"
    wav_path = INTRO_AUDIO_DIR / f"phrases-{count}.wav"

    audio = elevenlabs_client.text_to_speech.convert(
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

    print(f"Audio generated: {wav_path.name}")

    return wav_path


def generate_timings(count, audio_path):
    output_path = INTRO_TIMINGS_DIR / f"phrases-{count}.json"

    model = whisperx.load_model(
        WHISPER_MODEL,
        DEVICE,
        compute_type=COMPUTE_TYPE,
        language="ru",
    )

    audio = whisperx.load_audio(
        str(audio_path)
    )

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
        output_path,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            words,
            file,
            ensure_ascii=False,
            indent=2,
        )

    print(f"Timings generated: {output_path.name}")


def main():
    if len(sys.argv) < 2:
        print(
            "Usage: python generate_phrase_count_intro.py 5"
        )
        return

    count = int(sys.argv[1])

    if count <= 0:
        raise ValueError(
            "Phrase count must be greater than 0."
        )

    text = get_intro_text(count)

    print(f'Text: "{text}"')

    audio_path = generate_audio(
        count,
        text,
    )

    generate_timings(
        count,
        audio_path,
    )

    print("\nGeneration complete.")


if __name__ == "__main__":
    main()