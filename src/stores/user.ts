import { defineStore } from 'pinia'

interface IUserState {
  nickName: string
  accessToken: string
  uid: string
  roleList: string[]
}

export const useUserStore = defineStore('user', {
  state: (): IUserState => ({
    nickName: sessionStorage.getItem('nick_name') || '',
    accessToken: sessionStorage.getItem('accessToken') || '',
    uid: sessionStorage.getItem('uid') || '',
    roleList: JSON.parse(sessionStorage.getItem('roleList') || '[]')
  }),
  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    hasRole: (state) => (role: string) => state.roleList.includes(role)
  },
  actions: {
    setUser(payload: Partial<IUserState>) {
      if (payload.nickName !== undefined) {
        this.nickName = payload.nickName
        sessionStorage.setItem('nick_name', payload.nickName)
      }
      if (payload.accessToken !== undefined) {
        this.accessToken = payload.accessToken
        sessionStorage.setItem('accessToken', payload.accessToken)
      }
      if (payload.uid !== undefined) {
        this.uid = payload.uid
        sessionStorage.setItem('uid', payload.uid)
      }
      if (payload.roleList !== undefined) {
        this.roleList = payload.roleList
        sessionStorage.setItem('roleList', JSON.stringify(payload.roleList))
      }
    },
    clearUser() {
      this.nickName = ''
      this.accessToken = ''
      this.uid = ''
      this.roleList = []
      sessionStorage.removeItem('nick_name')
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('uid')
      sessionStorage.removeItem('roleList')
    }
  }
})
