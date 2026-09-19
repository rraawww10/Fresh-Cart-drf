import {createContext} from 'react'

// So the header can show who is logged in without asking the server again on
// every screen.
const UserContext = createContext({
  user: null,
  isLoggedIn: false,
  loadUser: () => {},
  clearUser: () => {},
})

export default UserContext
