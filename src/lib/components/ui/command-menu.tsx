"use client"

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { createContext, use, useEffect } from "react"
import { Button } from "react-aria-components/Button"
import { Dialog, OverlayTriggerStateContext } from "react-aria-components/Dialog"
import { Input } from "react-aria-components/Input"
import type { ModalOverlayProps } from "react-aria-components/Modal"
import { Modal, ModalContext, ModalOverlay } from "react-aria-components/Modal"
import { SearchField, type SearchFieldProps } from "react-aria-components/SearchField"
import { twMerge } from "tailwind-merge"
import { cx } from "@/lib/styles/primitive"
import { DropdownKeyboard, dropdownItemStyles } from "./dropdown"
import { Loader } from "./loader"

interface CommandMenuProviderProps {
  escapeButton?: boolean
  isPending?: boolean
  onQueryChange?: (value: string) => void
}

const CommandMenuContext = createContext<CommandMenuProviderProps | undefined>(undefined)

const useCommandMenu = () => {
  const context = use(CommandMenuContext)
  if (!context) {
    throw new Error("useCommandMenu must be used within a <CommandMenu />")
  }
  return context
}

const sizes = {
  xs: "sm:max-w-xs",
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
}

interface CommandMenuProps extends CommandMenuProviderProps {
  "aria-label"?: string
  children?: React.ReactNode
  className?: string
  isDismissable?: boolean
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  overlay?: Pick<ModalOverlayProps, "className">
  shortcut?: string
  size?: keyof typeof sizes
}

const CommandMenu = ({
  "aria-label": ariaLabel,
  children,
  className,
  escapeButton = true,
  isDismissable = true,
  isOpen,
  isPending,
  onOpenChange,
  onQueryChange,
  overlay,
  shortcut,
  size = "lg",
}: CommandMenuProps) => {
  useEffect(() => {
    if (!shortcut) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === shortcut && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange?.(true)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange, shortcut])

  return (
    <CommandMenuContext value={{ escapeButton, isPending, onQueryChange }}>
      <ModalContext value={{ isOpen, onOpenChange }}>
        <ModalOverlay
          isDismissable={isDismissable}
          isOpen={isOpen}
          className={cx(
            "fixed inset-0 z-50 h-(--visual-viewport-height,100vh) w-screen overflow-hidden bg-black/15",
            "grid grid-rows-[1fr_auto] justify-items-center text-center sm:grid-rows-[1fr_auto_3fr]",
            "entering:fade-in entering:animate-in entering:duration-300 entering:ease-out",
            "exiting:fade-out exiting:animate-out exiting:ease-in",
            overlay?.className,
          )}
          onOpenChange={onOpenChange}
        >
          <Modal
            className={cx(
              "row-start-2 bg-overlay text-start text-overlay-fg shadow-lg outline-none ring ring-muted-fg/15 md:row-start-1 dark:ring-border",
              "max-h-[calc(var(--visual-viewport-height)*0.8)] w-full sm:fixed sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2",
              "rounded-t-2xl md:rounded-xl",
              sizes[size],
              "entering:slide-in-from-bottom sm:entering:zoom-in-95 sm:entering:slide-in-from-bottom-0 entering:animate-in entering:duration-300 entering:ease-out",
              "exiting:slide-out-to-bottom sm:exiting:zoom-out-95 sm:exiting:slide-out-to-bottom-0 exiting:animate-out exiting:ease-in",
              className,
            )}
          >
            <Dialog
              aria-label={ariaLabel ?? "Command Menu"}
              className="flex max-h-[inherit] flex-col overflow-hidden outline-hidden"
            >
              {children}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </ModalContext>
    </CommandMenuContext>
  )
}

interface CommandMenuSearchProps extends SearchFieldProps {
  placeholder?: string
}

