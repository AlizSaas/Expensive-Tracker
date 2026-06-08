import { LockKeyhole, Mail, Pencil, Save, User, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { profileStyles } from '../../data/dummyStyles';
import { useAuth } from '../context/AuthContext';
import { updateUserPassword, updateUserProfile } from '../services/api';
import { extractErrorMessage, getInitials } from '../utils';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  const initials = useMemo(() => getInitials(user?.name ?? user?.email), [user?.email, user?.name]);

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
    });
  }, [user?.email, user?.name]);

  const handleProfileSave = async () => {
    setProfileError('');
    try {
      const response = await updateUserProfile(profileForm.name, profileForm.email);
      updateUser(response.user);
      setEditingProfile(false);
    } catch (error) {
      setProfileError(extractErrorMessage(error));
    }
  };

  const handlePasswordSave = async () => {
    setPasswordError('');
    try {
      await updateUserPassword(passwordForm.oldPassword, passwordForm.newPassword);
      setEditingPassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (error) {
      setPasswordError(extractErrorMessage(error));
    }
  };

  return (
    <div className={profileStyles.container}>
      <div className={profileStyles.mainContainer}>
        <div className={profileStyles.header}>
          <div className={profileStyles.avatar}>
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
          <h1 className={profileStyles.userName}>{user?.name}</h1>
          <p className={profileStyles.userEmail}>{user?.email}</p>
        </div>

        <div className={profileStyles.content}>
          <div className={profileStyles.grid}>
            <div className={profileStyles.card}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className={profileStyles.cardTitle}>
                  <User className={profileStyles.icon} />
                  Profile Details
                </h2>
                <button className={profileStyles.editButton} onClick={() => setEditingProfile((prev) => !prev)} type="button">
                  {editingProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={profileStyles.label} htmlFor="name">
                    Name
                  </label>
                  <input
                    className={profileStyles.input}
                    disabled={!editingProfile}
                    id="name"
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
                    value={profileForm.name}
                  />
                </div>
                <div>
                  <label className={profileStyles.label} htmlFor="email">
                    Email
                  </label>
                  <input
                    className={profileStyles.input}
                    disabled={!editingProfile}
                    id="email"
                    onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                    type="email"
                    value={profileForm.email}
                  />
                </div>
                {profileError && <p className={profileStyles.errorText}>{profileError}</p>}
                {editingProfile && (
                  <div className="flex gap-3">
                    <button className={profileStyles.buttonPrimary} onClick={handleProfileSave} type="button">
                      <span className="flex items-center justify-center gap-2">
                        <Save className="h-4 w-4" />
                        Save
                      </span>
                    </button>
                    <button className={profileStyles.buttonSecondary} onClick={() => setEditingProfile(false)} type="button">
                      <span className="flex items-center justify-center gap-2">
                        <X className="h-4 w-4" />
                        Cancel
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={profileStyles.card}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className={profileStyles.cardTitle}>
                  <LockKeyhole className={profileStyles.icon} />
                  Security
                </h2>
                <button className={profileStyles.changeButton} onClick={() => setEditingPassword((prev) => !prev)} type="button">
                  {editingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {!editingPassword ? (
                <div className={profileStyles.securityItem}>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <p className={profileStyles.securityText}>Keep your account secure with a strong password.</p>
                  </div>
                  <Pencil className="h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className={profileStyles.label} htmlFor="oldPassword">
                      Current Password
                    </label>
                    <input
                      className={profileStyles.input}
                      id="oldPassword"
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
                      type="password"
                      value={passwordForm.oldPassword}
                    />
                  </div>
                  <div>
                    <label className={profileStyles.label} htmlFor="newPassword">
                      New Password
                    </label>
                    <input
                      className={profileStyles.input}
                      id="newPassword"
                      onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                      type="password"
                      value={passwordForm.newPassword}
                    />
                  </div>
                  {passwordError && <p className={profileStyles.errorText}>{passwordError}</p>}
                  <div className="flex gap-3">
                    <button className={profileStyles.buttonPrimary} onClick={handlePasswordSave} type="button">
                      Update Password
                    </button>
                    <button className={profileStyles.buttonSecondary} onClick={() => setEditingPassword(false)} type="button">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
