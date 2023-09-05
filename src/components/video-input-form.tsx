import { FormEvent, ReactNode, useMemo, useRef, useState } from 'react'
import { getFFmpeg } from '../lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { CheckCircle, FileVideo, Upload } from 'lucide-react'
import { api } from '../lib/axios'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

interface VideoInputFormProps {
  onTranscriptionGenerated: (videoId: string) => void
}

type TranscriptionStatus =
  | 'waiting'
  | 'converting'
  | 'uploading'
  | 'generating'
  | 'success'

const transcriptionStatusMessages: Record<
  Exclude<TranscriptionStatus, 'waiting'>,
  ReactNode
> = {
  converting: 'Convertendo...',
  generating: 'Transcrevendo...',
  uploading: 'Carregando...',
  success: (
    <>
      Sucesso!
      <CheckCircle className="w-4 h-4 ml-2" />
    </>
  ),
} as const

export function VideoInputForm({
  onTranscriptionGenerated,
}: VideoInputFormProps) {
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
    <form onSubmit={handleGenerateTranscription} className="space-y-6">
      <div className="space-y-1">
        <label
          htmlFor="video"
          className="relative aspect-video border cursor-pointer border-dashed rounded-md text-sm flex flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
        >
          {videoPreviewURL ? (
            <video
              src={videoPreviewURL}
              controls={false}
              className="pointer-events-none absolute inset-0"
            />
          ) : (
            <>
              <FileVideo className="w-4 h-4" />
              Selecione um vídeo
            </>
          )}
        </label>

        <input
          type="file"
          id="video"
          accept="video/*"
          className="sr-only"
          onChange={handleFileSelected}
          required
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          disabled={transcriptionStatus !== 'waiting'}
          className="h-[80px] leading-relaxed"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>

      <Button
        type="submit"
        className="w-full data-[status=success]:bg-emerald-400"
        data-status={transcriptionStatus}
        disabled={transcriptionStatus !== 'waiting'}
      >
        {transcriptionStatus === 'waiting' ? (
          <>
            Carregar vídeo
            <Upload className="ml-2 w-4 h-4" />
          </>
        ) : (
          transcriptionStatusMessages[transcriptionStatus]
        )}
      </Button>
    </form>
  )
}
