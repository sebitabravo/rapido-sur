"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Check, Camera } from "lucide-react"

// Predefined avatar options with emoji-style faces
export const AVATAR_OPTIONS = [
  { id: "default", emoji: "👤", bg: "bg-slate-500", label: "Por defecto" },
  { id: "avatar-1", emoji: "👨", bg: "bg-amber-500", label: "Hombre 1" },
  { id: "avatar-2", emoji: "👩", bg: "bg-pink-400", label: "Mujer 1" },
  { id: "avatar-3", emoji: "👨‍🦱", bg: "bg-orange-400", label: "Hombre rizado" },
  { id: "avatar-4", emoji: "👩‍🦱", bg: "bg-purple-400", label: "Mujer rizada" },
  { id: "avatar-5", emoji: "👨‍🦰", bg: "bg-red-400", label: "Hombre pelirrojo" },
  { id: "avatar-6", emoji: "👩‍🦰", bg: "bg-rose-400", label: "Mujer pelirroja" },
  { id: "avatar-7", emoji: "🧔", bg: "bg-stone-500", label: "Hombre con barba" },
  { id: "avatar-8", emoji: "👴", bg: "bg-gray-400", label: "Hombre mayor" },
  { id: "avatar-9", emoji: "👵", bg: "bg-gray-400", label: "Mujer mayor" },
  { id: "avatar-10", emoji: "👨‍🦲", bg: "bg-amber-600", label: "Hombre calvo" },
  { id: "avatar-11", emoji: "🧑", bg: "bg-teal-500", label: "Persona" },
  { id: "avatar-12", emoji: "🧑‍🔧", bg: "bg-blue-500", label: "Mecánico" },
]

interface AvatarSelectorProps {
  currentAvatar: string
  onSelect: (avatarId: string) => void
  disabled?: boolean
  userName?: string
}

export function getAvatarById(id: string) {
  return AVATAR_OPTIONS.find(a => a.id === id) || AVATAR_OPTIONS[0]
}

export function AvatarDisplay({ 
  avatarId, 
  size = "md", 
  userName,
  className 
}: { 
  avatarId: string
  size?: "sm" | "md" | "lg" | "xl"
  userName?: string
  className?: string
}) {
  const avatar = getAvatarById(avatarId)
  
  const sizeClasses = {
    sm: "h-8 w-8 text-lg",
    md: "h-12 w-12 text-2xl",
    lg: "h-16 w-16 text-3xl",
    xl: "h-24 w-24 text-5xl",
  }

  // Si es default, mostrar iniciales
  if (avatarId === "default" && userName) {
    const initials = userName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    
    return (
      <Avatar className={cn(sizeClasses[size], "border-2 border-background shadow-lg", className)}>
        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className={cn(sizeClasses[size], "border-2 border-background shadow-lg", avatar.bg, className)}>
      <AvatarFallback className={cn("text-white", avatar.bg)}>
        {avatar.emoji}
      </AvatarFallback>
    </Avatar>
  )
}

export function AvatarSelector({ currentAvatar, onSelect, disabled, userName }: AvatarSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(currentAvatar || "default")

  const handleSelect = (avatarId: string) => {
    setSelected(avatarId)
  }

  const handleConfirm = () => {
    onSelect(selected)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer group">
          <AvatarDisplay avatarId={currentAvatar} size="xl" userName={userName} />
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            disabled={disabled}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Avatar</DialogTitle>
          <DialogDescription>
            Elige un avatar para tu perfil. Próximamente podrás subir una foto personalizada.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">Avatares disponibles:</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleSelect(avatar.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-2 rounded-lg transition-all hover:bg-muted",
                  selected === avatar.id && "bg-muted ring-2 ring-primary"
                )}
                title={avatar.label}
              >
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center text-2xl",
                  avatar.bg
                )}>
                  {avatar.emoji}
                </div>
                {selected === avatar.id && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Guardar Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
