import { createContext, useContext, useState } from 'react';

const UserProfileContext = createContext();

export const UserProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);

  const saveProfile = (data) => setProfile(data);
  const clearProfile = () => setProfile(null);

  return (
    <UserProfileContext.Provider value={{ profile, saveProfile, clearProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);