import { BloodGroup } from './bloodRequest';
import { Gender } from './user';


export type DonorSignupData = {
    first_name: string;
    last_name: string;
    phone: string;
    gender: Gender | '';
    birth_date: string;
    last_donation_date: string;
    blood_group: BloodGroup | '';
    latitude: string;
    longitude: string;
    address: string;
};
