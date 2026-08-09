/**
 * Simple custom i18n for the web. No external dependencies.
 * Stores the active language in localStorage and exposes a `t()` function.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const en = {
  common: {
    appName: 'MtotoCare',
    tagline: 'Provider & Admin Portal',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    logout: 'Logout',
    profile: 'Profile',
    settings: 'Settings',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    loading: 'Loading…',
    email: 'Email',
    password: 'Password',
    forgot: 'Forgot?',
    chooseLanguage: 'Language',
    loginFailed: 'Login failed',
    search: 'Search',
    refresh: 'Refresh',
  },
  users: {
    searchPlaceholder: 'Search by name or email…',
    allRoles: 'All roles',
    name: 'Name',
    phone: 'Phone',
    roles: 'Roles',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    activate: 'Activate',
    deactivate: 'Deactivate',
    editRoles: 'Edit roles',
    saveRoles: 'Save roles',
    empty: 'No users found.',
    addUser: 'Add user',
    addUserTitle: 'Create a new user',
    addUserSubtitle: 'Enter the user details. They will be created active and can sign in immediately.',
    fullName: 'Full name',
    emailLabel: 'Email',
    passwordLabel: 'Initial password',
    passwordHint: 'At least 8 characters. Share with the user through a secure channel.',
    preferredLanguage: 'Preferred language',
    pickRoles: 'Assign roles',
    userCreated: 'User created successfully',
    userDeleted: 'User deleted',
    confirmDelete: 'Delete this user? This cannot be undone.',
    yesDelete: 'Yes, delete',
  },
  nav: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    appointments: 'Appointments',
    users: 'Users',
    facilities: 'Facilities',
    audit: 'Audit Log',
    reports: 'Reports',
  },
  admin: {
    dashboard: 'Admin Dashboard',
    totalUsers: 'Total Users',
    facilities: 'Facilities',
    activeNow: 'Active Now',
    recentActivity: 'Recent Activity',
    manageUsers: 'Manage Users',
    manageFacilities: 'Manage Facilities',
    viewAudit: 'View Audit Log',
    systemSettings: 'System Settings',
  },
  provider: {
    dashboard: 'Provider Dashboard',
    myPatients: 'My Patients',
    myAppointments: 'My Appointments',
    onDuty: 'On Duty',
    offDuty: 'Off Duty',
  },
}

const sw = {
  common: {
    appName: 'MtotoCare',
    tagline: 'Mlango wa Mtoa Huduma na Msimamizi',
    signIn: 'Ingia',
    signingIn: 'Inaingia…',
    logout: 'Toka',
    profile: 'Wasifu',
    settings: 'Mipangilio',
    save: 'Hifadhi',
    saving: 'Inahifadhi…',
    cancel: 'Ghairi',
    delete: 'Futa',
    edit: 'Hariri',
    yes: 'Ndiyo',
    no: 'Hapana',
    back: 'Rudi',
    loading: 'Inapakia…',
    email: 'Barua pepe',
    password: 'Nenosiri',
    forgot: 'Umesahau?',
    chooseLanguage: 'Lugha',
    loginFailed: 'Kuingia kumeshindwa',
    search: 'Tafuta',
    refresh: 'Onyesha upya',
  },
  users: {
    searchPlaceholder: 'Tafuta kwa jina au barua pepe…',
    allRoles: 'Majukumu yote',
    name: 'Jina',
    phone: 'Simu',
    roles: 'Majukumu',
    status: 'Hali',
    actions: 'Vitendo',
    active: 'Hai',
    inactive: 'Isiyotumika',
    activate: 'Washa',
    deactivate: 'Zima',
    editRoles: 'Hariri majukumu',
    saveRoles: 'Hifadhi majukumu',
    empty: 'Hakuna watumiaji waliopatikana.',
    addUser: 'Ongeza mtumiaji',
    addUserTitle: 'Unda mtumiaji mpya',
    addUserSubtitle: 'Weka taarifa za mtumiaji. Ataundwa hai na anaweza kuingia mara moja.',
    fullName: 'Jina kamili',
    emailLabel: 'Barua pepe',
    passwordLabel: 'Nenosiri la awali',
    passwordHint: 'Angalau herufi 8. Mpe mtumiaji kupitia njia salama.',
    preferredLanguage: 'Lugha inayopendwa',
    pickRoles: 'Kagua majukumu',
    userCreated: 'Mtumiaji ameundwa',
    userDeleted: 'Mtumiaji amefutwa',
    confirmDelete: 'Futa mtumiaji huyu? Hii haiwezi kutenduliwa.',
    yesDelete: 'Ndiyo, futa',
  },
  nav: {
    dashboard: 'Dashibodi',
    patients: 'Wagonjwa',
    appointments: 'Miadi',
    users: 'Watumiaji',
    facilities: 'Vituo',
    audit: 'Kumbukumbu za Ukaguzi',
    reports: 'Ripoti',
  },
  admin: {
    dashboard: 'Dashibodi ya Msimamizi',
    totalUsers: 'Watumiaji Wote',
    facilities: 'Vituo',
    activeNow: 'Hai Sasa',
    recentActivity: 'Shughuli za Hivi Karibuni',
    manageUsers: 'Simamia Watumiaji',
    manageFacilities: 'Simamia Vituo',
    viewAudit: 'Ona Kumbukumbu za Ukaguzi',
    systemSettings: 'Mipangilio ya Mfumo',
  },
  provider: {
    dashboard: 'Dashibodi ya Mtoa Huduma',
    myPatients: 'Wagonjwa Wangu',
    myAppointments: 'Miadi Yangu',
    onDuty: 'Zamu',
    offDuty: 'Nje ya Zamu',
  },
}

const STRINGS = { en, sw }

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (k) => k,
})

export const useLanguage = () => useContext(LanguageContext)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try { return localStorage.getItem('mc_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('mc_lang', language) } catch {}
  }, [language])

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang)
  }, [])

  const t = useCallback((key, params) => {
    const parts = key.split('.')
    let v = STRINGS[language]
    for (const p of parts) {
      if (v == null) break
      v = v[p]
    }
    if (typeof v !== 'string') v = key
    if (params) {
      for (const [k, val] of Object.entries(params)) {
        v = v.replace(`{{${k}}}`, String(val))
      }
    }
    return v
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
