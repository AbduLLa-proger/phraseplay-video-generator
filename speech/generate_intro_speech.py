from pathlib import Path

import torch


TEXT = "Переведите предложение."

OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / "video"
    / "public"
    / "audio"
    / "intro-01.wav"
)


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    model, _ = torch.hub.load(
        repo_or_dir="snakers4/silero-models",
        model="silero_tts",
        language="ru",
        speaker="v4_ru",
    )

    model.save_wav(
        text=TEXT,
        speaker="xenia",
        sample_rate=48000,
        audio_path=str(OUTPUT_PATH),
    )

    print(f"Intro audio created: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()