export interface Profile {
  id: string
  phone: string | null
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  type: "class" | "club" | "lab" | "other"
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: "admin" | "member"
  joined_at: string
}

export interface StickyNote {
  id: string
  group_id: string
  created_by: string
  content: string
  tags: string[] | null
  is_pinned: boolean
  deadline: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  groups?: Group
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface File {
  id: string
  group_id: string
  uploaded_by: string
  filename: string
  file_type: string | null
  file_url: string
  file_size: number | null
  created_at: string
}

export interface Poll {
  id: string
  group_id: string
  created_by: string
  question: string
  options: string[]
  is_anonymous: boolean
  closes_at: string | null
  created_at: string
  profiles?: Profile
  poll_votes?: PollVote[]
}

export interface PollVote {
  id: string
  poll_id: string
  user_id: string
  option_index: number
  created_at: string
}
