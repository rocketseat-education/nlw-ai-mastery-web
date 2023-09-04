import { FormEvent, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '../lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { FileVideo, Loader2 } from 'lucide-react'
import { api } from '../lib/axios'

interface VideoUploadFormProps {
  onTranscriptionGenerated: (videoId: string) => void
}

type TranscriptionStatus =
  | 'waiting'
  | 'converting'
  | 'uploading'
  | 'generating'
  | 'success'

export function VideoUploadForm({
  onTranscriptionGenerated,
}: VideoUploadFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [transcriptionStatus, setTranscriptionStatus] =
    useState<TranscriptionStatus>('waiting')
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelected(event: FormEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(file: File) {
    console.log('[Convert] Started.')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(file))

    ffmpeg.on('progress', (progress) => {
      console.log(`[Convert] Progress: ${Math.round(progress.progress * 100)}`)
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })

    const audioFile = new File([audioFileBlob], `audio.mp3`, {
      type: 'audio/mpeg',
    })

    console.log('[Convert] Finished.')

    return audioFile
  }

  async function handleGenerateTranscription(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!videoFile) {
      return
    }

    setTranscriptionStatus('converting')

    const audioFile = await convertVideoToAudio(videoFile)

    setTranscriptionStatus('uploading')

    const data = new FormData()

    data.append('file', audioFile)

    const upload = await api.post<{ videoId: string }>('/videos', data)

    const { videoId } = upload.data

    setTranscriptionStatus('generating')

    const prompt = promptInputRef.current?.value ?? ''

    await api.post<{ videoId: string }>(`/videos/${videoId}/transcription`, {
      prompt,
    })

    setTranscriptionStatus('success')

    onTranscriptionGenerated(videoId)
  }

  const videoPreviewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form
      onSubmit={handleGenerateTranscription}
      className="w-full max-w-[440px] space-y-4"
    >
      <label className="rounded-md relative border overflow-hidden border-slate-700 flex text-sm gap-3 items-center justify-center aspect-video w-full text-slate-400 cursor-pointer transition-colors border-dashed hover:text-slate-300 hover:border-slate-600 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-sky-500">
        {videoPreviewURL ? (
          <video
            src={videoPreviewURL}
            controls={false}
            className="absolute inset-0 pointer-events-none"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Select a video file
          </>
        )}

        <input
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={handleFileSelected}
          required
        />
      </label>

      <div className="space-y-1">
        <textarea
          ref={promptInputRef}
          name="prompt"
          className="w-full leading-normal bg-slate-800 rounded-md resize-y min-h-[96px] max-h-[200px] outline-none p-3 scroll-pb-3 text-sm text-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
          placeholder="Include any technical terms, separated by commas, to help the translator achieve a better result."
          required
        />
      </div>

      <button
        type="submit"
        disabled={transcriptionStatus !== 'waiting'}
        className="bg-sky-500 w-full py-2.5 px-3 text-slate-50 font-semibold text-sm rounded-md outline-none hover:bg-sky-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500 disabled:opacity-70"
      >
        {transcriptionStatus !== 'waiting' ? (
          <Loader2 className="w-4 h-4 animate-spin inline" />
        ) : (
          'Translate'
        )}
      </button>
    </form>
  )
}
