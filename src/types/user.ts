export interface UserProfile {
  id: number
  teamId: string
  email: string
  name: string
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface CheckNicknameResponse {
  available: boolean
}

export interface UpdateMeBody {
  name?: string
  image?: string | null
}

export interface ChangePasswordBody {
  currentPassword: string
  newPassword: string
}
