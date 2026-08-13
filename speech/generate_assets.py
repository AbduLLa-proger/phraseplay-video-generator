import json
import os
import subprocess
from dotenv import load_dotenv
from pathlib import Path
from functools import lru_cache

import soundfile as sf
import whisperx
from elevenlabs.client import ElevenLabs
from kokoro import KPipeline

DEVICE = "cpu"
MAX_WORDS = 15

ROOT_DIR = Path(__file__).resolve().parent.parent

PHRASES_PATH = ROOT_DIR / "content" / "phrases.json"
AUDIO_DIR = ROOT_DIR / "video" / "public" / "audio"
TIMINGS_DIR = ROOT_DIR / "video" / "public" / "timings"

QUESTION_AUDIO_DIR = AUDIO_DIR / "question"
ANSWER_AUDIO_DIR = AUDIO_DIR / "answer"
LEVEL_AUDIO_DIR = AUDIO_DIR / "level"
INTRO_AUDIO_DIR = AUDIO_DIR / "intro"

QUESTION_TIMINGS_DIR = TIMINGS_DIR / "question"
ANSWER_TIMINGS_DIR = TIMINGS_DIR / "answer"
LEVEL_TIMINGS_DIR = TIMINGS_DIR / "level"
INTRO_TIMINGS_DIR = TIMINGS_DIR / "intro"

SCENES_PATH = ROOT_DIR / "video" / "public" / "data" / "scenes.json"

QUESTION_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
ANSWER_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

QUESTION_TIMINGS_DIR.mkdir(parents=True, exist_ok=True)
ANSWER_TIMINGS_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv()

ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"
ELEVENLABS_MODEL_ID = "eleven_multilingual_v2"

AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TIMINGS_DIR.mkdir(parents=True, exist_ok=True)
SCENES_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

elevenlabs_client = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)

@lru_cache(maxsize=2)
def get_align_model(language):
    print(f"Loading alignment model for {language}...")

    return whisperx.load_align_model(
        language_code=language,
        device=DEVICE,
    )

def trim_audio_end(audio_path, seconds=0.25):
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(audio_path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )

    duration = float(result.stdout.strip())
    trimmed_duration = duration - seconds

    if trimmed_duration <= 0:
        raise ValueError(f"Audio is too short to trim {seconds} second(s).")

    temp_path = audio_path.with_name(
        f"{audio_path.stem}-trimmed{audio_path.suffix}"
    )

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(audio_path),
            "-t",
            str(trimmed_duration),
            str(temp_path),
        ],
        check=True,
    )

    temp_path.replace(audio_path)

    print(f"Trimmed {seconds}s from: {audio_path.name}")

def load_timings(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)

def generate_word_timings(audio_path, language, text, output_path):
    audio = whisperx.load_audio(str(audio_path))

    duration = len(audio) / 16000

    segments = [
        {
            "text": text,
            "start": 0.0,
            "end": duration
        }
    ]

    align_model, metadata = get_align_model(language)

    aligned_result = whisperx.align(
        segments,
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
    output_path = ANSWER_AUDIO_DIR / f"answer-{phrase_id}.wav"

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

def load_content():
    with open(PHRASES_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def generate_russian_audio(text, phrase_id):

    mp3_path = QUESTION_AUDIO_DIR / f"question-{phrase_id}.mp3"
    wav_path = QUESTION_AUDIO_DIR / f"question-{phrase_id}.wav"

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
        [ "ffmpeg", "-y","-i", str(mp3_path), str(wav_path)], check=True,
    )

    mp3_path.unlink()

    print(f"RU audio: {wav_path.name}")


def main():
    content = load_content()

    level = content["level"]
    phrases = content["phrases"]

    phrases_count = len(phrases)
    normalized_level = level.lower()

    level_audio = f"audio/level/level-{normalized_level}.wav"
    count_intro_audio = f"audio/intro/phrases-{phrases_count}.wav"

    level_audio_path = (
        LEVEL_AUDIO_DIR / f"level-{normalized_level}.wav"
    )

    level_timings_path = (
        LEVEL_TIMINGS_DIR
        / f"level-{normalized_level}.json"
    )


    count_intro_audio_path = (
        INTRO_AUDIO_DIR / f"phrases-{phrases_count}.wav"
    )

    count_intro_timings_path = (
        INTRO_TIMINGS_DIR
        / f"phrases-{phrases_count}.json"
    )

    if not level_audio_path.exists():
        raise FileNotFoundError(
            f"Level intro audio not found: {level_audio_path}"
    )

    if not level_timings_path.exists():
        raise FileNotFoundError(
            f"Level intro timings not found: {level_timings_path}"
        )

    if not count_intro_audio_path.exists():
        raise FileNotFoundError(
            f"Count intro audio not found: {count_intro_audio_path}"
        )

    if not count_intro_timings_path.exists():
        raise FileNotFoundError(
            f"Count intro timings not found: {count_intro_timings_path}"
        )

    level_word_timings = load_timings(
        level_timings_path
    )

    count_word_timings = load_timings(
        count_intro_timings_path
    )
    english_pipeline = load_english_pipeline()

    scenes = []

    for phrase in phrases:
        phrase_id = phrase["id"]
        russian = phrase["russian"]
        english = phrase["english"]

        print(f"\n[{phrase_id}]")

        russian_word_count = len(russian.split())
        english_word_count = len(english.split())

        if russian_word_count > MAX_WORDS:
            raise ValueError(
                f"Phrase {phrase_id}: Russian text has {russian_word_count} words. "
                f"Maximum is {MAX_WORDS}."
            )

        if english_word_count > MAX_WORDS:
            raise ValueError(
                f"Phrase {phrase_id}: English text has {english_word_count} words. "
                f"Maximum is {MAX_WORDS}."
            )

        generate_russian_audio(russian, phrase_id)

        russian_audio_path = QUESTION_AUDIO_DIR / f"question-{phrase_id}.wav"

        trim_audio_end(russian_audio_path, seconds=0.25)

        generate_english_audio(
            english_pipeline,
            english,
            phrase_id,
        )

        english_audio_path = ANSWER_AUDIO_DIR / f"answer-{phrase_id}.wav"

        russian_timings_path = QUESTION_TIMINGS_DIR / f"question-{phrase_id}.json"
        english_timings_path = ANSWER_TIMINGS_DIR / f"answer-{phrase_id}.json"

        generate_word_timings(
            russian_audio_path,
            "ru",
            russian,
            russian_timings_path,
        )

        generate_word_timings(
            english_audio_path,
            "en",
            english,
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
                "russianAudio": f"audio/question/question-{phrase_id}.wav",
                "englishAudio": f"audio/answer/answer-{phrase_id}.wav",
            }
        )

    video_data = {
    "level": level,
    "phraseCount": phrases_count,
    "intro": {
        "levelAudio": level_audio,
        "levelWordTimings": level_word_timings,
        "countAudio": count_intro_audio,
        "countWordTimings": count_word_timings,
    },
    "scenes": scenes,
    }

    with open(SCENES_PATH, "w", encoding="utf-8") as file: json.dump(video_data,file,ensure_ascii=False,indent=2)

    print(f"\nScenes: {SCENES_PATH.name}")


if __name__ == "__main__":
    main()