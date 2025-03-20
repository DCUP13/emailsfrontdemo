export interface EmailSettings {
  smtpUsername: string;
  smtpPassword: string;
  smtpPort: string;
  smtpServer: string;
}

export interface SESEmail {
  address: string;
  testing?: boolean;
}

export interface GoogleEmail {
  address: string;
  appPassword: string;
  testing?: boolean;
}

export interface GeneralSettings {
  notifications: boolean;
  twoFactorAuth: boolean;
  newsletter: boolean;
  publicProfile: boolean;
}

export interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

export interface SettingRowProps {
  icon: React.ElementType;
  title: string;
  description: string;
  setting: string;
  checked: boolean;
  onChange: () => void;
}