const CommandMenuSearch = ({ className, placeholder, ...props }: CommandMenuSearchProps) => {
  const state = use(OverlayTriggerStateContext)!
  const { escapeButton, isPending, onQueryChange } = useCommandMenu()

  return (
    <SearchField
      aria-label="Quick search"
      autoFocus
      className={cx("flex w-full items-center px-2.5 py-1", className)}
      onChange={onQueryChange}
      {...props}
    >
      {isPending ? (
        <Loader className="size-4.5" variant="spin" />
      ) : (
        <MagnifyingGlassIcon
          data-slot="command-menu-search-icon"
          className="size-5 shrink-0 text-muted-fg"
        />
      )}
      <Input
        placeholder={placeholder ?? "Search..."}
        className="w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-fg placeholder-muted-fg outline-hidden focus:outline-hidden sm:px-2 sm:py-1.5 sm:text-sm [&::-ms-reveal]:hidden [&::-webkit-search-cancel-button]:hidden"
      />
      {escapeButton && (
        <Button
          onPress={() => state?.close()}
          className="hidden cursor-default rounded border text-current/90 hover:bg-muted lg:inline lg:px-1.5 lg:py-0.5 lg:text-xs"
        >
          Esc
        </Button>
      )}
    </SearchField>
  )
}

const CommandMenuList = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    aria-label="Command results"
    className={twMerge(
      "grid max-h-full flex-1 content-start overflow-y-auto border-t p-2 sm:max-h-110 *:[[role=group]]:mb-6 *:[[role=group]]:last:mb-0",
      className,
    )}
    role="menu"
    {...props}
  />
)

interface CommandMenuSectionProps extends React.ComponentProps<"div"> {
  label?: string
}

const CommandMenuSection = ({ className, label, ...props }: CommandMenuSectionProps) => (
  <div
    aria-label={label}
    className={twMerge(
      "col-span-full grid grid-cols-[auto_1fr] content-start gap-y-0.25",
      className,
    )}
    role="group"
    {...props}
  >
    {label && (
      <div className="col-span-full mb-1 block min-w-(--trigger-width) truncate px-2.5 text-muted-fg text-xs">
        {label}
      </div>
    )}
    {props.children}
  </div>
)

interface CommandMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  textValue?: string
}

const CommandMenuItem = ({ className, textValue: _textValue, ...props }: CommandMenuItemProps) => (
  <button
    className={dropdownItemStyles({
      className: twMerge(
        "text-start hover:bg-accent hover:text-accent-fg focus-visible:bg-accent focus-visible:text-accent-fg focus-visible:outline-none",
        className,
      ),
    })}
    role="menuitem"
    type="button"
    {...props}
  />
)

interface CommandMenuDescriptionProps extends React.ComponentProps<"span"> {}

const CommandMenuDescription = ({ className, ...props }: CommandMenuDescriptionProps) => (
  <span
    className={twMerge("col-start-2 row-start-2 font-normal text-muted-fg text-sm", className)}
    slot="description"
    {...props}
  />
)

const CommandMenuSeparator = ({ className, ...props }: React.ComponentProps<"hr">) => (
  <hr className={twMerge("-mx-2", className)} {...props} />
)

const CommandMenuFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={twMerge(
      "col-span-full flex-none border-t px-2 py-1.5 text-muted-fg text-sm",
      "*:[kbd]:inset-ring *:[kbd]:inset-ring-fg/10 *:[kbd]:mx-1 *:[kbd]:inline-grid *:[kbd]:h-4 *:[kbd]:min-w-4 *:[kbd]:place-content-center *:[kbd]:rounded-xs *:[kbd]:bg-secondary",
      className,
    )}
    {...props}
  />
)

const CommandMenuLabel = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    className={twMerge("col-start-2 [&:has(+svg)]:pe-6", className)}
    slot="label"
    {...props}
  />
)

const CommandMenuShortcut = ({ className, ...props }: React.ComponentProps<typeof DropdownKeyboard>) => (
  <DropdownKeyboard
    className={twMerge(
      "gap-0.5 font-sans text-[10.5px] uppercase *:inset-ring *:inset-ring-muted-fg/20 *:grid *:size-5.5 *:place-content-center *:rounded-xs *:bg-bg",
      className,
    )}
    {...props}
  />
)

export type { CommandMenuDescriptionProps, CommandMenuProps, CommandMenuSearchProps }
export {
  CommandMenu,
  CommandMenuDescription,
  CommandMenuFooter,
  CommandMenuItem,
  CommandMenuLabel,
  CommandMenuList,
  CommandMenuSearch,
  CommandMenuSection,
  CommandMenuSeparator,
  CommandMenuShortcut,
}
