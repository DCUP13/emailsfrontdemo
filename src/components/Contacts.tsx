import React, { useState } from 'react';
import { Users, UserPlus, Check, X, Search, UserCheck, Clock, Mail, Upload } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  status: 'friend' | 'pending' | 'requested';
  avatar: string;
}

interface ContactsProps {
  onSignOut: () => void;
  currentView: string;
}

export function Contacts({ onSignOut, currentView }: ContactsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'friend',
      avatar: `https://source.unsplash.com/100x100/?portrait&1`,
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      status: 'pending',
      avatar: `https://source.unsplash.com/100x100/?portrait&2`,
    },
    {
      id: '3',
      name: 'Carol White',
      email: 'carol@example.com',
      status: 'requested',
      avatar: `https://source.unsplash.com/100x100/?portrait&3`,
    },
  ]);

  // Simulated app users data
  const [appUsers] = useState<User[]>([
    {
      id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      avatar: `https://source.unsplash.com/100x100/?portrait&4`,
    },
    {
      id: '5',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      avatar: `https://source.unsplash.com/100x100/?portrait&5`,
    },
    {
      id: '6',
      name: 'Frank Miller',
      email: 'frank@example.com',
      avatar: `https://source.unsplash.com/100x100/?portrait&6`,
    },
  ]);

  const handleAcceptRequest = (contactId: string) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId 
        ? { ...contact, status: 'friend' as const }
        : contact
    ));
  };

  const handleRejectRequest = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
  };

  const handleCancelRequest = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
  };

  const handleRemoveFriend = (contactId: string) => {
    setContacts(contacts.filter(contact => contact.id !== contactId));
  };

  const handleSendRequest = (user: User) => {
    if (!contacts.some(contact => contact.id === user.id)) {
      setContacts([...contacts, {
        ...user,
        status: 'requested'
      }]);
    }
  };

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(inviteEmail)) {
      setInviteError('Please enter a valid email address');
      return;
    }

    // Here you would send the invite email
    console.log('Sending invite to:', inviteEmail);
    setInviteEmail('');
    setInviteError('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const emails = event.target?.result?.toString().split('\n')
          .map(email => email.trim())
          .filter(email => validateEmail(email));
        
        if (emails) {
          // Here you would send the invite emails
          console.log('Sending invites to:', emails);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = appUsers.filter(user =>
    (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !contacts.some(contact => contact.id === user.id)
  );

  const pendingRequests = filteredContacts.filter(contact => contact.status === 'pending');
  const sentRequests = filteredContacts.filter(contact => contact.status === 'requested');
  const friends = filteredContacts.filter(contact => contact.status === 'friend');

  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Mail className="w-4 h-4 mr-2" />
            Invite Friends
          </button>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {searchQuery && filteredUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Results
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pending Requests
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {pendingRequests.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{contact.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptRequest(contact.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleRejectRequest(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sentRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sent Requests
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
              {sentRequests.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{contact.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <button
                      onClick={() => handleCancelRequest(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Friends ({friends.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
            {friends.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No friends added yet
              </div>
            ) : (
              friends.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 group">
                  <div className="flex items-center gap-4">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{contact.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Invite Friends
            </h2>
            <div className="space-y-6">
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {inviteError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{inviteError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Send Invite
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or</span>
                </div>
              </div>

              <div>
                <label className="w-full flex flex-col items-center px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload List of Emails</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">(.txt or .csv)</span>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}