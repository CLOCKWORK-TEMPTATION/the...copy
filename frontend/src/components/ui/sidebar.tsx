"use client"

import * as React from "react"
import * as SidebarPrimitive from "@radix-ui/react-sidebar"
import { cn } from "@/lib/utils"

/**
 * Sidebar Component
 */

const Sidebar = SidebarPrimitive.Root
const SidebarTrigger = SidebarPrimitive.Trigger
const SidebarContent = SidebarPrimitive.Content
const SidebarInset = SidebarPrimitive.Inset
const SidebarHeader = SidebarPrimitive.Header
const SidebarFooter = SidebarPrimitive.Footer
const SidebarSeparator = SidebarPrimitive.Separator
const SidebarMenu = SidebarPrimitive.Menu
const SidebarMenuButton = SidebarPrimitive.MenuButton
const SidebarMenuItem = SidebarPrimitive.MenuItem

export {
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
}
