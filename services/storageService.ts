
import { JobApplication, UserProfile } from '../types';

const APPS_KEY = 'hiretrace_apps_v1';
const PROFILE_KEY = 'hiretrace_profile_v1';

export const storageService = {
  getApplications: (): JobApplication[] => {
    const data = localStorage.getItem(APPS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveApplications: (apps: JobApplication[]): void => {
    localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  },
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : { name: '', masterResume: '', theme: 'light' };
  },
  saveProfile: (profile: UserProfile): void => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
};
