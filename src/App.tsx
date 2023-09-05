import { Button } from './components/ui/button'
import { Label } from './components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select'
import { Separator } from './components/ui/separator'
import { Slider } from './components/ui/slider'
import { Textarea } from './components/ui/textarea'
import { Toaster } from './components/ui/toaster'
import { Github, Wand2 } from 'lucide-react'
import { VideoInputForm } from './components/video-input-form'
import { useState } from 'react'
import { PromptSelect } from './components/prompt-select'
import { useCompletion } from 'ai/react'

export function App() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [temperature, setTemperature] = useState(0.5)

  const {
    completion,
    input,
    setInput,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
    },
  })

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="px-6 py-3 flex items-center justify-between border-b">
          <h1 className="text-xl font-bold">upload.ai</h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Desenvolvido com 💜 no NLW da{' '}
              <a
                href="https://rocketseat.com.br"
                target="_blank"
                rel="noreferrer"
              >
                Rocketseat
              </a>
            </span>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="outline">
              <Github className="w-4 h-4 mr-2" />
              Github
            </Button>
          </div>
        </div>

        <main className="p-6 flex gap-6 flex-1">
          <div className="flex flex-col flex-1 gap-4">
            <div className="flex-1 grid grid-rows-2 gap-4">
              <Textarea
                className="flex-1 resize-none p-5 leading-relaxed"
                placeholder="Inclua o prompt para a IA..."
                value={input}
                onChange={handleInputChange}
              />
              <Textarea
                className="flex-1 resize-none p-5 leading-relaxed"
                readOnly
                value={completion}
                placeholder="Resultado gerado pela IA..."
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Lembre-se: você pode utilizar a variável{' '}
              <code className="text-violet-400 text-xs">{`{transcription}`}</code>{' '}
              no seu prompt para adicionar o conteúdo da transcrição do vídeo
              selecionado.
            </p>
          </div>

          <aside className="w-[300px] space-y-6">
            <VideoInputForm onTranscriptionGenerated={setVideoId} />

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Prompt</Label>
                <PromptSelect onPromptSelected={setInput} />
              </div>

              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select defaultValue="gpt3.5-turbo-16k" disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt3.5-turbo-16k">
                      GPT 3.5-turbo 16k
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground block italic">
                  Você poderá customizar essa opção em breve.
                </span>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Temperatura</Label>
                  <span className="text-xs text-muted-foreground">
                    {temperature}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                />
                <span className="text-xs text-muted-foreground block italic leading-relaxed">
                  Valores mais altos tendem a deixar o resultado mais criativo e
                  com possíveis erros.
                </span>
              </div>

              <Separator />

              <Button
                type="submit"
                disabled={isLoading || !input || !videoId}
                className="w-full"
              >
                Executar
                <Wand2 className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </aside>
        </main>
      </div>

      <Toaster />
    </>
  )
}
