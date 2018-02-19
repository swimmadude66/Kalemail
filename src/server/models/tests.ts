
export interface Screenshots {
    default?: string;
    horizontal?: string;
    no_images?: string;
    horizontal_no_images?: string;
}

export interface StatusDetails {
    submitted: number;
    attempts?: number;
    completed?: number;
    bounce_code?: number;
    bounce_message?: string;

}

export interface TestResult {
    id: string;
    display_name: string;
    client: string;
    os: string;
    category: 'Application'|'Mobile'|'Web';
    browser?: string;
    screenshots?: Screenshots;
    thumbnail?: string;
    status: 'Complete'|'Processing'|'Bounced'|'Pending';
    status_details: StatusDetails;
}
