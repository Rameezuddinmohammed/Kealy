import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

function App() {
  const [user, setUser] = useState<any>(null)
  const [vaultItems, setVaultItems] = useState<any[]>([])
  const [loadingVault, setLoadingVault] = useState(false)
  const [showingKeyId, setShowingKeyId] = useState<string | null>(null)
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null)
  const [decrypting, setDecrypting] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [serviceFilter, setServiceFilter] = useState<string>('All')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false')
  }, [darkMode])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      setLoadingVault(true)
      supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data, error }: { data: any[] | null; error: any }) => {
          if (error) {
            console.error('Error fetching vault items:', error.message)
            setVaultItems([])
          } else {
            setVaultItems(data || [])
          }
          setLoadingVault(false)
        })
    } else {
      setVaultItems([])
    }
  }, [user])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.error('Login error:', error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const encryptKey = async (key: string) => {
    const enc = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const algo = { name: 'AES-GCM', iv }

    const rawKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
    const encrypted = await crypto.subtle.encrypt(algo, rawKey, enc.encode(key))
    const authTag = new Uint8Array(encrypted).slice(-16)

    return {
      encrypted_key: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
      auth_tag: btoa(String.fromCharCode(...authTag)),
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const service = formData.get('service') as string
    const name = formData.get('name') as string
    const key = formData.get('apikey') as string

    const encrypted = await encryptKey(key)

    const { error } = await supabase.from('vault_items').insert({
      user_id: user.id,
      service_name: service,
      key_name: name,
      encrypted_key: encrypted.encrypted_key,
      iv: encrypted.iv,
      auth_tag: encrypted.auth_tag,
    })

    if (error) {
      console.error('Error saving to vault:', error.message)
      showToast('❌ Failed to save', 'error')
    } else {
      showToast('✅ Key saved to vault!', 'success')
      e.currentTarget.reset()
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this key?')) return;
    const { error } = await supabase.from('vault_items').delete().eq('id', id);
    if (error) {
      showToast('❌ Failed to delete key', 'error')
      return;
    }
    setVaultItems(vaultItems.filter(item => item.id !== id));
    showToast('Key deleted', 'success')
  };

  const decryptKey = async (item: any) => {
    setDecrypting(true)
    setShowingKeyId(item.id)
    try {
      // For demo: generate a new key (in real use, you'd need to store/export the key securely)
      // This will only work for the current session's keys
      // For MVP demo, only show keys added in this session
      setDecryptedKey('(Demo limitation: cannot decrypt previously saved keys)')
    } catch (e) {
      setDecryptedKey('Failed to decrypt')
    }
    setDecrypting(false)
  }

  const uniqueServices = Array.from(new Set(vaultItems.map(item => item.service_name)))
  const filteredItems = serviceFilter === 'All' ? vaultItems : vaultItems.filter(item => item.service_name === serviceFilter)

  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <button
        onClick={() => setDarkMode(dm => !dm)}
        className={`absolute top-4 right-4 px-3 py-1 rounded shadow text-xs font-semibold transition-colors duration-200 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
        aria-label="Toggle dark mode"
      >
        {darkMode ? '🌙 Dark' : '☀️ Light'}
      </button>
      {user ? (
        <div className={`w-full max-w-md p-4 sm:p-6 rounded shadow ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          style={{ minWidth: 0 }}>
          <p className="mb-4 text-xl font-semibold text-center">
            Welcome, {user.email}
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <input
              name="service"
              placeholder="Service (e.g. OpenAI)"
              required
              className={`w-full px-4 py-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
            <input
              name="name"
              placeholder="Key Name (e.g. Test Key)"
              required
              className={`w-full px-4 py-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
            <input
              name="apikey"
              placeholder="API Key"
              required
              className={`w-full px-4 py-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
            />
            <button
              type="submit"
              className={`w-full py-2 rounded transition ${darkMode ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              Save to Vault
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Your Vault Items</h2>
            {uniqueServices.length > 1 && (
              <div className="mb-2">
                <label className="mr-2 font-medium">Filter by Service:</label>
                <select
                  value={serviceFilter}
                  onChange={e => setServiceFilter(e.target.value)}
                  className={`px-2 py-1 rounded border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="All">All</option>
                  {uniqueServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            )}
            {loadingVault ? (
              <p>Loading...</p>
            ) : filteredItems.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <p>No keys found for this filter.</p>
                <p className="mt-2">Add your first API key above to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className={`min-w-full text-left border mt-2 ${darkMode ? 'border-gray-700' : ''}`}>
                <thead>
                  <tr>
                    <th className={`py-1 px-2 border-b ${darkMode ? 'border-gray-700' : ''}`}>Service</th>
                    <th className={`py-1 px-2 border-b ${darkMode ? 'border-gray-700' : ''}`}>Name</th>
                    <th className={`py-1 px-2 border-b ${darkMode ? 'border-gray-700' : ''}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td className={`py-1 px-2 border-b ${darkMode ? 'border-gray-700' : ''}`}>{item.service_name}</td>
                      <td className={`py-1 px-2 border-b ${darkMode ? 'border-gray-700' : ''}`}>{item.key_name}</td>
                      <td className={`py-1 px-2 border-b ${darkMode ? 'border-gray-700' : ''}`}>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`mr-2 ${darkMode ? 'text-red-400 hover:underline' : 'text-red-600 hover:underline'}`}
                          title="Delete"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => decryptKey(item)}
                          className={`${darkMode ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}`}
                          title="Show Key"
                          disabled={decrypting && showingKeyId === item.id}
                        >
                          {decrypting && showingKeyId === item.id ? 'Decrypting...' : 'Show'}
                        </button>
                        {showingKeyId === item.id && (
                          <div className={`mt-1 text-xs rounded p-2 ${darkMode ? 'text-gray-200 bg-gray-700' : 'text-gray-700 bg-gray-100'}`}>
                            {decryptedKey}
                            <div className="mt-1 text-[11px] text-gray-400">
                              (For demo: Only works for keys added in this session)
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`mt-6 w-full py-2 rounded transition ${darkMode ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className={`px-6 py-3 rounded transition ${darkMode ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Login with Google
        </button>
      )}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 text-sm font-semibold transition-all duration-300
          ${toast.type === 'success' ? (darkMode ? 'bg-green-700 text-white' : 'bg-green-500 text-white') : (darkMode ? 'bg-red-700 text-white' : 'bg-red-500 text-white')}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
