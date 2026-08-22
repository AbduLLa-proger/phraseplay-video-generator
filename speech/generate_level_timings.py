import json
import sys
from functools import lru_cache
from pathlib import Path

import whisperx


DEVICE = "cpu"

ROOT_DIR = Path(__file__).resolve().parent.parent

LEVEL_AUDIO_DIR = (
    ROOT_DIR
    / "video"
    / "public"
    / "audio"
    / "level"
)

LEVEL_TIMINGS_DIR = (
    ROOT_DIR
    / "video"
    / "public"
    / "timings"
    / "level"
)

LEVEL_TIMINGS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

LEVEL_TEXTS = {
    "A1": "Проверь свой английский: A1",
    "A2": "Проверь свой английский: A2",
    "B1": "Проверь свой английский: B1",
    "B2": "Проверь свой английский: B2",
    "C1": "Проверь свой английский: C1",
    "C2": "Проверь свой английский: C2",
}


@lru_cache(maxsize=1)
def get_align_model():
    return whisperx.load_align_model(
        language_code="ru",
        device=DEVICE,
    )


def generate_level_timings(level):
    normalized_level = level.upper()

    if normalized_level not in LEVEL_TEXTS:
        raise ValueError(
            "Use A1, A2, B1, B2, C1 or C2."
        )

    audio_path = (
        LEVEL_AUDIO_DIR
        / f"level-{normalized_level.lower()}.wav"
    )

    output_path = (
        LEVEL_TIMINGS_DIR
        / f"level-{normalized_level.lower()}.json"
    )

    if not audio_path.exists():
        raise FileNotFoundError(
            f"Audio not found: {audio_path}"
        )

    text = LEVEL_TEXTS[normalized_level]

    audio = whisperx.load_audio(
        str(audio_path)
    )

    duration = len(audio) / 16000

    segments = [
        {
            "text": text,
            "start": 0.0,
            "end": duration,
        }
    ]

    align_model, metadata = get_align_model()

    result = whisperx.align(
        segments,
        align_model,
        metadata,
        audio,
        DEVICE,
        return_char_alignments=False,
    )

    words = []

    for segment in result["segments"]:
        for word in segment.get("words", []):
            if "start" not in word or "end" not in word:
                continue

            words.append(
                {
                    "word": word["word"].strip(),
                    "start": round(
                        word["start"],
                        3,
                    ),
                    "end": round(
                        word["end"],
                        3,
                    ),
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

    print(
        f"Generated: {output_path}"
    )


def main():
    if len(sys.argv) < 2:
        print(
            "Usage: python generate_level_timings.py C1"
        )
        return

    generate_level_timings(
        sys.argv[1]
    )


if __name__ == "__main__":
    main()