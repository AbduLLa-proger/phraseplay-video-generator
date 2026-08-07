import json
from pathlib import Path
from kokoro import KPipeline

import soundfile as sf
import torch
import whisperx


DEVICE = "cpu"
COMPUTE_TYPE = "int8"
WHISPER_MODEL = "tiny"

ROOT_DIR = Path(__file__).resolve().parent.parent


PHRASES_PATH = ROOT_DIR / "content" / "phrases.json"
AUDIO_DIR = ROOT_DIR / "video" / "public" / "audio"
TIMINGS_DIR = ROOT_DIR / "video" / "public" / "timings"
SCENES_PATH = ROOT_DIR / "video" / "public" / "data" / "scenes.json"

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TIMINGS_DIR.mkdir(parents=True, exist_ok=True)
SCENES_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

def load_timings(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)

def generate_word_timings(audio_path, language, output_path):
    model = whisperx.load_model(
        WHISPER_MODEL,
        DEVICE,
        compute_type=COMPUTE_TYPE,
        language=language,
    )

    audio = whisperx.load_audio(str(audio_path))

    result = model.transcribe(
        audio,
        batch_size=4,
    )

    align_model, metadata = whisperx.load_align_model(
        language_code=language,
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

    print(f"Timings: {output_path.name}")

def load_english_pipeline():
    return KPipeline(lang_code="a")

def generate_english_audio(pipeline, text, phrase_id):
    output_path = AUDIO_DIR / f"answer-{phrase_id}.wav"

    generator = pipeline(
        text,
        voice="af_heart",
        speed=0.8,
    )

    for _, _, audio in generator:
        sf.write(
            output_path,
            audio,
            24000,
        )
        break

    print(f"EN audio: {output_path.name}")

def load_phrases():
    with open(PHRASES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def load_russian_model():
    model, _ = torch.hub.load(
        repo_or_dir="snakers4/silero-models",
        model="silero_tts",
        language="ru",
        speaker="v4_ru",
    )

    return model


def generate_russian_audio(model, text, phrase_id):
    output_path = AUDIO_DIR / f"question-{phrase_id}.wav"

    audio = model.apply_tts(
        text=text,
        speaker="xenia",
        sample_rate=48000,
    )

    sf.write(
        output_path,
        audio.numpy(),
        48000,
    )

    print(f"RU audio: {output_path.name}")


def main():
    phrases = load_phrases()

    russian_model = load_russian_model()
    english_pipeline = load_english_pipeline()

    scenes = []

    for phrase in phrases:
        phrase_id = phrase["id"]
        russian = phrase["russian"]
        english = phrase["english"]

        print(f"\n[{phrase_id}]")

        generate_russian_audio(
            russian_model,
            russian,
            phrase_id,
        )

        generate_english_audio(
            english_pipeline,
            english,
            phrase_id,
        )

        russian_audio_path = AUDIO_DIR / f"question-{phrase_id}.wav"
        english_audio_path = AUDIO_DIR / f"answer-{phrase_id}.wav"

        russian_timings_path = TIMINGS_DIR / f"question-{phrase_id}.json"
        english_timings_path = TIMINGS_DIR / f"answer-{phrase_id}.json"

        generate_word_timings(
            russian_audio_path,
            "ru",
            russian_timings_path,
        )

        generate_word_timings(
            english_audio_path,
            "en",
            english_timings_path,
        )

        russian_timings = load_timings(
            russian_timings_path
        )

        english_timings = load_timings(
            english_timings_path
        )

        scenes.append(
            {
                "id": phrase_id,
                "russianWords": [
                    item["word"]
                    for item in russian_timings
                ],
                "englishWords": [
                    item["word"]
                    for item in english_timings
                ],
                "russianWordTimings": russian_timings,
                "englishWordTimings": english_timings,
                "russianAudio": f"audio/question-{phrase_id}.wav",
                "englishAudio": f"audio/answer-{phrase_id}.wav",
            }
        )

    with open( SCENES_PATH, "w", encoding="utf-8") as file: json.dump(scenes,file,ensure_ascii=False,indent=2)

    print(f"\nScenes: {SCENES_PATH.name}")


if __name__ == "__main__":
    main()