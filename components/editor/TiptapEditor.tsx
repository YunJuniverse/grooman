'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { useEffect, useRef, useCallback } from 'react'
import {
  Bold, Italic, List, ListOrdered, Quote,
  Link2, Image as ImageIcon, Video, Code
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface TiptapEditorProps {
  value?: Record<string, unknown>
  onChange?: (json: Record<string, unknown>) => void
  placeholder?: string
  storageKey?: string
}

const AUTO_SAVE_KEY = 'grooman_editor_draft'
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000 // 5분

export default function TiptapEditor({ value, onChange, placeholder = '내용을 입력하세요...', storageKey }: TiptapEditorProps) {
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const key = storageKey ?? AUTO_SAVE_KEY

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, linkOnPaste: true }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
    ],
    content: value ?? loadDraft(key),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as Record<string, unknown>
      onChange?.(json)
      scheduleDraftSave(key, json)
    },
  })

  function scheduleDraftSave(k: string, json: Record<string, unknown>) {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      try { localStorage.setItem(k, JSON.stringify(json)) } catch {}
    }, 3000)
  }

  useEffect(() => () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }, [])

  const addImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (res.ok) {
        const { url } = await res.json()
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
    input.click()
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL을 입력하세요:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('YouTube URL을 입력하세요:')
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* 툴바 */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="굵게"
        >
          <Bold size={15} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="기울임"
        >
          <Italic size={15} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="인라인 코드"
        >
          <Code size={15} />
        </ToolButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="목록"
        >
          <List size={15} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="번호 목록"
        >
          <ListOrdered size={15} />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="인용"
        >
          <Quote size={15} />
        </ToolButton>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolButton onClick={addLink} title="링크 추가">
          <Link2 size={15} />
        </ToolButton>
        <ToolButton onClick={addImage} title="이미지 첨부">
          <ImageIcon size={15} />
        </ToolButton>
        <ToolButton onClick={addYoutube} title="유튜브 임베드">
          <Video size={15} />
        </ToolButton>
      </div>

      {/* 에디터 본문 */}
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolButton({
  onClick, active, title, children
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded text-gray-500 hover:bg-gray-200 transition',
        active && 'bg-gray-200 text-gray-900'
      )}
    >
      {children}
    </button>
  )
}

function loadDraft(key: string): Record<string, unknown> | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}
