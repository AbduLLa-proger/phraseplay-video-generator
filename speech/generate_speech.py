from pathlib import Path

import soundfile as sf
from kokoro import KPipeline


TEXT = "She asked me not to tell anyone."

OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / "video"
    / "public"
    / "audio"
    / "answer-01.wav"
)


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    pipeline = KPipeline(lang_code="a")

    generator = pipeline(
        TEXT,
        voice="af_heart",
        speed=0.8,
        split_pattern=r"\n+",
    )

    audio_parts = []

    for _, _, audio in generator:
        audio_parts.append(audio)

    if not audio_parts:
        raise RuntimeError("Kokoro did not generate any audio.")

    if len(audio_parts) > 1:
        import numpy as np

        final_audio = np.concatenate(audio_parts)
    else:
        final_audio = audio_parts[0]

    sf.write(OUTPUT_PATH, final_audio, 24000)

    print(f"Audio created: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()