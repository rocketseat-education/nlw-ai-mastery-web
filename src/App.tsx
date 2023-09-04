import { useState } from 'react'
import { VideoUploadForm } from './components/VideoUploadForm'
import { api } from './lib/axios'
import { Loader2 } from 'lucide-react'

export function App() {
  const [videoId, setVideoId] = useState<string | null>(null)

  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

  const [titles, setTitles] = useState<string[] | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  async function generateTitles() {
    setIsGeneratingTitles(true)

    const response = await api.post<{ titles: string[] }>(
      `/videos/${videoId}/generate/titles`,
    )

    setTitles(response.data.titles)
    setIsGeneratingTitles(false)
  }

  async function generateDescription() {
    setIsGeneratingDescription(true)

    const response = await api.post<{ description: string }>(
      `/videos/${videoId}/generate/description`,
    )

    setDescription(response.data.description)
    setIsGeneratingDescription(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col gap-10 items-center justify-center antialiased p-6">
      <h1 className="text-slate-50 font-bold text-2xl">upload.ai</h1>

      {videoId === null ? (
        <VideoUploadForm onTranscriptionGenerated={setVideoId} />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <button
              type="button"
              disabled={isGeneratingDescription}
              onClick={generateDescription}
              className="bg-sky-500 w-full py-2.5 px-3 text-slate-50 font-semibold text-sm rounded-md outline-none hover:bg-sky-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500 disabled:opacity-70"
            >
              {isGeneratingDescription ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                'Generate description'
              )}
            </button>
            <textarea
              readOnly
              name="prompt"
              value={description ?? ''}
              className="w-full leading-normal bg-slate-800 rounded-md resize-y min-h-[96px] max-h-[200px] outline-none p-3 scroll-pb-3 text-sm text-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={isGeneratingTitles}
              onClick={generateTitles}
              className="bg-sky-500 w-full py-2.5 px-3 text-slate-50 font-semibold text-sm rounded-md outline-none hover:bg-sky-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500 disabled:opacity-70"
            >
              {isGeneratingTitles ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                'Generate titles'
              )}
            </button>
            <div className="space-y-1">
              {titles &&
                titles.map((title) => {
                  return (
                    <input
                      readOnly
                      key={title}
                      value={title}
                      className="w-full bg-slate-800 rounded-md outline-none px-3 py-1.5 text-sm text-slate-100 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
                    />
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
