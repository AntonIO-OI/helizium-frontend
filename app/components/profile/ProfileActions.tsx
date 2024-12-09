'use client';

import { 
  LucideShield, 
  LucideKey, 
  LucideEye,
  LucideMail,
  LucideLogOut
} from 'lucide-react';
import ProfileButton from './ProfileButton';

export default function ProfileActions() {
  return (
    <div className="space-y-8">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProfileButton
          label="View Topics"
          variant="primary"
          icon={LucideEye}
          onClick={() => {}}
          fullWidth
        />
        <ProfileButton
          label="View Taken"
          variant="primary"
          icon={LucideEye}
          onClick={() => {}}
          fullWidth
        />
        <ProfileButton
          label="Confirm Email"
          variant="success"
          icon={LucideMail}
          onClick={() => {}}
          fullWidth
        />
        <ProfileButton
          label="Logout"
          variant="danger"
          icon={LucideLogOut}
          onClick={() => {}}
          fullWidth
        />
      </div>

      {/* Security Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Security Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileButton
            label="Enable MFA"
            variant="secondary"
            icon={LucideShield}
            onClick={() => {}}
            fullWidth
          />
          <ProfileButton
            label="Enable TOTP"
            variant="secondary"
            icon={LucideShield}
            onClick={() => {}}
            fullWidth
          />
          <ProfileButton
            label="API Tokens"
            variant="secondary"
            icon={LucideKey}
            onClick={() => {}}
            fullWidth
          />
          <ProfileButton
            label="Change Password"
            variant="secondary"
            icon={LucideKey}
            onClick={() => {}}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
} 