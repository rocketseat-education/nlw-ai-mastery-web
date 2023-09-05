import { useEffect, useState } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select'
import { api } from '@/lib/axios'

interface PromptSelectProps {
  onPromptSelected: (promptId: string) => void
}

interface Prompt {
  id: string
  title: string
  template: string
}

export function PromptSelect({ onPromptSelected }: PromptSelectProps) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)

  useEffect(() => {
    api.get<{ prompts: Prompt[] }>('/prompts').then((response) => {
      setPrompts(response.data.prompts)
    })
  }, [])

  function handlePromptSelected(promptId: string) {
    const selectedPrompt = prompts?.find((prompt) => prompt.id === promptId)

    if (!selectedPrompt) {
      return
    }

    onPromptSelected(selectedPrompt.template)
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger disabled={prompts === null} className="w-full">
        <SelectValue placeholder="Selecione um prompt..." />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => {
          return (
            <SelectItem key={prompt.id} value={prompt.id}>
              {prompt.title}
            </SelectItem>
          )
        })}
        <SelectItem value="new" disabled>
          Criar novo (em breve)
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
