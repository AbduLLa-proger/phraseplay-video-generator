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
    / "answer-01.wav"
)

OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / "video"
    / "public"
    / "timings"
    / "answer-01.json"
)


def main() -> None:
    if not AUDIO_PATH.exists():
        raise FileNotFoundError(f"Audio file not found: {AUDIO_PATH}")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    print("Loading audio...")
    audio = whisperx.load_audio(str(AUDIO_PATH))

    print("Loading Whisper model...")
    model = whisperx.load_model(
        "tiny.en",
        DEVICE,
        compute_type=COMPUTE_TYPE,
    )

    print("Transcribing...")
    transcription = model.transcribe(
        audio,
        batch_size=1,
        language="en",
    )

    print("Loading alignment model...")
    alignment_model, metadata = whisperx.load_align_model(
        language_code="en",
        device=DEVICE,
    )

    print("Aligning words...")
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
        raise RuntimeError("WhisperX did not return word timings.")

    with OUTPUT_PATH.open("w", encoding="utf-8") as file:
        json.dump(timings, file, ensure_ascii=False, indent=2)

    print(f"Timings created: {OUTPUT_PATH}")

    for timing in timings:
        print(
            f'{timing["word"]}: '
            f'{timing["start"]:.3f} - {timing["end"]:.3f}'
        )


if __name__ == "__main__":
    main()