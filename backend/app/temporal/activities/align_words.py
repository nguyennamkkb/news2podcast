import whisperx


async def align_words(audio_path: str, text: str, language: str = "vi") -> dict:
    """Align audio to text and return word-level timestamps."""
    device = "cpu"
    try:
        import torch
        if torch.cuda.is_available():
            device = "cuda"
    except Exception:
        pass

    model = whisperx.load_model("large-v2", device, compute_type="int8")
    audio = whisperx.load_audio(audio_path)
    result = model.transcribe(audio, batch_size=16)

    model_a, metadata = whisperx.load_align_model(
        language_code=language, device=device
    )
    result_aligned = whisperx.align(
        result["segments"], model_a, metadata, audio, device,
        return_char_alignments=False
    )

    word_segments = []
    for segment in result_aligned.get("word_segments", []) or []:
        word_segments.append({
            "word": segment.get("word", ""),
            "start": segment.get("start", 0),
            "end": segment.get("end", 0),
        })

    return {"word_segments": word_segments, "language": language}