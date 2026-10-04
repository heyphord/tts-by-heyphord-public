from tempfile import NamedTemporaryFile
import numpy as np
import soundfile as sf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from kokoro import KPipeline
from pydantic import BaseModel
from pydub import AudioSegment

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TTSRequestDTO(BaseModel):
    text: str = "hello there, welcome to bytesnlessons.com"
    voice:str ="af_heart"


@app.post("/api/v1/tts/generate/local")
def convertText2SpeechLocal(dto: TTSRequestDTO ):

    audio = convertTextToAudioArray(dto.text, dto.voice)

    wav_path = convertAudioToWav( audio)

    mp3_path = convertWAVToMP3(wav_path)

    fileResponse = convertMP3ToFileResponse(mp3_path)

    return fileResponse


def convertTextToAudioArray(text:str, voice:str):
    print(f"🔨🛠️ Calling inference engine for tts...")
    pipeline = KPipeline(lang_code="a")
    generator = pipeline(text, voice=voice)
    print(f"✅ Done")

    # Collect waveform chunks into a NumPy array
    print(f"🔨🛠️ Converting to numpy array...")
    audio_chunks = []
    
    for _, _, chunk in generator:
        # chunk is a torch.Tensor → convert to numpy
        audio_chunks.append(chunk.cpu().numpy())

    # Concatenate into one audio array
    audio = np.concatenate(audio_chunks, axis=0)
    return audio

def convertAudioToWav(audioArray):
    sr = 24000  # Kokoro default
    print(f"🔨🛠️ Saving to temp WAV file...")
    # Save to temporary WAV file
    with NamedTemporaryFile(delete=False, suffix=".wav") as tmp_wav:
        sf.write(tmp_wav.name, audioArray, sr)
        wav_path = tmp_wav.name
    print(f"✅ Done")
    return wav_path

def convertWAVToMP3( wavAudioPath):
    print(f"🔨🛠️ Converting WAV → MP3...")
    # Step 2. Convert WAV → MP3
    with NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_mp3:
        mp3_path = tmp_mp3.name
        sound = AudioSegment.from_wav(wavAudioPath)
        sound.export(mp3_path, format="mp3")
    print(f"✅ Done")
    return mp3_path

def convertMP3ToFileResponse(mp3AudoPath):
    fileResponse = FileResponse(
        path=mp3AudoPath,
        media_type="audio/mpeg",
        filename="tts_by_heyphord.mp3"
    )

    return fileResponse
