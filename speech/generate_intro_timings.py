import json
from pathlib import Path

import whisperx


DEVICE = "cpu"
COMPUTE_TYPE = "int8"

AUDIO_PATH = (
    Path(__file__).resolve().parent.parent
    / "video"
    / "public"
    / "audio"
    / "intro-01.wav"
)

OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / "video"
    / "public"
    / "timings"
    / "intro-01.json"
)


def main() -> None:
    if not AUDIO_PATH.exists():
        raise FileNotFoundError(f"Audio file not found: {AUDIO_PATH}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    audio = whisperx.load_audio(str(AUDIO_PATH))

    model = whisperx.load_model(
        "tiny",
        DEVICE,
        compute_type=COMPUTE_TYPE,
    )

    transcription = model.transcribe(
        audio,
        batch_size=1,
        language="ru",
    )

    alignment_model, metadata = whisperx.load_align_model(
        language_code="ru",
        device=DEVICE,
    )

    aligned_result = whisperx.align(
        transcription["segments"],
        alignment_model,
        metadata,
        audio,
        DEVICE,
        return_char_alignments=False,
    )

    timings = []

    for item in aligned_result.get("word_segments", []):
        word = item.get("word")
        start = item.get("start")
        end = item.get("end")

        if not word or start is None or end is None:
            continue

        timings.append(
            {
                "word": word.strip(),
                "start": round(float(start), 3),
                "end": round(float(end), 3),
            }
        )

    if not timings:
        raise RuntimeError("WhisperX did not return intro word timings.")

    with OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(timings, file, ensure_ascii=False, indent=2)

    print(f"Intro timings created: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()