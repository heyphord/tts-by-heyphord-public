import axios from "axios";
import { useEffect, useState } from 'react';
import { type TTSResponse } from "./fuctions/apis";

// Array of available kokoro voices
const KOKORO_VOICES = [
    "af_alloy", "af_aoede", "af_bella", "af_heart", "af_jessica", "af_kore", "af_nicole", "af_nova", "af_river", "af_sarah", "af_sky", "am_adam", "am_echo", "am_eric", "am_fenrir", "am_liam", "am_michael", "am_onyx", "am_puck", "am_santa",

    "bf_alice", "bf_emma", "bf_isabella", "bf_lily", "bm_daniel", "bm_fable", "bm_george", "bm_lewis",

    "ef_dora", "em_alex", "em_santa",

    "ff_siwis",

    "hf_alpha", "hf_beta", "hm_omega", "hm_psi",

    "if_sara", "im_nicola",

    "jf_alpha", "jf_gongitsune", "jf_nezumi", "jf_tebukuro", "jm_kumo",

    "pf_dora", "pm_alex", "pm_santa",

    "zf_xiaobei", "zf_xiaoni", "zf_xiaoxiao", "zf_xiaoyi", "zm_yunjian", "zm_yunxi", "zm_yunxia", "zm_yunyang"
]


const App = () => {
    // State for the application inputs and outputs
    const [textInput, setTextInput] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('am_echo');
    const [ttsResponse, setTTSResponse] = useState<TTSResponse>(null);
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);




    // Set the default voice to 'am_echo' on initial load, ensuring it's in the sorted list
    useEffect(() => {
        if (!KOKORO_VOICES.includes(selectedVoice)) {
            setSelectedVoice(KOKORO_VOICES[0] || 'am_echo');
        }
    }, [KOKORO_VOICES, selectedVoice]);



    /**
     * Handles the TTS generation on button press.
     */
    const handleGenerateSpeech = async () => {

        setError(null);
        setTTSResponse(null);

        const text = textInput.trim();

        if (text.length === 0) {
            setError("Please enter some text before generating speech.");
            return;
        }

        setIsGenerating(true);

        const result = await generateTTSLocal(selectedVoice, textInput);

        setTTSResponse(result);
        setIsGenerating(false);

    };

    /**
     * My custom function to Prettify the kokoro voice list
     */
    const formatVoiceName = (voice: string) => {

        const n = voice.split("_");


        //get country
        let countryLetter = n[0].charAt(0);
        let countryName = "";
        if (countryLetter == "a") {
            countryName = "American"
        } else if (countryLetter == "b") {
            countryName = "British"
        } else if (countryLetter == "j") {
            countryName = "Japanese"
        } else if (countryLetter == "z") {
            countryName = "Mandarin"
        } else if (countryLetter == "e") {
            countryName = "Spanish"
        } else if (countryLetter == "f") {
            countryName = "French"
        } else if (countryLetter == "h") {
            countryName = "Hindi"
        } else if (countryLetter == "i") {
            countryName = "Italian"
        } else if (countryLetter == "h") {
            countryName = "Hindi"
        } else if (countryLetter == "p") {
            countryName = "Brazilian Portuguese"
        } else {
            countryName = "Default"
        }

        //get gender
        let genderLetter = n[0].charAt(1);
        let genderName = genderLetter === "f" ? "Female" : "Male";


        //get name
        let name = n[1].toUpperCase();

        return `${countryName} ${genderName} - ${name}`;


    }


    /**
     * Axios api call the talk to the backend
     */

    type TTSResponse = {
        s3_path: string,
        integration_latency: string,
        success: boolean,
        message: string
    }

    let generateTTSLocal = async (voice: string, text: string): Promise<TTSResponse> => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/v1/tts/generate/local",
                {
                    text: text,
                    voice: voice,
                },
                {
                    responseType: "blob",
                }
            );

            // Returns a local blob URL for playback and download
            const url = URL.createObjectURL(response.data);
            console.log(url);

            return {
                s3_path: url,
                integration_latency: ""

            } as TTSResponse


        } catch (error: any) {
            console.error("Error generating TTS:", error.message);
            return {
                success: false,
                message: error.message,
                s3_path: "",
                integration_latency: ""
            };
        }

    }


    return (
        <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-4xl bg-white p-6 md:p-10 rounded-xl shadow-lg">
                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2 flex items-center justify-center">
                        🎙️ TTS by Hayford O.A
                    </h1>
                    <p className="text-lg text-gray-500">How i generate voices for my blog, BytesNLessons.com. Follow me for more content on AI, tech and life lessons</p>
                </header>

                <section id="tts-form" className="space-y-6">

                    {/* 1. Text Input */}
                    <div>
                        <label htmlFor="text-input" className="block text-base font-semibold text-gray-700 mb-2">Text to Speech</label>
                        <textarea
                            id="text-input"
                            rows={6}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 resize-none"
                            placeholder="Type the message you want to convert to speech here..."
                        />
                    </div>

                    {/* Configuration Row (Voice Select and Button) */}
                    <div className="flex flex-col sm:flex-row gap-6">

                        {/* 2. Voice Select Dropdown */}
                        <div className="flex-1">
                            <label htmlFor="voice-select" className="block text-base font-semibold text-gray-700 mb-2">Select Voice</label>
                            <div className="relative">
                                <select
                                    id="voice-select"
                                    value={selectedVoice}
                                    onChange={(e) => {
                                        setSelectedVoice(e.target.value)
                                    }}
                                    className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-emerald-500 transition duration-150"
                                >
                                    {KOKORO_VOICES.map(voice => (
                                        <option key={voice} value={voice}>
                                            {/* {voice} */}
                                            {formatVoiceName(voice)}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* 3. Generate Button */}
                        <div className="sm:self-end">
                            <button
                                onClick={handleGenerateSpeech}
                                disabled={isGenerating}
                                className={`w-full sm:w-auto mt-6 sm:mt-0 font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-emerald-300 
                                    ${isGenerating
                                        ? 'bg-emerald-600 cursor-not-allowed'
                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                            >
                                {isGenerating ? 'Generating....' : 'Generate Speech'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Error Message Box */}
                {error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
                        <p className="font-bold">Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* 4. Results Display Area */}
                {ttsResponse && (
                    <section id="results-area" className="mt-10 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Generation Result</h2>

                        <div id="output-box" className="space-y-4 p-5 bg-slate-100 border border-gray-300 rounded-xl">



                            {/* File Output Name */}
                            <div>

                                <p className="text-sm font-medium text-gray-600 mb-1">Download File url:</p>
                                <a href={ttsResponse.s3_path} target='_blank' id="file-output" className="text-lg font-semibold text-emerald-500 underline">
                                    {ttsResponse.s3_path}
                                </a>
                            </div>

                            {/* Audio Player */}
                            <div className="pt-2">
                                <p className="text-sm font-medium text-gray-600 mb-2">Playback Preview:</p>
                                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                                    <p className="text-gray-500 italic text-sm text-right">
                                        Click the 3 dots below to download your audio 👇🏽
                                    </p>


                                    <audio controls className="w-full mt-2" >
                                        <source src={ttsResponse.s3_path} />
                                        Your browser does not support the audio element.
                                    </audio>

                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default App;
