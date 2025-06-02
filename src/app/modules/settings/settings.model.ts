import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface'; // Adjust the path as necessary

const settingsSchema = new Schema<ISettings>(
  {
    privacyPolicy: {
      type: String,
      default: '<p>privacyPolicy</p>',
    },
    aboutUs: {
      type: String,
      default: '<p>aboutUs</p>',
    },
    support: {
      type: String,
      default: '<p>support</p>',
    },
    termsOfService: {
      type: String,
      default: '<p>termsOfService</p>',
    },
  },
  { timestamps: true },
);

// Create the model
const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
