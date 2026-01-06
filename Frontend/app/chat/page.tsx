import React from 'react'
import ChatInterface from './components/ChatInterface'
import { getUser } from '@/app/actions/auth'

import { redirect } from 'next/navigation'

export default async function ChatPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <ChatInterface user={user} />
  )
}
