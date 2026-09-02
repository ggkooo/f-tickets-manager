export type ServiceOption = {
    icon: string;
    title: string;
    subtitle: string;
    fullWidth?: boolean;
    badges?: Array<{
        icon?: string;
        imageSrc?: string;
        label: string;
    }>;
};

export type FeedbackType = 'success' | 'error' | null;
