import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, Check, X } from 'lucide-react'
import type { Link } from '../../types'

interface Props {
  links: Link[]
  onAdd: () => Promise<void>
  onUpdate: (id: string, updates: Partial<Link>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (links: Link[]) => Promise<void>
}

export function LinkList({ links, onAdd, onUpdate, onDelete, onReorder }: Props) {
  const [adding, setAdding] = useState(false)
  const sorted = [...links].sort((a, b) => a.position - b.position)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = sorted.findIndex((l) => l.id === active.id)
    const newIdx = sorted.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(sorted, oldIdx, newIdx).map((l, i) => ({ ...l, position: i }))
    onReorder(reordered)
  }

  async function handleAdd() {
    setAdding(true)
    await onAdd()
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sorted.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((link) => (
            <SortableLink key={link.id} link={link} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAdd}
        disabled={adding}
        className="mt-1 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50 py-2"
      >
        <span className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs">
          +
        </span>
        Add link
      </button>
    </div>
  )
}

function SortableLink({
  link,
  onUpdate,
  onDelete,
}: {
  link: Link
  onUpdate: (id: string, updates: Partial<Link>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [icon, setIcon] = useState(link.icon)
  const [deleting, setDeleting] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  async function save() {
    await onUpdate(link.id, { title, url, icon })
    setEditing(false)
  }

  function cancel() {
    setTitle(link.title)
    setUrl(link.url)
    setIcon(link.icon)
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(link.id)
  }

  if (editing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="flex gap-2 mb-2">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🔗"
            className="w-10 text-center rounded-lg border border-gray-200 bg-white px-1 py-1.5 text-sm focus:outline-none focus:border-gray-900"
            maxLength={2}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:border-gray-900"
            autoFocus
          />
        </div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:border-gray-900 mb-2"
          type="url"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={cancel} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <button onClick={save} className="p-1.5 rounded-lg text-white bg-gray-900 hover:bg-gray-700 transition-colors">
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-gray-100 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-1 -ml-1 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-lg leading-none">{link.icon || '🔗'}</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
        <p className="text-xs text-gray-400 truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
